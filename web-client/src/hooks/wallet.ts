import {JsonRpcProvider} from '@ethersproject/providers';
import {Signer} from 'ethers';
import {useCallback} from 'react';
import {metamaskConnector} from 'services/connector';
import {useAccount, useConnect, useNetwork, useSigner} from 'wagmi';

export function useWalletConnect() {
    const {connectAsync} = useConnect({
        connector: metamaskConnector,
    });
    const {isConnected, isConnecting} = useAccount();

    return useCallback(async () => {
        if (!isConnected || !isConnecting) await connectAsync();
    }, [isConnected, isConnecting, connectAsync]);
}

export type WalletContext = {
    signer: Signer | null;
    provider?: JsonRpcProvider;
    address?: string;
    chainId?: number;
    isConnected: boolean;
};

export function useWalletContext(): WalletContext {
    const {data: signer} = useSigner<Signer>();
    const {address, isConnected} = useAccount();
    const {chain} = useNetwork();

    return {
        signer: signer || null,
        provider: signer?.provider as JsonRpcProvider,
        address,
        chainId: chain?.id,
        isConnected,
    };
}
