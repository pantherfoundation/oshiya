// SPDX-License-Identifier: MIT
// SPDX-FileCopyrightText: Copyright 2024 Panther Protocol Foundation

import {EventScanner} from './event-scanner';
import {LogFn, log as defaultLog} from './logging';
import {MemCache} from './mem-cache';
import {MinerTree} from './miner-tree';
import {BusBatchOnboardedEvent} from './types';

export class BatchProcessing {
    private log: LogFn;

    constructor(
        public tree: MinerTree,
        private scanner: EventScanner,
        private db: MemCache,
        log: LogFn = defaultLog,
    ) {
        this.scanner = scanner;
        this.log = log;
    }

    insertBatchesAndLog(filledBatches: Array<BusBatchOnboardedEvent>): void {
        filledBatches.sort(
            (a, b) => a.leftLeafIndexInBusTree - b.leftLeafIndexInBusTree,
        );
        filledBatches.forEach(batch => {
            this.log(
                `Inserting batch with leftLeafIndexInBusTree: ${batch.leftLeafIndexInBusTree}`,
            );
            this.tree.insertBatch(batch);
            this.db.setBusBatchIsOnboarded(Number(batch.queueId));
            console.log('batch inserted, new root: ', this.tree.root);
        });
        this.log(
            `Inserted ${filledBatches.length} new batches. New BusTree root: ${this.tree.root}`,
        );
    }

    async checkInsertedBatchesAndUpdateMinerTree() {
        await this.scanner.scan();
        const newFilledBatches = this.db.getNotInsertedBusBatches();
        if (newFilledBatches && newFilledBatches.length > 0) {
            this.log(
                `Found ${newFilledBatches.length} new batches. Inserting them.`,
            );
            this.insertBatchesAndLog(newFilledBatches);
        } else {
            this.log('There are no new inserted batches yet.');
        }
    }

    setBusBatchIsOnboarded(queueId: number) {
        this.db.setBusBatchIsOnboarded(queueId);
    }
}
