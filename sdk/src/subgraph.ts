// SPDX-License-Identifier: BUSL-1.1
// SPDX-FileCopyrightText: Copyright 2021-22 Panther Ventures Limited Gibraltar

import axios from 'axios';

import {
    BusBatchOnboardedEvent,
    BranchFilledEvent,
    BusQueueOpenedEvent,
    UtxoBusQueuedEvent,
    GroupedUtxoBusQueued,
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

// Group and sort UTXOs by Queue ID
function groupAndSortUTXOsByQueueID(array: UtxoBusQueuedEvent[]): any {
    const grouped = array.reduce(
        (r: GroupedUtxoBusQueued, a: UtxoBusQueuedEvent) => {
            r[a.queueId] = [...(r[a.queueId] || []), a];
            return r;
        },
        {},
    );

    // Sort elements in each group by utxoIndexInBatch
    Object.values(grouped).forEach(arr =>
        arr.sort(
            (a: UtxoBusQueuedEvent, b: UtxoBusQueuedEvent) =>
                a.utxoIndexInBatch - b.utxoIndexInBatch,
        ),
    );

    return grouped;
}

// Parse and map UtxoBusQueuedEvent data
function parseUtxoBusQueuedEvent(data: any): UtxoBusQueuedEvent[] {
    return data.utxoBusQueueds.map((u: UtxoBusQueuedEvent) => ({
        ...u,
        queueId: Number(u.queueId),
        utxoIndexInBatch: Number(u.utxoIndexInBatch),
    }));
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
        startingBatchIndex: number,
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
            ],
            `where: {leftLeafIndexInBusTree_gte: ${minLeftLeafIndex}}, first: 1000`,
        );
        return data.busBatchOnboardeds.map((b: BusBatchOnboardedEvent) => ({
            ...b,
            batchIndex: Number(b.leftLeafIndexInBusTree >> 6),
            branchIndex: Number(b.leftLeafIndexInBusTree >> 16),
        }));
    }

    public async getBusQueueOpened(): Promise<any> {
        const data = await this.fetchFromSubgraph(
            'busQueueOpeneds',
            ['queueId'],
            'where: {isOnboarded: false}',
        );
        const openedQueueIds = data.busQueueOpeneds.map(
            (b: BusQueueOpenedEvent) => b.queueId,
        );

        const queuedData = await this.fetchFromSubgraph(
            'utxoBusQueueds',
            ['utxo', 'queueId', 'utxoIndexInBatch'],
            `where: {queueId_in: [${openedQueueIds.join(', ')}]}`,
        );
        const utxoBusQueueds = parseUtxoBusQueuedEvent(queuedData);

        return groupAndSortUTXOsByQueueID(utxoBusQueueds);
    }

    public async getUtxosForQueueId(queueId: number): Promise<any> {
        const data = await this.fetchFromSubgraph(
            'utxoBusQueueds',
            ['utxo', 'utxoIndexInBatch', 'queueId'],
            `where: {queueId: ${queueId}}`,
        );

        return parseUtxoBusQueuedEvent(data).sort(
            (a: UtxoBusQueuedEvent, b: UtxoBusQueuedEvent) =>
                a.utxoIndexInBatch - b.utxoIndexInBatch,
        );
    }
}
