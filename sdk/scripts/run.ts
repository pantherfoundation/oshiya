// SPDX-License-Identifier: MIT
// SPDX-FileCopyrightText: Copyright 2024 Panther Protocol Foundation

import {BatchProcessing} from '../src/batch-processing';
import {parseEnvVariables, logSettings} from '../src/env';
import {EventScanner} from '../src/event-scanner';
import {log} from '../src/logging';
import {assertNodeVersion} from '../src/node-version';
import {Miner} from '../src/miner';
import {MiningStats} from '../src/mining-stats';
import {QueueProcessing} from '../src/queue-processing';
import {coldStart, doWork, syncFromSubgraph} from '../src/runner';
import {ZKProver} from '../src/zk-prover';
import {MemCache} from '../src/mem-cache';

async function main() {
  assertNodeVersion();
  const env = parseEnvVariables(process.env);
  await logSettings(env);
  const miner = new Miner(
    env.PRIVATE_KEY,
    env.RPC_URL,
    env.CONTRACT_ADDRESS,
    env.MIN_REWARD,
  );
  const zkProver = new ZKProver(env.PROTOCOL_VERSION);

  const [tree, startingBlock, insertedQueueIds] = await coldStart(
    env.SUBGRAPH_URL,
    env.GENESIS_BLOCK_NUMBER,
  );

  const db = new MemCache(insertedQueueIds);
  const scanFromBlock = await syncFromSubgraph(
    env.SUBGRAPH_URL,
    startingBlock,
    db,
  );
  const scanner = new EventScanner(
    env.RPC_URL,
    env.CONTRACT_ADDRESS,
    scanFromBlock,
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
    );
    log('Work sequence completed. Waiting for next interval.');
    miningStats.printMetrics();
    miningStats.writeToFile();
    await new Promise(r => setTimeout(r, Number(env.INTERVAL) * 1000));
  }
}

main();
