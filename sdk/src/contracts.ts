// SPDX-License-Identifier: MIT
// SPDX-FileCopyrightText: Copyright 2024 Panther Protocol Foundation

import {Contract, Wallet, getDefaultProvider} from 'ethers';

import FOREST_ABI from './contract/forest-abi.json';
import {ForestTree} from './contract/forest-types';

export function initializeReadOnlyBusContract(
    rpcURL: string,
    contractAddress: string,
): ForestTree {
    const provider = getDefaultProvider(rpcURL);
    return new Contract(contractAddress, FOREST_ABI, provider) as ForestTree;
}

export function initializeBusContract(
    wallet: Wallet,
    rpcURL: string,
    contractAddress: string,
): ForestTree {
    const provider = getDefaultProvider(rpcURL);
    const signer = wallet.connect(provider);
    return new Contract(contractAddress, FOREST_ABI, signer) as ForestTree;
}
