import {TypedWorker, isMessageOf} from 'utils/worker';

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
import {sleep} from 'utils/helpers';

function notify(message: string) {
    const now = new Date().toISOString();
    self.postMessage({
        type: WorkerMessage.Logs,
        message: `${now} : ${message}`,
    });
}

const globalContext = {
    isMining: false,
};

self.addEventListener('message', async event => {
    if (isMessageOf<MinerClientParams>(WorkerMessage.StartMining, event.data)) {
        globalContext.isMining = true;
        self.postMessage({type: WorkerMessage.MiningStatus, isMining: true});

        const {privateKey, rpcUrl, contractAddr, subgraphId, interval} =
            event.data;

        const [tree, lastScannedBlock, insertedQueueIds] = await coldStart(
            subgraphId,
            notify,
        );
        const db = new MemCache(insertedQueueIds, notify);
        const scanner = new EventScanner(
            rpcUrl,
            contractAddr,
            lastScannedBlock,
            db,
            notify,
        );
        const miner = new Miner(privateKey, rpcUrl, contractAddr, notify);
        const zkProver = new ZKProver(
            'pantherBusTreeUpdater.wasm',
            'pantherBusTreeUpdater_final.zkey',
        );
        const batchProcessing = new BatchProcessing(tree, scanner, db, notify);
        const queueProcessing = new QueueProcessing(miner, db, notify);
        const miningStats = new MiningStats();

        while (true) {
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
                countMetrics: miningStats.countMetrics,
                listMetrics: miningStats.listMetrics,
            });

            if (!globalContext.isMining) {
                self.postMessage({
                    type: WorkerMessage.MiningStatus,
                    isMining: false,
                });
                break;
            }
            await sleep(interval * 1000);
        }
    }

    if (isMessageOf(WorkerMessage.StopMining, event.data)) {
        globalContext.isMining = false;
    }
});

export default TypedWorker;
