// SPDX-License-Identifier: MIT
// SPDX-FileCopyrightText: Copyright 2024 Panther Protocol Foundation

import {join, resolve} from 'path';

import dotenv from 'dotenv';

import {BatchProcessing} from '../src/batch-processing';
import {parseEnvVariables, logSettings} from '../src/env';
import {EventScanner} from '../src/event-scanner';
import {log} from '../src/logging';
import {Miner} from '../src/miner';
import {MiningStats} from '../src/mining-stats';
import {QueueProcessing} from '../src/queue-processing';
import {coldStart, doWork} from '../src/runner';
import {ZKProver} from '../src/zk-prover';
import {MemCache} from '../src/mem-cache';

dotenv.config({path: resolve(__dirname, '../.env')});

async function main() {
    const env = parseEnvVariables(process.env);
    await logSettings(env);
    const miner = new Miner(
        env.PRIVATE_KEY,
        env.RPC_URL,
        env.CONTRACT_ADDRESS,
        env.MIN_REWARD,
    );
    const zkProver = new ZKProver(
        join(__dirname, '../src/wasm/pantherBusTreeUpdater.wasm'),
        join(__dirname, '../src/wasm/pantherBusTreeUpdater_final.zkey'),
    );

    const [tree, startingBlock, insertedQueueIds] = await coldStart(
        env.SUBGRAPH_ID,
        env.GENESIS_BLOCK_NUMBER,
    );

    const db = new MemCache(insertedQueueIds);
    const scanner = new EventScanner(
        env.RPC_URL,
        env.CONTRACT_ADDRESS,
        startingBlock,
        db,
    );

    const batchProcessing = new BatchProcessing(tree, scanner, db);
    const queueProcessing = new QueueProcessing(miner, db);
    const miningStats = new MiningStats();

    log('Setting up work interval');

    while (true) {
        log('Initiating work sequence.');
        await doWork(
            miner,
            zkProver,
            batchProcessing,
            queueProcessing,
            miningStats,
            env.FORCE_UTXO_SIMULATION === 'true',
        );
        log('Work sequence completed. Waiting for next interval.');
        miningStats.printMetrics();
        miningStats.writeToFile();
        await new Promise(r => setTimeout(r, Number(env.INTERVAL) * 1000));
    }
}

main();
