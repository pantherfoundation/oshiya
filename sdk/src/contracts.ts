// SPDX-License-Identifier: BUSL-1.1
// SPDX-FileCopyrightText: Copyright 2021-22 Panther Ventures Limited Gibraltar

import {BusTree} from 'contract/bus-tree-types';
import {Contract, Wallet, getDefaultProvider} from 'ethers';

import BUS_ABI from './contract/bus-tree-abi.json';

export function initializeReadOnlyBusContract(
    rpcURL: string,
    contractAddress: string,
): BusTree {
    const provider = getDefaultProvider(rpcURL);
    return new Contract(contractAddress, BUS_ABI, provider) as BusTree;
}

export function initializeBusContract(
    wallet: Wallet,
    rpcURL: string,
    contractAddress: string,
): BusTree {
    const provider = getDefaultProvider(rpcURL);
    const signer = wallet.connect(provider);
    return new Contract(contractAddress, BUS_ABI, signer) as BusTree;
}
