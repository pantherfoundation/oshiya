// SPDX-License-Identifier: BUSL-1.1
// SPDX-FileCopyrightText: Copyright 2021-22 Panther Ventures Limited Gibraltar

import axios from 'axios';

import {
    BusBatchOnboardedEvent,
    BranchFilledEvent,
    UtxoBusQueuedEvent,
} from './types';

// Helper to generate GraphQL queries
function generateQuery(
    name: string,
    fields: string[],
    options: string = '',
): string {
    return `
        query{
            ${name}(${options}) {
                ${fields.join('\n')}
            }
        }
    `;
}

// Handles all Graph API requests
async function requestGraph(url: string, query: string): Promise<any> {
    const response = await axios.post(url, {query});

    if (response.data.errors?.[0]?.message || response.status !== 200) {
        console.error(response.data.errors?.[0]?.message);
        throw new Error('Cannot fetch data from the subgraph');
    }

    return response.data.data;
}

export class Subgraph {
    private readonly url: string;

    constructor(id: string) {
        this.url = `https://api.thegraph.com/subgraphs/id/${id}`;
    }

    private async fetchFromSubgraph(
        queryName: string,
        fields: string[],
        filter: string = '',
    ): Promise<any> {
        return await requestGraph(
            this.url,
            generateQuery(queryName, fields, filter),
        );
    }

    public async getFilledBranches(): Promise<BranchFilledEvent[]> {
        const data = await this.fetchFromSubgraph(
            'busBranchFilleds',
            ['branchIndex', 'busBranchFinalRoot'],
            'first: 1000',
        );
        return data.busBranchFilleds;
    }

    public async getOnboardedBatches(
        startingBatchIndex: number = 0,
    ): Promise<BusBatchOnboardedEvent[]> {
        const minLeftLeafIndex = startingBatchIndex << 6;
        const data = await this.fetchFromSubgraph(
            'busBatchOnboardeds',
            [
                'batchRoot',
                'numUtxosInBatch',
                'leftLeafIndexInBusTree',
                'busTreeNewRoot',
                'busBranchNewRoot',
                'blockNumber',
                'queueId',
            ],
            `where: {leftLeafIndexInBusTree_gte: ${minLeftLeafIndex}}, first: 1000`,
        );
        return data.busBatchOnboardeds.map((b: BusBatchOnboardedEvent) => ({
            ...b,
            batchIndex: Number(b.leftLeafIndexInBusTree >> 6),
            branchIndex: Number(b.leftLeafIndexInBusTree >> 16),
        }));
    }

    public async getOldestBlockNumber(notQueueIds: number[]): Promise<number> {
        const data = await this.fetchFromSubgraph(
            'utxoBusQueueds',
            ['blockNumber'],
            `where: { queueId_not_in: [${notQueueIds.join(', ')}] }`,
        );

        const blockNumbers = data.utxoBusQueueds.map(
            (u: UtxoBusQueuedEvent) => u.blockNumber,
        );
        return Math.min(...blockNumbers);
    }
}
