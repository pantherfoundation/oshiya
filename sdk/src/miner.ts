// SPDX-License-Identifier: BUSL-1.1
// SPDX-FileCopyrightText: Copyright 2021-22 Panther Ventures Limited Gibraltar

import {BusTree} from 'contract/bus-tree-types';
import {Contract, ContractReceipt, Wallet, getDefaultProvider} from 'ethers';

import BUS_ABI from './contract/bus-tree-abi.json';
import {log} from './logging';
import {BusQueueRecStructOutput} from './types';

function initializeBusContract(
    wallet: Wallet,
    rpcURL: string,
    contractAddress: string,
): BusTree {
    const provider = getDefaultProvider(rpcURL);
    const signer = wallet.connect(provider);
    return new Contract(contractAddress, BUS_ABI, signer) as BusTree;
}

export class Miner {
    public readonly address: string;
    private readonly busContract: BusTree;

    constructor(
        privKey: string,
        private readonly rpcURL: string,
        private readonly contractAddress: string,
    ) {
        const wallet = new Wallet(privKey);
        this.address = wallet.address;
        this.busContract = initializeBusContract(
            wallet,
            rpcURL,
            contractAddress,
        );
    }

    public async getHighestRewardQueue(): Promise<BusQueueRecStructOutput> {
        let queues = await this.busContract.getOldestPendingQueues(255);
        queues = queues.filter(
            (q: BusQueueRecStructOutput) => Number(q.nUtxos) == 64,
        );

        return queues.reduce(
            (max: BusQueueRecStructOutput, q: BusQueueRecStructOutput) =>
                max.reward.gt(q.reward) ? max : q,
            queues[0],
        );
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
        log(`Submitted tx ${tx.hash}`);
        return await tx.wait();
    }

    public async getBusTreeRoot(): Promise<string> {
        return await this.busContract.busTreeRoot();
    }
}
