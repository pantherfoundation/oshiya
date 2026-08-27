// SPDX-License-Identifier: MIT
// SPDX-FileCopyrightText: Copyright 2024 Panther Protocol Foundation

import axios from 'axios';

import {
    BusBatchOnboardedEvent,
    BusBatchOnboardedEventRecord,
    BranchFilledEvent,
    UtxoBusQueuedEventRecord,
} from './types';

const PAGINATION_WINDOW_SIZE = 1000;
const REQUEST_ATTEMPTS = 4;
const RETRY_BASE_DELAY_MS = 1000;
// Bounds a stalled connection. Address-level failover is the runtime's job:
// from Node 20 `autoSelectFamily` is on by default, so `net` walks every
// address `dns.lookup` returns instead of giving up on the first. That is why
// the miner requires Node 24 -- see `assertNodeVersion`.
const REQUEST_TIMEOUT_MS = 15_000;

function delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// Retried only for transport failures; a GraphQL error is deterministic and
// would just fail the same way again.
function isTransportError(error: unknown): boolean {
    return axios.isAxiosError(error) && error.response === undefined;
}

// Handles all Subgraph API requests
async function requestSubgraph(url: string, query: string): Promise<any> {
    let lastError: unknown;

    for (let attempt = 0; attempt < REQUEST_ATTEMPTS; attempt++) {
        try {
            const response = await axios.post(
                url,
                {query},
                {timeout: REQUEST_TIMEOUT_MS},
            );

            if (response.data.errors?.[0]?.message || response.status !== 200) {
                console.error(response.data.errors?.[0]?.message);
                throw new Error('Cannot fetch data from the subgraph');
            }

            return response.data.data;
        } catch (error) {
            if (!isTransportError(error)) throw error;
            lastError = error;
            await delay(RETRY_BASE_DELAY_MS * (attempt + 1));
        }
    }

    throw lastError;
}

// Subgraph GraphQL Query Builder
class QueryBuilder {
    constructor(
        private fields: string[],
        private queryName: string,
        private options: string = '',
    ) {}

    build(): string {
        // `_meta` takes no arguments, and an empty argument list is a syntax
        // error rather than a no-op.
        const args = this.options ? `(${this.options})` : '';
        return `
        query{
            ${this.queryName}${args} {
                ${this.fields.join('\n')}
            }
        }
        `;
    }
}

export class Subgraph {
    private readonly url: string;

    constructor(url: string) {
        this.url = url;
    }

    private async fetchFromSubgraph(queryBuilder: QueryBuilder): Promise<any> {
        return await requestSubgraph(this.url, queryBuilder.build());
    }

    public async getFilledBranches(): Promise<BranchFilledEvent[]> {
        const queryBuilder = new QueryBuilder(
            ['branchIndex', 'busBranchFinalRoot'],
            'busBranchFilleds',
            'first: 1000, orderBy: branchIndex, orderDirection: asc',
        );

        const data = await this.fetchFromSubgraph(queryBuilder);
        return data.busBranchFilleds;
    }

    public async getOnboardedBatches(
        startingBatchIndex: number = 0,
    ): Promise<BusBatchOnboardedEvent[]> {
        let fetchedData: BusBatchOnboardedEvent[] = [];
        let currentBatchIndex = startingBatchIndex;
        let minLeftLeafIndex = startingBatchIndex << 6;

        while (true) {
            const queryBuilder = new QueryBuilder(
                [
                    'id',
                    'batchRoot',
                    'numUtxosInBatch',
                    'leftLeafIndexInBusTree',
                    'busTreeNewRoot',
                    'busBranchNewRoot',
                    'blockNumber',
                    'queueId',
                ],
                'busBatchOnboardeds',
                `where: {leftLeafIndexInBusTree_gte: ${minLeftLeafIndex}}, orderBy: leftLeafIndexInBusTree, orderDirection: asc, first: ${PAGINATION_WINDOW_SIZE}`,
            );

            const data = await this.fetchFromSubgraph(queryBuilder);
            const onboardedBatches = data.busBatchOnboardeds.map(
                (b: BusBatchOnboardedEvent) => ({
                    ...b,
                    batchIndex: Number(b.leftLeafIndexInBusTree >> 6),
                    branchIndex: Number(b.leftLeafIndexInBusTree >> 16),
                }),
            );

            fetchedData = [...fetchedData, ...onboardedBatches];

            if (onboardedBatches.length < PAGINATION_WINDOW_SIZE) {
                break;
            } else {
                const lastBatchIndex =
                    onboardedBatches[onboardedBatches.length - 1].batchIndex;
                if (lastBatchIndex >= currentBatchIndex) {
                    currentBatchIndex = lastBatchIndex + 1;
                    minLeftLeafIndex = currentBatchIndex << 6;
                } else {
                    break;
                }
            }
        }

        return fetchedData;
    }

    public async getOldestBlockNumber(): Promise<number | null> {
        const queryBuilder = new QueryBuilder(
            ['blockNumber'],
            'busQueueOpeneds',
            `where: {isOnboarded: false}, orderBy: blockNumber, orderDirection: asc, first: 1`,
        );
        const data = await this.fetchFromSubgraph(queryBuilder);
        return Number(data.busQueueOpeneds[0]?.blockNumber || null);
    }

    /**
     * How far the projection has indexed. Events at or below this block are
     * already available here, so the chain scanner only has to cover what comes
     * after it.
     */
    public async getIndexedBlockNumber(): Promise<number> {
        // Deliberately not `_meta`, which reports the higher of the
        // projection's two watermarks. They advance independently, so `_meta`
        // can claim coverage the rows do not have -- and a scan origin taken
        // from it skips blocks nothing ever indexed, stranding a queue with
        // utxos on chain and none in the cache.
        //
        // The lower watermark is the only block every row is guaranteed to be
        // present up to. Anything past it the chain scanner covers.
        try {
            const {data} = await axios.get(`${this.url}/health`, {
                timeout: REQUEST_TIMEOUT_MS,
            });
            return Math.min(
                Number(data.projection.last_completed_block),
                Number(data.projection.chain_completed_block),
            );
        } catch {
            // Not a Panther projection, or it cannot report progress. Preload
            // nothing and let the scanner cover the whole range.
            return -1;
        }
    }

    /**
     * Pages by `id` rather than by block, because several events share a block
     * and a block-keyed cursor would drop the rest of a partially read block.
     */
    private async fetchAllSince(
        queryName: string,
        fields: string[],
        fromBlock: number,
    ): Promise<any[]> {
        const collected: any[] = [];
        let cursor = '';

        while (true) {
            // Omitted on the first page: these ids are Bytes, and there is no
            // literal that sorts below every value of that type.
            const after = cursor ? `, id_gt: "${cursor}"` : '';
            const queryBuilder = new QueryBuilder(
                ['id', ...fields],
                queryName,
                `where: {blockNumber_gte: ${fromBlock}${after}}, ` +
                    `orderBy: id, orderDirection: asc, first: ${PAGINATION_WINDOW_SIZE}`,
            );
            const data = await this.fetchFromSubgraph(queryBuilder);
            const rows = data[queryName];
            if (!rows || rows.length === 0) break;

            collected.push(...rows);
            cursor = rows[rows.length - 1].id;
            if (rows.length < PAGINATION_WINDOW_SIZE) break;
        }

        return collected;
    }

    public async getQueuedUtxosSince(
        fromBlock: number,
    ): Promise<UtxoBusQueuedEventRecord[]> {
        const rows = await this.fetchAllSince(
            'utxoBusQueueds',
            ['utxo', 'queueId', 'utxoIndexInBatch'],
            fromBlock,
        );
        const utxos = rows.map(row => ({
            queueId: Number(row.queueId),
            utxo: row.utxo,
            utxoIndexInBatch: Number(row.utxoIndexInBatch),
        }));

        // The commitment is computed over the leaves in queue order, and
        // `MemCache` keeps them in the order they arrive rather than sorting.
        // Paging is keyed on `id`, which is derived from the transaction hash,
        // so rows come back in an order unrelated to the batch -- submitting
        // that reverts with BT:E7, ERR_INVALID_LEAFS_COMMIT.
        return utxos.sort((left, right) => {
            if (left.queueId !== right.queueId) {
                return left.queueId - right.queueId;
            }
            return left.utxoIndexInBatch - right.utxoIndexInBatch;
        });
    }

    public async getOnboardedBatchesSince(
        fromBlock: number,
    ): Promise<BusBatchOnboardedEventRecord[]> {
        const rows = await this.fetchAllSince(
            'busBatchOnboardeds',
            [
                'queueId',
                'batchRoot',
                'numUtxosInBatch',
                'leftLeafIndexInBusTree',
                'busTreeNewRoot',
                'busBranchNewRoot',
            ],
            fromBlock,
        );
        return rows.map(row => {
            const leftLeafIndexInBusTree = Number(row.leftLeafIndexInBusTree);
            return {
                queueId: BigInt(row.queueId),
                batchRoot: BigInt(row.batchRoot),
                numUtxosInBatch: Number(row.numUtxosInBatch),
                leftLeafIndexInBusTree,
                busTreeNewRoot: row.busTreeNewRoot,
                busBranchNewRoot: row.busBranchNewRoot,
                batchIndex: leftLeafIndexInBusTree >> 6,
                branchIndex: leftLeafIndexInBusTree >> 16,
                isInserted: false,
            };
        });
    }
}
