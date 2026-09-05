// SPDX-License-Identifier: MIT
// SPDX-FileCopyrightText: Copyright 2024 Panther Protocol Foundation

import type {EventFilter} from 'ethers';
import {utils} from 'ethers';

import {ForestTree} from './contract/forest-types';
import {initializeReadOnlyBusContract} from './contracts';
import {LogFn, log as defaultLog} from './logging';
import {MemCache} from './mem-cache';
import {Subgraph} from './subgraph';
import {BusBatchOnboardedEventRecord, UtxoBusQueuedEventRecord} from './types';

const PAGE_SIZE = 1_000; // Amount of blocks to scan at once

export class EventScanner {
    private contract: ForestTree;
    private subgraph: Subgraph;
    private db: MemCache;
    private filters: EventFilter[];
    private startingBlock: number;
    private log: LogFn;

    constructor(
        rpcEndpoint: string,
        address: string,
        subgraphUrl: string,
        startingBlock: number,
        db: MemCache,
        log: LogFn = defaultLog,
        private readonly pageSize: number = PAGE_SIZE,
        subgraphAuthToken?: string,
    ) {
        if (!Number.isSafeInteger(pageSize) || pageSize <= 0) {
            throw new Error('Page size must be a positive integer');
        }
        this.contract = initializeReadOnlyBusContract(rpcEndpoint, address);
        this.subgraph = new Subgraph(subgraphUrl, subgraphAuthToken);
        this.filters = [
            this.buildUtxoBusQueuedFilter(),
            this.buildBusBatchOnboardedFilter(),
        ];
        this.db = db;
        this.startingBlock = startingBlock;
        this.log = log;
    }

    /**
     * Brings the cache up to the chain tip from both sources, cheapest first.
     *
     * The subgraph half moves the cursor to the projection's watermark, so the
     * chain half only ever covers the tail the projection has not reached yet.
     */
    public async scan(): Promise<void> {
        await this.syncFromSubgraph();
        await this.scanChain();
    }

    /**
     * Loads every queued utxo and onboarded batch the projection already holds
     * into the cache, and moves the cursor to its watermark -- everything at or
     * below that block is covered here.
     *
     * This is the same data `scanChain` rebuilds from `eth_getLogs`, except it
     * arrives in a couple of paged queries instead of thousands of sequential
     * 1000-block windows. Order does not matter: `MemCache` keys batches by
     * queueId and dedupes utxos on `utxoIndexInBatch`.
     *
     * It runs every cycle rather than once at startup, because it is the only
     * half that cannot wedge. A page `eth_getLogs` will not serve -- a block
     * range or response size over the provider's limit -- leaves the cursor
     * parked on that page, and every later cycle reissues the identical
     * rejected request. Nothing then reaches the cache for the life of the
     * process: `getUtxosForQueueId` keeps returning empty for a queue that has
     * utxos on chain, the miner reports `No UTXOs found for that queue`, and it
     * takes a restart to mine anything again. Refreshing from the projection
     * each cycle both fills the cache and carries the cursor past the page the
     * provider refused.
     */
    private async syncFromSubgraph(): Promise<void> {
        try {
            const indexedBlock = await this.subgraph.getIndexedBlockNumber();
            if (indexedBlock < 0) {
                this.log(
                    'Subgraph cannot report its indexing progress; ' +
                        'covering every block by scanning the chain',
                );
                return;
            }
            if (indexedBlock <= this.startingBlock) return;

            const fromBlock = this.startingBlock;
            const [utxos, batches] = await Promise.all([
                this.subgraph.getQueuedUtxosSince(fromBlock),
                this.subgraph.getOnboardedBatchesSince(fromBlock),
            ]);

            for (const batch of batches) {
                this.db.storeEventBusBatchOnBoarded(batch);
            }
            for (const utxo of utxos) {
                this.db.storeEventUtxoBusQueued(utxo);
            }

            this.startingBlock = indexedBlock + 1;
            this.log(
                `Loaded ${utxos.length} utxos and ${batches.length} batches ` +
                    `from the subgraph (${fromBlock} - ${indexedBlock}); ` +
                    `chain scanning resumes at ${this.startingBlock}`,
            );
        } catch (error: any) {
            // Leaves the cursor where it was, so the chain scan below still
            // covers these blocks -- one window at a time instead of in bulk.
            this.log(`Error syncing from the subgraph: ${error.message}`);
        }
    }

    private async scanChain(): Promise<void> {
        try {
            this.log('Getting the current block number...');
            const currentBlock = Number(
                await this.contract.provider.getBlockNumber(),
            );
            const totalBlocks = currentBlock - this.startingBlock;
            let scannedBlocks = 0;

            for (
                let i = this.startingBlock;
                i < currentBlock;
                i += this.pageSize
            ) {
                const endBlock = Math.min(i + this.pageSize, currentBlock);
                const progress = Math.floor(
                    (scannedBlocks / totalBlocks) * 100,
                );
                this.log(
                    `Scanning block range ${i} - ${endBlock} [${progress}%]`,
                );
                await this.scanBlockRangeAndSave(i, endBlock);
                this.startingBlock = endBlock;
                scannedBlocks += endBlock - i;
            }

            this.log('Scan completed [100%]');
        } catch (error: any) {
            this.log(`Error scanning: ${error.message}`);
        }
    }

    private async scanBlockRangeAndSave(
        fromBlock: number,
        toBlock: number,
    ): Promise<void> {
        // Keep track of events found per filter
        const eventCounts: Record<string, number> = {};

        for (const filter of this.filters) {
            let logs;
            try {
                logs = await this.contract.queryFilter(
                    filter,
                    fromBlock,
                    toBlock,
                );

                // Keep track of how many events we found for this filter
                const filterKey = String(filter.topics?.[0]) || 'unknown';
                eventCounts[filterKey] = logs.length;

                for (const log of logs) {
                    const parsed = this.contract.interface.parseLog(log);
                    if (parsed.name === 'BusBatchOnboarded') {
                        const eventRecord =
                            this.mapBusBatchOnboardedEvent(parsed);
                        this.db.storeEventBusBatchOnBoarded(eventRecord);
                    } else if (parsed.name === 'UtxoBusQueued') {
                        const eventRecord = this.mapUtxoBusQueuedEvent(parsed);
                        this.db.storeEventUtxoBusQueued(eventRecord);
                    }
                }
            } catch (error: any) {
                this.log(`Error querying filter: ${error.message}`);
                // Re-throw the error to trigger retry mechanism
                throw error;
            }
        }

        // Log summary of events found
        const totalEvents = Object.values(eventCounts).reduce(
            (sum, count) => sum + count,
            0,
        );
        this.log(
            `Found ${totalEvents} events in block range ${fromBlock}-${toBlock}`,
        );
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

    private buildEventFilter(eventSignature: string): EventFilter {
        return {
            address: this.contract.address,
            topics: [utils.id(eventSignature)],
        };
    }

    private buildUtxoBusQueuedFilter(): EventFilter {
        return this.buildEventFilter('UtxoBusQueued(bytes32,uint256,uint256)');
    }

    private buildBusBatchOnboardedFilter(): EventFilter {
        return this.buildEventFilter(
            'BusBatchOnboarded(uint256,bytes32,uint256,uint256,bytes32,bytes32)',
        );
    }

    private mapUtxoBusQueuedEvent(parsedLog: any): UtxoBusQueuedEventRecord {
        return {
            queueId: parsedLog.args.queueId.toNumber(),
            utxo: parsedLog.args.utxo,
            utxoIndexInBatch: parsedLog.args.utxoIndexInBatch.toNumber(),
        };
    }
}
