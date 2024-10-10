// SPDX-License-Identifier: MIT
// SPDX-FileCopyrightText: Copyright 2024 Panther Protocol Foundation

import {BigNumber} from 'ethers';

export type BusQueueRecStructOutput = {
    queueId: number;
    nUtxos: number;
    reward: BigNumber;
    firstUtxoBlock: number;
    lastUtxoBlock: number;
    remainingBlocks: number;
    commitment: string;
};

export type BranchFilledEvent = {
    branchIndex: number;
    busBranchFinalRoot: string;
};

export type BusBatchOnboardedEvent = {
    queueId: bigint;
    batchRoot: bigint;
    numUtxosInBatch: number;
    leftLeafIndexInBusTree: number;
    busTreeNewRoot: string;
    busBranchNewRoot: string;
    batchIndex: number;
    branchIndex: number;
    blockNumber?: number;
};

export type BusBatchOnboardedEventRecord = BusBatchOnboardedEvent & {
    isInserted: boolean;
};

export type BusQueueOpenedEvent = {
    queueId: number;
    blockNumber: number;
};

export type UtxoBusQueuedEvent = {
    utxo: string;
    queueId: number;
    utxoIndexInBatch: number;
    blockNumber?: number;
};

export type UtxoBusQueuedEventRecord = UtxoBusQueuedEvent;

export type SortedBatches = {
    roots: bigint[];
    newRoot: bigint;
    newBusTreeRoot: bigint;
    lastInsertedIndex: number;
};

export type GroupedUtxoBusQueued = {
    [queueId: number]: UtxoBusQueuedEvent[];
};

export type EnvVariables = {
    PRIVATE_KEY: string;
    RPC_URL: string;
    CONTRACT_ADDRESS: string;
    INTERVAL: number;
    SUBGRAPH_ID: string;
    GENESIS_BLOCK_NUMBER: number;
    FORCE_UTXO_SIMULATION: string;
    MIN_REWARD: string;
};

export type ProofInputs = {
    oldRoot: string; // -  old bus root
    newRoot: string; // -  new bus root
    replacedNodeIndex: number; // -  utxo pack index
    pathElements: string[]; // -  merkle path of 20 elements
    newLeafsCommitment: string; // -  commitment of the queue
    nNonEmptyNewLeafs: number; // -  utxo count in the queue
    newLeafs: string[]; // -  utxosCommitments[]
    batchRoot: string; // -  leaf (UTXO pack root)
    branchRoot: string; // -  new branch root
    extraInput: string; // -  miner address
    magicalConstraint: string; // -  constant
};
