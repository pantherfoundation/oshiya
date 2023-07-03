// SPDX-License-Identifier: BUSL-1.1
// SPDX-FileCopyrightText: Copyright 2021-22 Panther Ventures Limited Gibraltar

import {log} from './logging';
import {MinerTree} from './miner-tree';
import {Subgraph} from './subgraph';
import {BusBatchOnboardedEvent} from './types';

export class BatchProcessing {
    tree: MinerTree;

    constructor() {
        this.tree = new MinerTree();
    }

    async fetchOnboardedBatches(
        subgraph: Subgraph,
        lastInsertedBatchIndex: number,
    ): Promise<Array<any>> {
        try {
            log(
                `Fetching new batches from index ${lastInsertedBatchIndex + 1}`,
            );
            return await subgraph.getOnboardedBatches(
                lastInsertedBatchIndex + 1,
            );
        } catch (e) {
            log(`Error: fetching new batches ${e}`);
            return [];
        }
    }

    insertBatchesAndLog(filledBatches: Array<BusBatchOnboardedEvent>): void {
        filledBatches.sort(
            (a, b) => a.leftLeafIndexInBusTree - b.leftLeafIndexInBusTree,
        );
        filledBatches.forEach(batch => {
            log(
                `Inserting batch with leftLeafIndexInBusTree: ${batch.leftLeafIndexInBusTree}`,
            );
            this.tree.insertBatch(batch);
        });
        log(
            `Inserted ${filledBatches.length} new batches. New BusTree root: ${this.tree.root}`,
        );
    }

    async checkInsertedBatchesAndUpdateMinerTree(subgraph: Subgraph) {
        log('Checking for new inserted batches in the Subgraph.');
        const newFilledBatches = await this.fetchOnboardedBatches(
            subgraph,
            this.tree.leafInd,
        );
        if (newFilledBatches && newFilledBatches.length > 0) {
            log(
                `Found ${newFilledBatches.length} new batches. Inserting them.`,
            );
            this.insertBatchesAndLog(newFilledBatches);
        } else {
            log('There are no new inserted batches yet in the Subgraph.');
        }
    }
}
