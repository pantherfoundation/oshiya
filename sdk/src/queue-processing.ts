// SPDX-License-Identifier: MIT
// SPDX-FileCopyrightText: Copyright 2024 Panther Protocol Foundation

import crypto from 'crypto';

import {utils} from 'ethers';

import {bigintToBytes32} from './bigint-conversions';
import {LogFn, log as defaultLog} from './logging';
import {MemCache} from './mem-cache';
import {Miner} from './miner';
import {
    MinerTree,
    calculateDegenerateTreeRoot,
    calculateBatchRoot,
    fillEmptyUTXOs,
} from './miner-tree';
import {UtxoBusQueuedEvent, ProofInputs} from './types';

const SNARK_FIELD_SIZE =
    21888242871839275222246405745257275088548364400416034343698204186575808495617n;

const generateRandom256Bits = (): bigint => {
    const min =
        6350874878119819312338956282401532410528162663560392320966563075034087161851n;
    let randomness;
    // eslint-disable-next-line no-constant-condition
    while (true) {
        randomness = BigInt('0x' + crypto.randomBytes(32).toString('hex'));
        if (randomness >= min) break;
    }
    return randomness;
};

export class QueueProcessing {
    private log: LogFn;

    constructor(
        private miner: Miner,
        private db: MemCache,
        log: LogFn = defaultLog,
    ) {
        this.log = log;
    }

    async fetchAndHandleQueueAndUtxos() {
        this.log('Fetching the queue with the highest reward.');

        const queue = await this.miner.getHighestRewardQueue();
        if (!queue) {
            this.log(
                'No queue found yet that meets criteria of the minimum reward',
            );
            return null;
        }

        this.log(
            `Found the highest reward queue. ID: ${
                queue.queueId
            }, Reward: ${utils.formatEther(queue.reward)}`,
        );

        this.log(`Fetching UTXOs for queue id: ${queue.queueId}`);
        const utxos = this.db.getUtxosForQueueId(queue.queueId);

        if (!utxos || utxos.length === 0) {
            this.log('No UTXOs found for that queue');
            return null;
        }

        this.log(`Fetched ${utxos.length} UTXOs for the queue`);
        return {queue, utxos};
    }

    prepareProofForQueue(
        minerAddress: string,
        copyOfTree: MinerTree,
        utxoBusQueuedEvents: UtxoBusQueuedEvent[],
        queueId: number,
    ): ProofInputs {
        this.log('Preparing proof for queue');
        const utxos = utxoBusQueuedEvents.map(u => u.utxo);
        const newLeafs = fillEmptyUTXOs(utxos);
        const batchRoot = calculateBatchRoot(newLeafs);
        copyOfTree.insertLeaf(batchRoot);
        const queueRoot = calculateDegenerateTreeRoot(utxos);
        const random = generateRandom256Bits() % SNARK_FIELD_SIZE;

        const extraInput = utils.solidityPack(
            ['address', 'uint32'],
            [minerAddress, queueId],
        ) as string;

        const extraInputHash =
            BigInt(utils.keccak256(extraInput)) % SNARK_FIELD_SIZE;

        const proofInputs: ProofInputs = {
            oldRoot: copyOfTree.prevRoot,
            newRoot: copyOfTree.root,
            replacedNodeIndex: copyOfTree.leafInd,
            pathElements: copyOfTree.siblings,
            newLeafsCommitment: queueRoot,
            nNonEmptyNewLeafs: utxoBusQueuedEvents.length,
            newLeafs,
            batchRoot,
            branchRoot: copyOfTree.branchRoot,
            extraInput: bigintToBytes32(extraInputHash),
            magicalConstraint: bigintToBytes32(random),
        };

        this.log('Proof for queue prepared');
        return proofInputs;
    }
}
