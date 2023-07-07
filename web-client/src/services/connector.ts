import {configureChains, createClient} from 'wagmi';
import {MetaMaskConnector} from 'wagmi/connectors/metaMask';
import {publicProvider} from 'wagmi/providers/public';
import {polygonMumbai} from 'wagmi/chains';

const chains = [polygonMumbai];
export const metamaskConnector = new MetaMaskConnector({
    chains,
    options: {
        shimDisconnect: true,
    },
});

const {provider} = configureChains(chains, [publicProvider()]);

export const wagmiClient = createClient({
    autoConnect: true,
    connectors: [metamaskConnector],
    provider,
});
