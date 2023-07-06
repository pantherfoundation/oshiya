// SPDX-License-Identifier: BUSL-1.1
// SPDX-FileCopyrightText: Copyright 2021-22 Panther Ventures Limited Gibraltar

import {ContractReceipt, Wallet, utils} from 'ethers';

import {bigintToBytes32} from './bigint-conversions';
import {BusTree} from './contract/bus-tree-types';
import {initializeBusContract} from './contracts';
import {LogFn, log as defaultLog} from './logging';
import {BusQueueRecStructOutput} from './types';

const SNARK_FIELD_SIZE = BigInt(
    '21888242871839275222246405745257275088548364400416034343698204186575808495617',
);

const REWARD_PER_UTXO = 0.1;
const MIN_REWARD = utils.parseEther('2');

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

function getRandomInSnarkField(): string {
    const bytes = 32;
    let hex = '';
    for (let i = 0; i < bytes; i++) {
        // Generate a random byte (0-255)
        const randomByte = Math.floor(Math.random() * 256);
        // Convert the byte to hexadecimal (always results in a 2-character string)
        const hexByte = randomByte.toString(16).padStart(2, '0');
        hex += hexByte;
    }
    return bigintToBytes32(BigInt(`0x${hex}`) % SNARK_FIELD_SIZE);
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
        const queuesWithMoreThanMinReward = queues.filter(q =>
            q.reward.gt(MIN_REWARD),
        );
        const topFive = selectHighestN(
            queuesWithMoreThanMinReward,
            'reward',
            'firstUtxoBlock',
            5,
        );
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

    public async simulateAddUtxosToBusQueue(): Promise<ContractReceipt> {
        const numUtxos = Math.floor(Math.random() * 8) + 1;
        const utxos: Array<string> = [];
        for (let i = 0; i < numUtxos; i++) {
            utxos.push(getRandomInSnarkField());
        }
        const tx = await this.busContract.simulateAddUtxosToBusQueue(
            utxos,
            utils.parseEther((numUtxos * REWARD_PER_UTXO).toString()),
        );
        this.log(
            `Submitted tx ${tx.hash} for generating ${numUtxos} random utxos`,
        );

        return tx.wait();
    }

    public async getBusTreeRoot(): Promise<string> {
        return await this.busContract.busTreeRoot();
    }
}
