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
    } = eventData;

    // Initialize and set up all necessary components for the mining process
    const [tree, lastScannedBlock, insertedQueueIds] = await coldStart(
        subgraphId,
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
    const miner = new Miner(privateKey, rpcUrl, address, notify);
    const zkProver = new ZKProver(
        'pantherBusTreeUpdater.wasm',
        'pantherBusTreeUpdater_final.zkey',
    );
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
            false,
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
