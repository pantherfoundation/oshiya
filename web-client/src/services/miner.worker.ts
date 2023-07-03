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
import {WorkerMessage} from 'types/worker';

self.addEventListener('message', async event => {
    console.log('worker::event::data', event.data);
    if (isMessageOf<{}>(WorkerMessage.StartMining, event.data)) {
        console.log('SW will start mining...');
        const miner = new Miner(
            '1cb73b387640d6f30a4ccaa050bab28cd023fdb622a40ec93cc0acc29c3e14e3',
            'https://polygon-mumbai.infura.io/v3/b6250b7691cb47779fa3cfae4e9e511b',
            '0x8b5EFAa2269DD0d11FDda688AC5653E25008bfDD',
        );

        const subgraph = new Subgraph(
            'QmVHcJWuG6xvBmAvFAU9zTjrnDM8736745XD62hMx5eVcr',
        );

        const zkProver = new ZKProver();
        const batchProcessing = new BatchProcessing();
        const queueProcessing = new QueueProcessing();
        const miningStats = new MiningStats();

        await doWork(
            miner,
            zkProver,
            subgraph,
            batchProcessing,
            queueProcessing,
            miningStats,
        );

        miningStats.printMetrics();
    }
});

export default TypedWorker;
