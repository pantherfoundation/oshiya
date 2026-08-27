// SPDX-License-Identifier: MIT
// SPDX-FileCopyrightText: Copyright 2024 Panther Protocol Foundation

import {utils} from 'ethers';

import {BatchProcessing} from './batch-processing';
import {bigintToBytes32} from './bigint-conversions';
import {LogFn, log as defaultLog} from './logging';
import {Miner} from './miner';
import {MemCache} from './mem-cache';
import {EMPTY_TREE_ROOT, MinerTree} from './miner-tree';
import {MiningStats, addToListAndCount, logAndCount} from './mining-stats';
import {QueueProcessing} from './queue-processing';
import {Subgraph} from './subgraph';
import {BusBatchOnboardedEvent, ProofInputs, UtxoBusQueuedEvent} from './types';
import {ZKProver} from './zk-prover';

async function prepareProof(
    queueProcessing: QueueProcessing,
    miner: Miner,
    copyOfTree: MinerTree,
    utxos: UtxoBusQueuedEvent[],
    queueId: number,
    log: LogFn = defaultLog,
): Promise<ProofInputs> {
    try {
        return queueProcessing.prepareProofForQueue(
            miner.address,
            copyOfTree,
            utxos,
            queueId,
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
            proofInputs,
            proof,
        );
    } catch (e) {
        log('Error while submitting proof');
        throw e;
    }
}

export async function coldStart(
    subgraphUrl: string,
    genesisBlockNumber: number,
    log: LogFn = defaultLog,
): Promise<[MinerTree, number, number[]]> {
    log('Starting cold start');
    const [tree, filledBatches] = await initializeMinerTree(subgraphUrl);
    const insertedQueueIds = filledBatches.map(batch => Number(batch.queueId));
    const startingBlock = await getOldestBlockNumber(subgraphUrl);

    const blockNumber = Math.max(
        genesisBlockNumber,
        startingBlock && isFinite(startingBlock)
            ? startingBlock
            : genesisBlockNumber,
    );

    log(`Cold start finished. Start chain scanning from ${blockNumber} block`);
    log(`There are ${insertedQueueIds.length} inserted queues`);
    log(`Tree root: ${tree.root}`);
    return [tree, blockNumber, insertedQueueIds];
}

// Initializes MinerTree and returns sorted onboarded batches
async function initializeMinerTree(
    subgraphUrl: string,
): Promise<[MinerTree, BusBatchOnboardedEvent[]]> {
    const tree = new MinerTree();
    const subgraph = new Subgraph(subgraphUrl);
    const filledBranches = await subgraph.getFilledBranches();
    filledBranches.sort((a, b) => a.branchIndex - b.branchIndex);
    filledBranches.forEach(branch => {
        tree.insertFilledBranch(branch);
    });

    const nextBranchIndex = filledBranches.reduce(
        (max, branch) => Math.max(max, branch.branchIndex),
        0,
    );

    const filledBatches = await subgraph.getOnboardedBatches(
        nextBranchIndex << 10,
    );
    filledBatches.sort((a, b) => a.batchIndex - b.batchIndex);
    filledBatches.forEach(batch => tree.insertBatch(batch));
    return [tree, filledBatches];
}

/**
 * Loads every queued utxo and onboarded batch the projection already holds
 * straight into the cache, and returns the block the chain scanner should start
 * from -- everything at or below the projection's watermark is covered here.
 *
 * This is the same data `EventScanner` would rebuild from `eth_getLogs`, except
 * it arrives in a couple of paged queries instead of thousands of sequential
 * 1000-block windows. Order does not matter: `MemCache` keys batches by queueId
 * and dedupes utxos on `utxoIndexInBatch`.
 *
 * The scanner still covers the tail, so freshness never depends on how far
 * behind the projection's watermark is.
 */
export async function syncFromSubgraph(
    subgraphUrl: string,
    fromBlock: number,
    db: MemCache,
    log: LogFn = defaultLog,
): Promise<number> {
    const subgraph = new Subgraph(subgraphUrl);
    const indexedBlock = await subgraph.getIndexedBlockNumber();

    if (indexedBlock <= fromBlock) {
        log(`Subgraph is at ${indexedBlock}; nothing to preload`);
        return fromBlock;
    }

    const [utxos, batches] = await Promise.all([
        subgraph.getQueuedUtxosSince(fromBlock),
        subgraph.getOnboardedBatchesSince(fromBlock),
    ]);

    for (const batch of batches) db.storeEventBusBatchOnBoarded(batch);
    for (const utxo of utxos) db.storeEventUtxoBusQueued(utxo);

    log(
        `Preloaded ${utxos.length} utxos and ${batches.length} batches from ` +
            `the subgraph (${fromBlock} - ${indexedBlock}); ` +
            `chain scanning resumes at ${indexedBlock + 1}`,
    );
    return indexedBlock + 1;
}

// Gets oldest block number excluding inserted queueIds
async function getOldestBlockNumber(
    subgraphUrl: string,
): Promise<number | null> {
    const subgraph = new Subgraph(subgraphUrl);
    return subgraph.getOldestBlockNumber();
}

async function mineUtxos(
    miner: Miner,
    zkProver: ZKProver,
    batchProcessing: BatchProcessing,
    queueProcessing: QueueProcessing,
    miningStats: MiningStats,
    log: LogFn = defaultLog,
) {
    try {
        await batchProcessing.checkInsertedBatchesAndUpdateMinerTree();

        logAndCount('Checking BusTree root.', miningStats, log);
        let currentRoot = await miner.getBusTreeRoot();
        currentRoot =
            currentRoot === bigintToBytes32(0n) ? EMPTY_TREE_ROOT : currentRoot;
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
            'reward for queue, ZKP',
            Number(utils.formatEther(queueAndUtxos.queue.reward)),
            miningStats,
        );

        log('Preparing and submitting proof.');
        const copyOfTree = batchProcessing.tree.copy();
        const proofInputs = await prepareProof(
            queueProcessing,
            miner,
            copyOfTree,
            queueAndUtxos.utxos,
            queueAndUtxos.queue.queueId,
            log,
        );

        const [proof, publicSignals] = await generateProof(
            zkProver,
            proofInputs,
            log,
        );
        logAndCount('Generated proof', miningStats, log);
        miningStats.incrementStats('generatedProof');

        await submitProof(miner, proof, publicSignals, queueAndUtxos, log);
        logAndCount('Submitted proof', miningStats, log);
        miningStats.incrementStats('submittedProof');

        batchProcessing.tree = copyOfTree;
        batchProcessing.setBusBatchIsOnboarded(queueAndUtxos.queue.queueId);

        log('Proof submitted');
        log(`New BusTree root: ${batchProcessing.tree.root}`);
        logAndCount('Mining success', miningStats, log);
        miningStats.incrementStats('miningSuccess');

        addToListAndCount(
            'Mined reward, ZKP',
            Number(utils.formatEther(queueAndUtxos.queue.reward)),
            miningStats,
        );
        addToListAndCount(
            'Mined utxos',
            queueAndUtxos.utxos.length,
            miningStats,
        );
    } catch (e: any) {
        console.error(e);
        logAndCount(`Mining error`, miningStats, log);
        miningStats.incrementStats('miningError');
    }
}

export async function doWork(
    miner: Miner,
    zkProver: ZKProver,
    batchProcessing: BatchProcessing,
    queueProcessing: QueueProcessing,
    miningStats: MiningStats,
    log: LogFn = defaultLog,
): Promise<void> {
    // Mine UTXOs.
    await mineUtxos(
        miner,
        zkProver,
        batchProcessing,
        queueProcessing,
        miningStats,
        log,
    );
}
