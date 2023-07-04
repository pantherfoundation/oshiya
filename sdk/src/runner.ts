// SPDX-License-Identifier: BUSL-1.1
// SPDX-FileCopyrightText: Copyright 2021-22 Panther Ventures Limited Gibraltar

import {BatchProcessing} from './batch-processing';
import {log} from './logging';
import {Miner} from './miner';
import {MinerTree} from './miner-tree';
import {MiningStats, addToListAndCount, logAndCount} from './mining-stats';
import {QueueProcessing} from './queue-processing';
import {Subgraph} from './subgraph';
import {ZKProver} from './zk-prover';

async function prepareProof(
    queueProcessing: QueueProcessing,
    miner: Miner,
    copyOfTree: MinerTree,
    utxos: any,
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
): Promise<any> {
    try {
        log('Generating proof');
        return await zkProver.generateProof(proofInputs);
    } catch (e) {
        log(`Error while generating proof: ${e}`);
        throw e;
    }
}

async function submitProof(
    miner: Miner,
    proof: any,
    proofInputs: any,
    queueAndUtxos: any,
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

export async function doWork(
    miner: Miner,
    zkProver: ZKProver,
    subgraph: Subgraph,
    batchProcessing: BatchProcessing,
    queueProcessing: QueueProcessing,
    miningStats: MiningStats,
    logger: (msg: string) => void = log,
): Promise<void> {
    try {
        logAndCount('Checking and updating inserted batches.', miningStats);
        await batchProcessing.checkInsertedBatchesAndUpdateMinerTree(subgraph);

        logAndCount('Checking BusTree root.', miningStats, logger);
        const currentRoot = await miner.getBusTreeRoot();
        if (currentRoot !== batchProcessing.tree.root) {
            logAndCount(
                'BusTree root is not up-to-date. Wait for sync',
                miningStats,
                logger,
            );
            logger(
                `BusTree root ${batchProcessing.tree.root} is not up-to-date with smart contract ${currentRoot}. Please wait for synchronization`,
            );
            return;
        }

        logAndCount(
            'Fetching and handling queue and UTXOs.',
            miningStats,
            logger,
        );
        const queueAndUtxos = await queueProcessing.fetchAndHandleQueueAndUtxos(
            miner,
            subgraph,
        );
        if (!queueAndUtxos) {
            logAndCount('No queue and UTXOs found', miningStats, logger);
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

        logger('Preparing and submitting proof.');
        const copyOfTree = batchProcessing.tree.copy();
        const proofInputs = await prepareProof(
            queueProcessing,
            miner,
            copyOfTree,
            queueAndUtxos.utxos,
        );
        const proof = await generateProof(zkProver, proofInputs);
        logAndCount('Generated proof', miningStats, logger);
        await submitProof(miner, proof, proofInputs, queueAndUtxos);
        logAndCount('Submitted proof', miningStats, logger);

        batchProcessing.tree = copyOfTree;
        logger('Proof submitted');
        logger(`New BusTree root: ${batchProcessing.tree.root}`);
        logAndCount('Mining success', miningStats, logger);
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
        logger(`Error: ${e}`);
        miningStats.addToListMetric(`Mining error: ${e.message}`, 1);
    }
}
