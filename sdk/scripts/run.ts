// SPDX-License-Identifier: BUSL-1.1
// SPDX-FileCopyrightText: Copyright 2021-22 Panther Ventures Limited Gibraltar

import {resolve} from 'path';

import dotenv from 'dotenv';

import {BatchProcessing} from '../src/batch-processing';
import {parseEnvVariables, logSettings} from '../src/env';
import {log} from '../src/logging';
import {Miner} from '../src/miner';
import { MiningStats } from '../src/mining-stats';
import {QueueProcessing} from '../src/queue-processing';
import {doWork} from '../src/runner';
import {Subgraph} from '../src/subgraph';
import {ZKProver} from '../src/zk-prover';

dotenv.config({path: resolve(__dirname, '../.env')});

async function main() {
    const env = parseEnvVariables(process.env);
    logSettings(env);
    const miner = new Miner(env.PRIVATE_KEY, env.RPC_URL, env.CONTRACT_ADDRESS);
    const subgraph = new Subgraph(env.SUBGRAPH_ID);
    const zkProver = new ZKProver();
    const batchProcessing = new BatchProcessing();
    const queueProcessing = new QueueProcessing();
    const miningStats = new MiningStats();

    log('Setting up work interval');
    setInterval(async () => {
        log('Initiating work sequence.');
        await doWork(
            miner,
            zkProver,
            subgraph,
            batchProcessing,
            queueProcessing,
            miningStats,
        );
        log('Work sequence completed. Waiting for next interval.');
        miningStats.printMetrics();
        miningStats.writeToFile();
    }, Number(process.env.INTERVAL) * 1000);

    log('Main process initiated.');
}

main();
