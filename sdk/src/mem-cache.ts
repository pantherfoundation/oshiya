// SPDX-License-Identifier: MIT
// SPDX-FileCopyrightText: Copyright 2024 Panther Protocol Foundation

import {LogFn, log as defaultLog} from './logging';
import {BusBatchOnboardedEventRecord, UtxoBusQueuedEventRecord} from './types';

export class MemCache {
    private busBatchOnBoarded: Record<string, BusBatchOnboardedEventRecord> =
        {};
    private utxos: Record<number, UtxoBusQueuedEventRecord[]> = {};
    private insertedQueueIds: Set<number> = new Set();
    private log: LogFn;

    constructor(insertedQueueIds: number[] = [], log: LogFn = defaultLog) {
        insertedQueueIds.forEach(id => this.insertedQueueIds.add(id));
        this.log = log;
    }

    storeEventBusBatchOnBoarded(rec: BusBatchOnboardedEventRecord): void {
        this.busBatchOnBoarded[rec.queueId.toString()] = rec;
        this.log(`Stored BusBatch ${rec.batchIndex} in MemCache`);
    }

    storeEventUtxoBusQueued(rec: UtxoBusQueuedEventRecord): void {
        if (!this.utxos[rec.queueId]) {
            this.utxos[rec.queueId] = [];
        }
        // FIXME: this a temporary fix for the issue where the same UTXO is
        // added to the queue twice
        const insertedIndices = this.utxos[rec.queueId].map(
            u => u.utxoIndexInBatch,
        );
        if (!insertedIndices.includes(rec.utxoIndexInBatch)) {
            this.utxos[rec.queueId].push(rec);
            this.log(`Stored utxo for queueId ${rec.queueId} in MemCache`);
        }
    }

    setBusBatchIsOnboarded(queueId: number): void {
        this.insertedQueueIds.add(queueId);
        this.log(`Updated BusBatch record ${queueId} in MemCache`);
    }

    getUtxosForQueueId(queueId: number): UtxoBusQueuedEventRecord[] {
        return this.utxos[queueId] || [];
    }

    getNotInsertedBusBatches(): BusBatchOnboardedEventRecord[] {
        return Object.values(this.busBatchOnBoarded).filter(
            utxo => !this.insertedQueueIds.has(Number(utxo.queueId)),
        );
    }
}
