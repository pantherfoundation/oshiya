import {resolve} from 'path';

import dotenv from 'dotenv';
import {MinerTree} from 'miner-tree';

import {BatchProcessing} from '../src/batch-processing';
import {parseEnvVariables, logSettings} from '../src/env';
import {log} from '../src/logging';
import {Miner} from '../src/miner';
import {QueueProcessing} from '../src/queue-processing';
import {Subgraph} from '../src/subgraph';
import {ZKProver} from '../src/zk-prover';

dotenv.config({path: resolve(__dirname, '../.env')});

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

async function doWork(
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

async function main() {
    const env = parseEnvVariables(process.env);
    logSettings(env);
    const miner = new Miner(env.PRIVATE_KEY, env.RPC_URL, env.CONTRACT_ADDRESS);
    const subgraph = new Subgraph(env.SUBGRAPH_ID);
    const zkProver = new ZKProver();
    const batchProcessing = new BatchProcessing();
    const queueProcessing = new QueueProcessing();

    log('Setting up work interval');
    setInterval(async () => {
        log('Initiating work sequence.');
        await doWork(
            miner,
            zkProver,
            subgraph,
            batchProcessing,
            queueProcessing,
        );
        log('Work sequence completed. Waiting for next interval.');
    }, Number(process.env.INTERVAL) * 1000);

    log('Main process initiated.');
}

main();
