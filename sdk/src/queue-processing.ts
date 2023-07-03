// SPDX-License-Identifier: BUSL-1.1
// SPDX-FileCopyrightText: Copyright 2021-22 Panther Ventures Limited Gibraltar

import {log} from './logging';
import {Miner} from './miner';
import {
    MinerTree,
    calculateDegenerateTreeRoot,
    calculateBatchRoot,
} from './miner-tree';
import {Subgraph} from './subgraph';
import {UtxoBusQueuedEvent, ProofInputs} from './types';

export class QueueProcessing {
    async fetchAndHandleQueueAndUtxos(miner: Miner, subgraph: Subgraph) {
        log('Fetching the queue with the highest reward.');
        const queue = await miner.getHighestRewardQueue();
        if (!queue) {
            log('No queue found yet');
            return null;
        }

        log(
            `Found the highest reward queue. ID: ${queue.queueId}, Reward: ${queue.reward}`,
        );

        log(`Fetching UTXOs for queue id: ${queue.queueId}`);
        const utxos = await subgraph.getUtxosForQueueId(queue.queueId);
        if (!utxos || utxos.length === 0) {
            log('No UTXOs found for that queue');
            return null;
        }

        log(`Fetched ${utxos.length} UTXOs for the queue`);
        return {queue, utxos};
    }

    prepareProofForQueue(
        minerAddress: string,
        copyOfTree: MinerTree,
        utxos: UtxoBusQueuedEvent[],
    ): ProofInputs {
        log('Preparing proof for queue');
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

        log('Proof for queue prepared');
        return proofInputs;
    }
}
