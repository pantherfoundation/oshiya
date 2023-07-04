// SPDX-License-Identifier: BUSL-1.1
// SPDX-FileCopyrightText: Copyright 2021-22 Panther Ventures Limited Gibraltar

import {LogFn, log as defaultLog} from './logging';
import {MemCache} from './mem-cache';
import {Miner} from './miner';
import {
    MinerTree,
    calculateDegenerateTreeRoot,
    calculateBatchRoot,
} from './miner-tree';
import {UtxoBusQueuedEvent, ProofInputs} from './types';

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
            this.log('No queue found yet');
            return null;
        }

        this.log(
            `Found the highest reward queue. ID: ${queue.queueId}, Reward: ${queue.reward}`,
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
        utxos: UtxoBusQueuedEvent[],
    ): ProofInputs {
        this.log('Preparing proof for queue');
        const batchRoot = calculateBatchRoot(utxos.map(u => u.utxo));
        copyOfTree.insertLeaf(batchRoot);
        const queueRoot = calculateDegenerateTreeRoot(utxos.map(u => u.utxo));

        const proofInputs: ProofInputs = {
            oldRoot: copyOfTree.prevRoot,
            newRoot: copyOfTree.root,
            replacedNodeIndex: copyOfTree.leafInd,
            pathElements: copyOfTree.siblings,
            newLeafsCommitment: queueRoot,
            nNonEmptyNewLeafs: utxos.length,
            newLeafs: utxos.map((u: UtxoBusQueuedEvent) => u.utxo),
            batchRoot,
            branchRoot: copyOfTree.branchRoot,
            extraInput: minerAddress,
            magicalConstraint: '0xFF00FF00FF00FF00FF00FF00FF00FF00FF00FF00',
        };

        this.log('Proof for queue prepared');
        return proofInputs;
    }
}
