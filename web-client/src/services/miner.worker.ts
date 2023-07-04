// import 'core-js/stable';
// import 'regenerator-runtime/runtime';

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

self.addEventListener('message', async event => {
    console.log('worker::event::data', event.data);
    if (isMessageOf<MinerClientParams>(WorkerMessage.StartMining, event.data)) {
        const {privateKey, rpcUrl, contractAddr, subgraphId, interval} =
            event.data;
        const miner = new Miner(privateKey, rpcUrl, contractAddr);
        const subgraph = new Subgraph(subgraphId);
        const zkProver = new ZKProver(
            'pantherBusTreeUpdater.wasm',
            'pantherBusTreeUpdater_final.zkey',
        );
        const batchProcessing = new BatchProcessing();
        const queueProcessing = new QueueProcessing();
        const miningStats = new MiningStats();

        while (true) {
            await doWork(
                miner,
                zkProver,
                subgraph,
                batchProcessing,
                queueProcessing,
                miningStats,
                (message: string) => {
                    self.postMessage({
                        type: WorkerMessage.Logs,
                        message,
                    });
                },
            );
            miningStats.printMetrics();
            await sleep(interval * 1000);
        }
    }
});

export default TypedWorker;
