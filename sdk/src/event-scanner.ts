// SPDX-License-Identifier: BUSL-1.1
// SPDX-FileCopyrightText: Copyright 2021-22 Panther Ventures Limited Gibraltar

import {BusTree} from './contract/bus-tree-types';
import {initializeReadOnlyBusContract} from './contracts';
import {LogFn, log as defaultLog} from './logging';
import {MemCache} from './mem-cache';
import {BusBatchOnboardedEventRecord, UtxoBusQueuedEventRecord} from './types';

const PAGE_SIZE = 1000; // Amount of blocks to scan at once

export class EventScanner {
    private contract: BusTree;
    private eventTopics: any;
    private db: MemCache;
    private lastScannedBlock: number;
    private log: LogFn;

    constructor(
        rpcEndpoint: string,
        address: string,
        lastScannedBlock: number,
        db: MemCache,
        log: LogFn = defaultLog,
    ) {
        this.contract = initializeReadOnlyBusContract(rpcEndpoint, address);
        this.eventTopics = this.buildEventTopics();
        this.db = db;
        this.lastScannedBlock = lastScannedBlock;
        this.log = log;
    }

    private buildEventTopics() {
        const f1 = this.contract.filters.BusBatchOnboarded();
        const f2 = this.contract.filters.UtxoBusQueued();
        return f1.topics!.concat(f2.topics!);
    }

    public async scan(): Promise<void> {
        try {
            this.log('Getting the current block number...');
            const currentBlock = Number(
                await this.contract.provider.getBlockNumber(),
            );
            for (
                let i = this.lastScannedBlock;
                i < currentBlock;
                i += PAGE_SIZE
            ) {
                const endBlock = Math.min(i + PAGE_SIZE, currentBlock);
                this.log(`Scanning block range ${i} - ${endBlock}`);
                await this.scanBlockRangeAndSave(i, endBlock);
                this.lastScannedBlock = endBlock;
            }
        } catch (error: any) {
            this.log(`Error scanning: ${error.message}`);
        }
    }

    private async scanBlockRangeAndSave(
        fromBlock: number,
        toBlock: number,
    ): Promise<void> {
        const filter = this.buildFilter();

        try {
            const logs = await this.contract.queryFilter(
                filter,
                fromBlock,
                toBlock,
            );

            for (const log of logs) {
                const parsed = this.contract.interface.parseLog(log);
                if (parsed.name === 'BusBatchOnboarded') {
                    const eventRecord = this.mapBusBatchOnboardedEvent(parsed);
                    this.db.storeEventBusBatchOnBoarded(eventRecord);
                } else if (parsed.name === 'UtxoBusQueued') {
                    const eventRecord = this.mapUtxoBusQueuedEvent(parsed);
                    this.db.storeEventUtxoBusQueued(eventRecord);
                }
            }
        } catch (error: any) {
            this.log(`Error scanning block range: ${error.message}`);
        }
    }

    private buildFilter() {
        return this.eventTopics.map((t: any) => ({
            address: this.contract.address,
            topics: t,
        }));
    }

    private mapBusBatchOnboardedEvent(
        parsedLog: any,
    ): BusBatchOnboardedEventRecord {
        const leftLeafIndexInBusTree =
            parsedLog.args.leftLeafIndexInBusTree.toNumber();
        return {
            queueId: BigInt(parsedLog.args.queueId),
            batchRoot: BigInt(parsedLog.args.batchRoot),
            numUtxosInBatch: parsedLog.args.numUtxosInBatch.toNumber(),
            leftLeafIndexInBusTree,
            busTreeNewRoot: parsedLog.args.busTreeNewRoot,
            busBranchNewRoot: parsedLog.args.busBranchNewRoot,
            batchIndex: leftLeafIndexInBusTree >> 6,
            branchIndex: leftLeafIndexInBusTree >> 16,
            isInserted: false,
        };
    }

    private mapUtxoBusQueuedEvent(parsedLog: any): UtxoBusQueuedEventRecord {
        return {
            queueId: parsedLog.args.queueId.toNumber(),
            utxo: parsedLog.args.utxo,
            utxoIndexInBatch: parsedLog.args.utxoIndexInBatch.toNumber(),
        };
    }
}
