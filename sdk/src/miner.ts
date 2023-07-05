// SPDX-License-Identifier: BUSL-1.1
// SPDX-FileCopyrightText: Copyright 2021-22 Panther Ventures Limited Gibraltar

import {ContractReceipt, Wallet} from 'ethers';

import {BusTree} from './contract/bus-tree-types';
import {initializeBusContract} from './contracts';
import {LogFn, log as defaultLog} from './logging';
import {BusQueueRecStructOutput} from './types';

function selectHighestN<T>(
    array: Array<T>,
    valueKey: keyof T,
    timeKey: keyof T,
    N: number,
): Array<T> {
    return [...array]
        .sort((a: T, b: T) => {
            if ((b[valueKey] as any) === (a[valueKey] as any)) {
                // If the values are the same, prefer the older block.
                return Number(a[timeKey]) - Number(b[timeKey]);
            } else {
                // Otherwise, prefer the higher value.
                return Number(b[valueKey]) - Number(a[valueKey]);
            }
        })
        .slice(0, N);
}

function getRandomElement<T>(array: Array<T>): T {
    const randomIndex = Math.floor(Math.random() * array.length);
    return array[randomIndex];
}

export class Miner {
    public readonly address: string;
    private readonly busContract: BusTree;

    private log: LogFn;

    constructor(
        privKey: string,
        rpcURL: string,
        contractAddress: string,
        log: LogFn = defaultLog,
    ) {
        const wallet = new Wallet(privKey);
        this.address = wallet.address;
        this.busContract = initializeBusContract(
            wallet,
            rpcURL,
            contractAddress,
        );
        this.log = log;
    }

    public async getHighestRewardQueue(): Promise<BusQueueRecStructOutput> {
        const queues = await this.busContract.getOldestPendingQueues(255);
        const topFive = selectHighestN(queues, 'reward', 'firstUtxoBlock', 5);
        return getRandomElement(topFive);
    }

    public async mineQueue(
        minerAddress: string,
        queueId: bigint,
        newBusTreeRoot: string,
        newBranchRoot: string,
        batchRoot: string,
        proof: any,
    ): Promise<ContractReceipt> {
        const tx = await this.busContract.onboardQueue(
            minerAddress,
            queueId,
            newBusTreeRoot,
            batchRoot,
            newBranchRoot,
            proof,
        );
        this.log(`Submitted tx ${tx.hash}`);
        return await tx.wait();
    }

    public async getBusTreeRoot(): Promise<string> {
        return await this.busContract.busTreeRoot();
    }
}
