// SPDX-License-Identifier: BUSL-1.1
// SPDX-FileCopyrightText: Copyright 2021-22 Panther Ventures Limited Gibraltar

import {log} from './logging';
import {BusBatchOnboardedEventRecord, UtxoBusQueuedEventRecord} from './types';

export class MemCache {
    private busBatchOnBoarded: Record<string, BusBatchOnboardedEventRecord> =
        {};
    private utxos: Record<number, UtxoBusQueuedEventRecord[]> = {};
    private insertedQueueIds: Set<number> = new Set();

    constructor(insertedQueueIds: number[] = []) {
        insertedQueueIds.forEach(id => this.insertedQueueIds.add(id));
    }

    storeEventBusBatchOnBoarded(rec: BusBatchOnboardedEventRecord): void {
        this.busBatchOnBoarded[rec.queueId.toString()] = rec;
        log(`Stored BusBatch ${rec.batchIndex} in MemCache`);
    }

    storeEventUtxoBusQueued(rec: UtxoBusQueuedEventRecord): void {
        if (!this.utxos[rec.queueId]) {
            this.utxos[rec.queueId] = [];
        }
        this.utxos[rec.queueId].push(rec);
        log(`Stored utxo for queueId ${rec.queueId} in MemCache`);
    }

    setBusBatchIsOnboarded(queueId: number): void {
        this.insertedQueueIds.add(queueId);
        log(`Updated BusBatch record ${queueId} in MemCache`);
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
