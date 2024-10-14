import Button from 'components/widgets/Button';
import Input from 'components/widgets/Input';
import React, {useState} from 'react';
import {env} from 'services/env';
import {workerManager} from 'services/worker-manager';
import {isValidHttpUrl} from 'utils/helpers';
import {useDispatch} from 'react-redux';
import {updateMinerParams} from 'redux/slices/miner/minerParams';
import {getMinerBalance} from 'redux/slices/miner/minerBalance';
import {AppDispatch, useAppSelector} from 'redux/store';
import {useWalletConnect, useWalletContext} from 'hooks/wallet';
import {generatePrivKey} from 'services/keys';
import {MiningStatus} from 'types/miner';
import {updateMiningStatus} from 'redux/slices/miner/miningStatus';

const MinerClientParamsForm = () => {
    const dispatch = useDispatch<AppDispatch>();
    const miningStatus = useAppSelector(state => state.miner.miningStatus);
    const connect = useWalletConnect();
    const walletContext = useWalletContext();

    const [showPk, setShowPk] = useState<boolean>(false);
    const [state, setState] = useState<{
        interval: string;
        privateKey: string;
        rpcUrl: string;
        address: string;
        subgraphId: string;
        genesisBlockNumber: string;
        minReward: string;
    }>({
        interval: '20',
        privateKey: '',
        rpcUrl: env.RPC_URL || '',
        address: env.CONTRACT_ADDRESS || '',
        subgraphId: env.SUBGRAPH_ID || '',
        genesisBlockNumber: env.GENESIS_BLOCK_NUMBER || '',
        minReward: env.MIN_REWARD || '0.001',
    });

    function updateStateHandler(e: React.ChangeEvent<HTMLInputElement>): void {
        const name = e.target.name as keyof typeof state;
        setState({...state, [name]: e.target.value.trim()});
    }

    function isValidState(): [boolean, string | null] {
        const validations = [
            {condition: !state.interval, message: 'Interval field is required'},
            {
                condition: Number.isNaN(Number(state.interval)),
                message: 'Invalid interval. It must be a valid number',
            },
            {
                condition: Number(state.interval) <= 0,
                message: 'Invalid interval. Must be a positive integer',
            },
            {
                condition: !state.genesisBlockNumber,
                message: 'Genesis block number field is required',
            },
            {
                condition: Number.isNaN(Number(state.genesisBlockNumber)),
                message: 'Invalid genesis block number. Must be a valid number',
            },
            {
                condition: !state.minReward,
                message: 'Minimum reward field is required',
            },
            {
                condition: Number.isNaN(Number(state.minReward)),
                message: 'Invalid minimum reward. Must be a valid number',
            },
            {
                condition: !state.privateKey,
                message: 'Private key field is required',
            },
            {condition: !state.rpcUrl, message: 'RPC URL field is required'},
            {
                condition: !isValidHttpUrl(state.rpcUrl),
                message: 'Invalid RPC URL. Must be a valid HTTP(s) URL',
            },
            {
                condition: !state.address,
                message: 'Contract address field is required',
            },
            {
                condition: !state.subgraphId,
                message: 'Subgraph ID field is required',
            },
        ];

        for (const validation of validations) {
            if (validation.condition) {
                return [false, validation.message];
            }
        }

        return [true, null];
    }

    async function generateMinerPK() {
        if (!walletContext.isConnected) return connect();
        if (!walletContext.signer) return;
        const pk = await generatePrivKey(walletContext.signer);
        if (pk instanceof Error) return alert(pk.message);
        if (pk.length !== 66) return alert('Invalid private key');
        setState({...state, privateKey: pk});
    }

    return (
        <div>
            <div>
                <div className="flex items-end justify-between space-x-5 mb-4">
                    <div className="w-full">
                        <Input
                            label="Contract Address"
                            value={state.address}
                            name="address"
                            onChange={updateStateHandler}
                        />
                    </div>
                    <div className="w-full">
                        <Input
                            label="Subgraph ID"
                            value={state.subgraphId}
                            name="subgraphId"
                            onChange={updateStateHandler}
                        />
                    </div>
                </div>

                <div className="flex items-end justify-between space-x-5 mb-4">
                    <div className="w-full">
                        <Input
                            label="Interval (in seconds)"
                            value={state.interval}
                            name="interval"
                            onChange={updateStateHandler}
                        />
                    </div>
                    <div className="w-full">
                        <Input
                            label="Starting Block Number"
                            value={state.genesisBlockNumber}
                            name="genesisBlockNumber"
                            onChange={updateStateHandler}
                        />
                    </div>
                </div>
                <div className="flex items-end justify-between space-x-5 mb-4">
                    <div className="w-full">
                        <Input
                            label="Private Key"
                            placeholder="Q..."
                            value={state.privateKey}
                            name="privateKey"
                            onChange={updateStateHandler}
                            type={showPk ? 'text' : 'password'}
                        />
                    </div>
                    <div className="flex-0 flex-shrink-0 mb-0.5">
                        <Button onClick={generateMinerPK}>
                            {walletContext.isConnected
                                ? 'Generate private key using MetaMask'
                                : 'Connect MetaMask'}
                        </Button>
                    </div>
                </div>
                <div className="flex items-end justify-between space-x-5 mb-4">
                    <div className="w-full">
                        <Input
                            label="RPC URL"
                            value={state.rpcUrl}
                            name="rpcUrl"
                            onChange={updateStateHandler}
                        />
                    </div>
                    <div className="w-full">
                        <Input
                            label="Minimum Reward"
                            value={state.minReward}
                            name="minReward"
                            onChange={updateStateHandler}
                        />
                    </div>
                </div>
            </div>

            <div className="mt-4 flex space-x-4">
                <Button
                    disabled={
                        !isValidState()[0] ||
                        miningStatus === MiningStatus.Active ||
                        miningStatus === MiningStatus.Stoping ||
                        miningStatus === MiningStatus.Starting
                    }
                    onClick={() => {
                        const [isValid, error] = isValidState();
                        if (!isValid) return alert(error);

                        const interval = Number(state.interval);
                        const genesisBlockNumber = Number(
                            state.genesisBlockNumber,
                        );

                        const params = {
                            interval,
                            privateKey: state.privateKey,
                            rpcUrl: state.rpcUrl,
                            address: state.address,
                            subgraphId: state.subgraphId,
                            genesisBlockNumber,
                            minReward: state.minReward,
                        };
                        dispatch(updateMiningStatus(MiningStatus.Starting));
                        workerManager.startMining(params);
                        dispatch(updateMinerParams(params));
                        dispatch(getMinerBalance(params));
                    }}
                >
                    {miningStatus === MiningStatus.Starting
                        ? 'Starting...'
                        : 'Start Mining'}
                </Button>

                <Button
                    disabled={miningStatus !== MiningStatus.Active}
                    variant="error"
                    onClick={() => {
                        dispatch(updateMiningStatus(MiningStatus.Stoping));
                        workerManager.stopMining();
                    }}
                >
                    {miningStatus === MiningStatus.Stoping
                        ? 'Stopping'
                        : 'Stop Mining'}
                </Button>

                <Button
                    onClick={() => {
                        setShowPk(!showPk);
                    }}
                    disabled={!state.privateKey}
                >
                    {showPk ? 'Hide Private Key' : 'Show Private Key'}
                </Button>
            </div>
            <p className="text-xs mt-1">
                * Stop mining will not interpret the current iteration
            </p>
            <p className="text-xs mt-1">
                * You need to stop and start the miner again to do any update.
            </p>
            <p className="text-xs mt-1">
                * To get more details, please, follow the{' '}
                <a
                    href="https://blog.pantherprotocol.io/testnet-stage0-live/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-500 hover:underline"
                >
                    link
                </a>
                .
            </p>
        </div>
    );
};

export default MinerClientParamsForm;
