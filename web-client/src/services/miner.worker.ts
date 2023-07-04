import {TypedWorker, isMessageOf} from 'utils/worker';

import {
    QueueProcessing,
    BatchProcessing,
    Miner,
    Subgraph,
    ZKProver,
    MiningStats,
    doWork,
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

self.addEventListener('message', async event => {
    console.log('worker::event::data', event.data);
    if (isMessageOf<MinerClientParams>(WorkerMessage.StartMining, event.data)) {
        const {privateKey, rpcUrl, contractAddr, subgraphId, interval} =
            event.data;
        const miner = new Miner(privateKey, rpcUrl, contractAddr, notify);
        const subgraph = new Subgraph(subgraphId);
        const zkProver = new ZKProver(
            'pantherBusTreeUpdater.wasm',
            'pantherBusTreeUpdater_final.zkey',
        );
        const batchProcessing = new BatchProcessing(notify);
        const queueProcessing = new QueueProcessing(notify);
        const miningStats = new MiningStats();

        while (true) {
            await doWork(
                miner,
                zkProver,
                subgraph,
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
            await sleep(interval * 1000);
        }
    }
});

export default TypedWorker;
