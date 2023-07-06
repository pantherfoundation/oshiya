// SPDX-License-Identifier: BUSL-1.1
// SPDX-FileCopyrightText: Copyright 2021-22 Panther Ventures Limited Gibraltar

import {BatchProcessing} from './batch-processing';
import {parseTxErrorMessage} from './errors';
import {LogFn, log as defaultLog} from './logging';
import {Miner} from './miner';
import {MinerTree} from './miner-tree';
import {MiningStats, addToListAndCount, logAndCount} from './mining-stats';
import {QueueProcessing} from './queue-processing';
import {Subgraph} from './subgraph';
import {BusBatchOnboardedEvent} from './types';
import {ZKProver} from './zk-prover';

async function prepareProof(
    queueProcessing: QueueProcessing,
    miner: Miner,
    copyOfTree: MinerTree,
    utxos: any,
    log: LogFn = defaultLog,
): Promise<any> {
    try {
        return queueProcessing.prepareProofForQueue(
            miner.address,
            copyOfTree,
            utxos,
        );
    } catch (e) {
        log('Error while preparing proof');
        throw e;
    }
}

async function generateProof(
    zkProver: ZKProver,
    proofInputs: any,
    log: LogFn = defaultLog,
): Promise<any> {
    try {
        log('Generating proof');
        return await zkProver.generateProof(proofInputs);
    } catch (e) {
        log(
            `Error while generating proof: ${
                e instanceof Error ? e.message : e
            }`,
        );
        throw e;
    }
}

async function submitProof(
    miner: Miner,
    proof: any,
    proofInputs: any,
    queueAndUtxos: any,
    log: LogFn = defaultLog,
): Promise<void> {
    try {
        log('Submitting proof');
        await miner.mineQueue(
            miner.address,
            BigInt(queueAndUtxos.queue.queueId),
            proofInputs.newRoot,
            proofInputs.branchRoot,
            proofInputs.batchRoot,
            proof,
        );
    } catch (e) {
        log('Error while submitting proof');
        throw e;
    }
}

export async function coldStart(
    subgraphId: string,
    log: LogFn = defaultLog,
): Promise<[MinerTree, number, number[]]> {
    log('Starting cold start');
    const [tree, filledBatches] = await initializeMinerTree(subgraphId);
    const insertedQueueIds = filledBatches.map(batch => Number(batch.queueId));
    const lastScannedBlock = await getOldestBlockNumber(
        subgraphId,
        insertedQueueIds,
    );

    log(`Cold start finished. Last scanned block: ${lastScannedBlock}`);
    return [tree, lastScannedBlock, insertedQueueIds];
}

// Initializes MinerTree and returns sorted onboarded batches
async function initializeMinerTree(
    subgraphId: string,
): Promise<[MinerTree, BusBatchOnboardedEvent[]]> {
    const tree = new MinerTree();
    const subgraph = new Subgraph(subgraphId);
    const filledBatches = await subgraph.getOnboardedBatches();
    filledBatches.sort((a, b) => a.batchIndex - b.batchIndex);
    filledBatches.forEach(batch => tree.insertBatch(batch));
    return [tree, filledBatches];
}

// Gets oldest block number excluding inserted queueIds
async function getOldestBlockNumber(
    subgraphId: string,
    insertedQueueIds: number[],
): Promise<number> {
    const subgraph = new Subgraph(subgraphId);
    return subgraph.getOldestBlockNumber(insertedQueueIds);
}

export async function doWork(
    miner: Miner,
    zkProver: ZKProver,
    batchProcessing: BatchProcessing,
    queueProcessing: QueueProcessing,
    miningStats: MiningStats,
    log: LogFn = defaultLog,
): Promise<void> {
    try {
        await miner.simulateAddUtxosToBusQueue();
        logAndCount('Inserted UTXOs.', miningStats, log);
        logAndCount(
            'Checking and updating inserted batches.',
            miningStats,
            log,
        );
        await batchProcessing.checkInsertedBatchesAndUpdateMinerTree();

        logAndCount('Checking BusTree root.', miningStats, log);
        const currentRoot = await miner.getBusTreeRoot();
        if (currentRoot !== batchProcessing.tree.root) {
            logAndCount(
                'BusTree root is not up-to-date. Wait for sync',
                miningStats,
            );
            log(
                `BusTree root ${batchProcessing.tree.root} is not up-to-date with smart contract ${currentRoot}. Please wait for synchronization`,
            );
            return;
        }

        logAndCount('Fetching and handling queue and UTXOs.', miningStats, log);
        const queueAndUtxos =
            await queueProcessing.fetchAndHandleQueueAndUtxos();
        if (!queueAndUtxos) {
            logAndCount('No queue and UTXOs found', miningStats, log);
            return;
        }
        addToListAndCount(
            'utxos in queue',
            queueAndUtxos.utxos.length,
            miningStats,
        );
        addToListAndCount(
            'reward for queue',
            Number(queueAndUtxos.queue.reward),
            miningStats,
        );

        log('Preparing and submitting proof.');
        const copyOfTree = batchProcessing.tree.copy();
        const proofInputs = await prepareProof(
            queueProcessing,
            miner,
            copyOfTree,
            queueAndUtxos.utxos,
            log,
        );
        const proof = await generateProof(zkProver, proofInputs, log);
        logAndCount('Generated proof', miningStats, log);
        await submitProof(miner, proof, proofInputs, queueAndUtxos);
        logAndCount('Submitted proof', miningStats, log);

        batchProcessing.tree = copyOfTree;
        batchProcessing.setBusBatchIsOnboarded(queueAndUtxos.queue.queueId);
        log('Proof submitted');
        log(`New BusTree root: ${batchProcessing.tree.root}`);
        logAndCount('Mining success', miningStats, log);
        addToListAndCount(
            'Mined reward',
            Number(queueAndUtxos.queue.reward),
            miningStats,
        );
        addToListAndCount(
            'Mined utxos',
            queueAndUtxos.utxos.length,
            miningStats,
        );
    } catch (e: any) {
        logAndCount(`Mining error: ${parseTxErrorMessage(e)}`, miningStats);
    }
}
