// SPDX-License-Identifier: MIT
// SPDX-FileCopyrightText: Copyright 2024 Panther Protocol Foundation

import {providers, utils, Wallet} from 'ethers';

import {EnvVariables} from './types';

const nativeSymbolByChainId: Record<number, string> = {
    1: 'ETH',
    137: 'POL',
    8453: 'ETH',
    80001: 'POL',
    80002: 'POL',
    84532: 'ETH',
};

export const requiredVars: Array<
    Exclude<keyof EnvVariables, 'SUBGRAPH_AUTH_TOKEN' | 'PAGE_SIZE'>
> = [
    'INTERVAL',
    'PRIVATE_KEY',
    'RPC_URL',
    'CONTRACT_ADDRESS',
    'SUBGRAPH_URL',
    'GENESIS_BLOCK_NUMBER',
    'MIN_REWARD',
    'PROTOCOL_VERSION',
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
            const value = Number(env[varName]);
            const minimum = varName === 'INTERVAL' ? 1 : 0;
            if (
                !env[varName]!.trim() ||
                !Number.isSafeInteger(value) ||
                value < minimum
            ) {
                throw new Error(`${varName} must be an integer >= ${minimum}`);
            }
            parsed[varName] = value;
        } else {
            parsed[varName] = env[varName]!;
        }
    }

    parsed.SUBGRAPH_AUTH_TOKEN = env.SUBGRAPH_AUTH_TOKEN || undefined;
    if (env.PAGE_SIZE) {
        const pageSize = Number(env.PAGE_SIZE);
        if (!Number.isSafeInteger(pageSize) || pageSize <= 0) {
            throw new Error('PAGE_SIZE must be a positive integer');
        }
        parsed.PAGE_SIZE = pageSize;
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
            const [balance, network] = await Promise.all([
                provider.getBalance(minerAddress),
                provider.getNetwork(),
            ]);
            const symbol = nativeSymbolByChainId[network.chainId] ?? 'ETH';
            logEnvVariable(
                'MINER_BALANCE',
                `${utils.formatEther(balance)} ${symbol}`,
            );
        } else {
            logEnvVariable(v, env[v]);
        }
    }

    console.log('='.repeat(90));
}
