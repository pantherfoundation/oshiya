import Button from 'components/widgets/Button';
import Input from 'components/widgets/Input';
import React, {useState} from 'react';
import {env} from 'services/env';
import {workerManager} from 'services/worker-manager';
import {MinerClientParams} from 'types/worker';
import {isValidHttpUrl} from 'utils/helpers';
import {ethers} from 'ethers';
import {useDispatch} from 'react-redux';
import {updateMinerParams} from 'redux/slices/miner/minerParams';
import {getMinerBalance} from 'redux/slices/miner/zkpBalance';
import {AppDispatch, useAppSelector} from 'redux/store';
import {useWalletConnect, useWalletContext} from 'hooks/wallet';
import {generatePrivKey} from 'services/keys';
import {hexlify} from 'ethers/lib/utils.js';
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
    }>({
        interval: '20',
        privateKey: '',
        rpcUrl: env.RPC_URL || '',
    });

    function updateStateHandler(e: React.ChangeEvent<HTMLInputElement>): void {
        const name = e.target.name as keyof typeof state;
        setState({...state, [name]: e.target.value.trim()});
    }

    function isValidState(): [boolean, string | null] {
        if (!state.interval) return [false, 'Interval field is required'];
        const interval = Number(state.interval);

        if (Number.isNaN(interval))
            return [false, 'Invalid interval. It must be a valid number'];

        if (interval <= 0)
            return [false, 'Invalid interval. Must be a positive integers'];

        if (!state.privateKey) return [false, 'Private key field is required'];

        if (!state.rpcUrl) return [false, 'RPC URL field is required'];

        if (!isValidHttpUrl(state.rpcUrl))
            return [false, 'Invalid RPC URL. Must be a valid HTTP(s) URL'];

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
                <div className="mb-4">
                    <Input
                        label="Interval (in seconds)"
                        value={state.interval}
                        name="interval"
                        onChange={updateStateHandler}
                    />
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
                <Input
                    label="RPC URL"
                    value={state.rpcUrl}
                    name="rpcUrl"
                    onChange={updateStateHandler}
                />
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
                        const params = {
                            interval,
                            privateKey: state.privateKey,
                            rpcUrl: state.rpcUrl,
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
        </div>
    );
};

export default MinerClientParamsForm;
