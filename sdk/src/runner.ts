// SPDX-License-Identifier: BUSL-1.1
// SPDX-FileCopyrightText: Copyright 2021-22 Panther Ventures Limited Gibraltar

import {BatchProcessing} from './batch-processing';
import {log} from './logging';
import {Miner} from './miner';
import {MinerTree} from './miner-tree';
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
        log('Error while generating proof');
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
): Promise<void> {
    log('Checking and updating inserted batches.');
    await batchProcessing.checkInsertedBatchesAndUpdateMinerTree(subgraph);

    log('Checking BusTree root.');
    const currentRoot = await miner.getBusTreeRoot();
    if (currentRoot !== batchProcessing.tree.root) {
        log(
            `BusTree root ${batchProcessing.tree.root} is not up-to-date with smart contract ${currentRoot}. Please wait for synchronization`,
        );
        return;
    }

    log('Fetching and handling queue and UTXOs.');
    const queueAndUtxos = await queueProcessing.fetchAndHandleQueueAndUtxos(
        miner,
        subgraph,
    );
    if (!queueAndUtxos) {
        return;
    }

    try {
        log('Preparing and submitting proof.');
        const copyOfTree = batchProcessing.tree.copy();

        const proofInputs = await prepareProof(
            queueProcessing,
            miner,
            copyOfTree,
            queueAndUtxos.utxos,
        );
        const proof = await generateProof(zkProver, proofInputs);
        await submitProof(miner, proof, proofInputs, queueAndUtxos);

        batchProcessing.tree = copyOfTree;
        log('Proof submitted');
        log(`New BusTree root: ${batchProcessing.tree.root}`);
    } catch (e) {
        log(`Error: ${e}`);
    }
}
