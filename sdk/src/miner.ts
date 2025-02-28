// SPDX-License-Identifier: MIT
// SPDX-FileCopyrightText: Copyright 2024 Panther Protocol Foundation

import {type ContractReceipt, Wallet, utils, BigNumber} from 'ethers';

import {BusQueues, ForestTree} from './contract/forest-types';
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
    private readonly forestContract: ForestTree;
    private readonly minReward: string;
    private log: LogFn;

    constructor(
        privKey: string,
        rpcURL: string,
        contractAddress: string,
        minReward: string,
        log: LogFn = defaultLog,
    ) {
        const wallet = new Wallet(privKey);
        this.address = wallet.address;
        this.minReward = minReward;
        this.forestContract = initializeBusContract(
            wallet,
            rpcURL,
            contractAddress,
        );
        this.log = log;
    }

    public async getHighestRewardQueue(): Promise<BusQueueRecStructOutput> {
        const queues = await this.getPendingQueues();
        const queuesWithMoreThanMinReward = queues.filter(
            q =>
                q.reward.gt(utils.parseEther(this.minReward)) &&
                q.remainingBlocks == 0,
        );
        const topFive = selectHighestN(
            queuesWithMoreThanMinReward,
            'reward',
            'firstUtxoBlock',
            5,
        );
        return getRandomElement(topFive);
    }

    public async getPendingQueues(): Promise<
        BusQueues.BusQueueRecStructOutput[]
    > {
        const queues = await this.forestContract.getOldestPendingQueues(255);
        this.log(`Found ${queues.length} queue(s)`);
        return queues;
    }

    public async hasPendingQueues(): Promise<boolean> {
        const pendingQueues = await this.getPendingQueues();
        // Check if there are any pending queues with at least one UTXO
        return pendingQueues.some(
            (queue: BusQueues.BusQueueRecStructOutput) => queue.nUtxos > 0,
        );
    }

    public async mineQueue(
        minerAddress: string,
        queueId: bigint,
        publicSignals: any,
        proof: any,
    ): Promise<ContractReceipt | null> {
        let receipt = null;
        let attempts = 0;
        const maxAttempts = 5;
        let gasMultiplier = 1.1;

        // Get the current nonce once, and reuse it for all attempts
        const nonce = await this.forestContract.signer.getTransactionCount();
        this.log(`Using nonce: ${nonce} for all retry attempts`);

        while (receipt === null && attempts < maxAttempts) {
            attempts++;
            const feeData = await this.getFeeData();

            // Apply gas price multiplier for retries
            const maxFeePerGas = feeData.maxFeePerGas
                .mul(Math.floor(gasMultiplier * 100))
                .div(100);
            const maxPriorityFeePerGas = feeData.maxPriorityFeePerGas
                .mul(Math.floor(gasMultiplier * 100))
                .div(100);

            // Log submission values
            this.log(`Submitting onboardBusQueue with:
                minerAddress: ${minerAddress}
                queueId: ${queueId}
                maxFeePerGas: ${utils.formatUnits(maxFeePerGas, 'gwei')} gwei
                maxPriorityFeePerGas: ${utils.formatUnits(maxPriorityFeePerGas, 'gwei')} gwei
                nonce: ${nonce}
            `);

            try {
                const tx = await this.forestContract.onboardBusQueue(
                    minerAddress,
                    queueId,
                    publicSignals,
                    proof,
                    {
                        maxFeePerGas,
                        maxPriorityFeePerGas,
                        nonce,
                    },
                );
                this.log(`Submitted tx ${tx.hash} (attempt ${attempts})`);

                // Set up race between transaction confirmation and timeout
                receipt = await Promise.race([
                    tx.wait(),
                    new Promise<null>((_, reject) => {
                        setTimeout(() => {
                            reject(
                                new Error(
                                    'Transaction confirmation timeout after 1 minute',
                                ),
                            );
                        }, 60_000); // 1 minute in milliseconds
                    }),
                ]);

                this.log(`Transaction confirmed in attempt ${attempts}`);
            } catch (error) {
                const errorMessage =
                    error instanceof Error ? error.message : String(error);
                this.log(`Attempt ${attempts} failed: ${errorMessage}`);

                gasMultiplier += 0.2;
                this.log(
                    `Increasing gas price multiplier to ${gasMultiplier} for next attempt`,
                );

                if (attempts >= maxAttempts) {
                    throw new Error(
                        `Transaction failed after ${maxAttempts} attempts`,
                    );
                }

                this.log('Resubmitting transaction with same nonce...');
            }
        }

        return receipt;
    }

    private async getFeeData() {
        const provider = this.forestContract.provider;
        const feeData = await provider.getFeeData();

        // Use reasonable defaults as the provider doesn't return values
        const maxPriorityFeePerGas = BigNumber.from(30_000_000_000); // 30 gwei default

        // maxFeePerGas should be baseFeePerGas + maxPriorityFeePerGas
        const baseFeePerGas = feeData.lastBaseFeePerGas || BigNumber.from(0);
        const maxFeePerGas =
            feeData.maxFeePerGas || baseFeePerGas.add(maxPriorityFeePerGas);

        this.log(
            `Current gas prices: maxFeePerGas=${utils.formatUnits(
                maxFeePerGas,
                'gwei',
            )} gwei, maxPriorityFeePerGas=${utils.formatUnits(
                maxPriorityFeePerGas,
                'gwei',
            )} gwei`,
        );

        return {
            maxFeePerGas,
            maxPriorityFeePerGas,
        };
    }

    public async getBusTreeRoot(): Promise<string> {
        return await this.forestContract.getBusTreeRoot();
    }
}
