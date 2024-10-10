// SPDX-License-Identifier: MIT
// SPDX-FileCopyrightText: Copyright 2024 Panther Protocol Foundation

import {providers, utils, Wallet} from 'ethers';

import {EnvVariables} from './types';

export const requiredVars: Array<keyof EnvVariables> = [
    'INTERVAL',
    'PRIVATE_KEY',
    'RPC_URL',
    'CONTRACT_ADDRESS',
    'SUBGRAPH_ID',
    'GENESIS_BLOCK_NUMBER',
    'FORCE_UTXO_SIMULATION',
    'MIN_REWARD',
];

function logEnvVariable(
    v: keyof EnvVariables | 'MINER_ADDRESS' | 'MINER_BALANCE',
    value: string | number,
) {
    console.log(`${v}: ${value}`);
}

export function parseEnvVariables(env: NodeJS.ProcessEnv): EnvVariables {
    const parsed: Partial<EnvVariables> = {};

    for (const varName of requiredVars) {
        if (!env[varName]) {
            throw new Error(
                `Required environment variable missing: ${varName}`,
            );
        }

        if (varName === 'INTERVAL' || varName === 'GENESIS_BLOCK_NUMBER') {
            parsed[varName] = parseInt(env[varName]!);
        } else {
            parsed[varName] = env[varName]!;
        }
    }

    return parsed as EnvVariables;
}

export async function logSettings(env: EnvVariables): Promise<void> {
    console.log('='.repeat(90));

    for (const v of requiredVars) {
        if (v === 'PRIVATE_KEY') {
            const wallet = new Wallet(env[v]);
            const minerAddress = wallet.address;
            logEnvVariable('MINER_ADDRESS', minerAddress);

            // Get the balance of the miner address
            const provider = new providers.JsonRpcProvider(env.RPC_URL);
            const balance = await provider.getBalance(minerAddress);
            logEnvVariable(
                'MINER_BALANCE',
                utils.formatEther(balance) + ' POL',
            );
        } else {
            logEnvVariable(v, env[v]);
        }
    }

    console.log('='.repeat(90));
}
