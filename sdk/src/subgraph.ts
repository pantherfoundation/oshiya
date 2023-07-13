// SPDX-License-Identifier: BUSL-1.1
// SPDX-FileCopyrightText: Copyright 2021-22 Panther Ventures Limited Gibraltar

import axios from 'axios';

import {
    BusBatchOnboardedEvent,
    BranchFilledEvent,
    UtxoBusQueuedEvent,
} from './types';

const PAGINATION_WINDOW_SIZE = 1000;

// Handles all Subgraph API requests
async function requestSubgraph(url: string, query: string): Promise<any> {
    const response = await axios.post(url, {query});

    if (response.data.errors?.[0]?.message || response.status !== 200) {
        console.error(response.data.errors?.[0]?.message);
        throw new Error('Cannot fetch data from the subgraph');
    }

    return response.data.data;
}

// Subgraph GraphQL Query Builder
class QueryBuilder {
    constructor(
        private fields: string[],
        private queryName: string,
        private options: string = '',
    ) {}

    build(): string {
        return `
        query{
            ${this.queryName}(${this.options}) {
                ${this.fields.join('\n')}
            }
        }
        `;
    }
}

export class Subgraph {
    private readonly url: string;

    constructor(id: string) {
        this.url = `https://api.thegraph.com/subgraphs/id/${id}`;
    }

    private async fetchFromSubgraph(queryBuilder: QueryBuilder): Promise<any> {
        return await requestSubgraph(this.url, queryBuilder.build());
    }

    public async getFilledBranches(): Promise<BranchFilledEvent[]> {
        const queryBuilder = new QueryBuilder(
            ['branchIndex', 'busBranchFinalRoot'],
            'busBranchFilleds',
            'first: 1000',
        );

        const data = await this.fetchFromSubgraph(queryBuilder);
        return data.busBranchFilleds;
    }

    public async getOnboardedBatches(
        startingBatchIndex: number = 0,
    ): Promise<BusBatchOnboardedEvent[]> {
        let fetchedData: BusBatchOnboardedEvent[] = [];
        const minLeftLeafIndex = startingBatchIndex << 6;
        let pageIdx = 0;

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
                `where: {leftLeafIndexInBusTree_gte: ${minLeftLeafIndex}}, first: ${PAGINATION_WINDOW_SIZE}, skip: ${
                    pageIdx * PAGINATION_WINDOW_SIZE
                }`,
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
                pageIdx++;
            }
        }

        return fetchedData;
    }

    public async getOldestBlockNumber(notQueueIds: number[]): Promise<number> {
        const queryBuilder = new QueryBuilder(
            ['blockNumber'],
            'utxoBusQueueds',
            `where: { queueId_not_in: [${notQueueIds.join(', ')}] }`,
        );

        const data = await this.fetchFromSubgraph(queryBuilder);
        const blockNumbers = data.utxoBusQueueds.map(
            (u: UtxoBusQueuedEvent) => u.blockNumber,
        );
        return Math.min(...blockNumbers);
    }
}
