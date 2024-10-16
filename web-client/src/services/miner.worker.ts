import {
    QueueProcessing,
    BatchProcessing,
    Miner,
    Subgraph,
    ZKProver,
    MiningStats,
    doWork,
    EventScanner,
    MemCache,
    coldStart,
} from '@panther-miner/sdk/lib';
import {MinerClientParams, WorkerMessage} from 'types/worker';
import {TypedWorker, isMessageOf} from 'utils/worker';
import {sleep} from 'utils/helpers';
import {MiningStatus} from 'types/miner';
import {env} from './env';

const globalContext = {
    isMining: false,
};

function notify(message: string) {
    const now = new Date().toISOString();
    self.postMessage({
        type: WorkerMessage.Logs,
        message: `${now} : ${message}`,
    });
}

async function handleMining(eventData: MinerClientParams) {
    globalContext.isMining = true;
    self.postMessage({
        type: WorkerMessage.MiningStatus,
        status: MiningStatus.Active,
    });

    const {
        privateKey,
        rpcUrl,
        interval,
        address,
        subgraphId,
        genesisBlockNumber,
        minReward,
    } = eventData;

    // Initialize and set up all necessary components for the mining process
    const [tree, lastScannedBlock, insertedQueueIds] = await coldStart(
        subgraphId,
        Number(env.GENESIS_BLOCK_NUMBER),
        notify,
    );
    const db = new MemCache(insertedQueueIds, notify);
    const scanner = new EventScanner(
        rpcUrl,
        address,
        isFinite(lastScannedBlock)
            ? lastScannedBlock
            : Number(genesisBlockNumber),
        db,
        notify,
    );
    const miner = new Miner(privateKey, rpcUrl, address, minReward, notify);
    const circuitWasmPath = 'circuits.wasm';
    const provingKeyPath = 'provingKey.zkey';

    const checkFileExists = async (path: string) => {
        try {
            const response = await fetch(path, {method: 'HEAD'});
            return response.ok;
        } catch (error) {
            notify(`Error checking file ${path}: ${error}`);
            return false;
        }
    };

    let zkProver: ZKProver | null = null;

    try {
        const circuitWasmExists = await checkFileExists(circuitWasmPath);
        const provingKeyExists = await checkFileExists(provingKeyPath);

        if (!circuitWasmExists || !provingKeyExists) {
            const missingFiles = [
                !circuitWasmExists ? circuitWasmPath : null,
                !provingKeyExists ? provingKeyPath : null,
            ]
                .filter(Boolean)
                .join(', ');
            notify(
                `Required files not found: ${missingFiles}. ZKProver will not be initialized.`,
            );
        } else {
            zkProver = new ZKProver(circuitWasmPath, provingKeyPath);
            notify('ZKProver initialized successfully.');
        }
    } catch (error) {
        notify(`Error initializing ZKProver: ${error}`);
    }
    if (zkProver === null) {
        notify(
            'Error: ZKProver is not initialized. Mining cannot proceed without ZKProver.',
        );
        return;
    }

    const batchProcessing = new BatchProcessing(tree, scanner, db, notify);
    const queueProcessing = new QueueProcessing(miner, db, notify);
    const miningStats = new MiningStats();

    // Continually perform work until mining is stopped
    while (globalContext.isMining) {
        await doWork(
            miner,
            zkProver,
            batchProcessing,
            queueProcessing,
            miningStats,
            notify,
        );
        miningStats.printMetrics();
        self.postMessage({
            type: WorkerMessage.Stats,
            stats: miningStats.stats,
        });

        await sleep(interval * 1000);
    }

    self.postMessage({
        type: WorkerMessage.MiningStatus,
        status: MiningStatus.Stoped,
    });
}

self.addEventListener('message', async event => {
    if (isMessageOf<MinerClientParams>(WorkerMessage.StartMining, event.data)) {
        await handleMining(event.data);
    } else if (isMessageOf(WorkerMessage.StopMining, event.data)) {
        globalContext.isMining = false;
    }
});

export default TypedWorker;
