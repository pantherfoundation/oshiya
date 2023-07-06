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
import {getZkpBalance} from 'redux/slices/miner/zkpBalance';
import {AppDispatch, useAppSelector} from 'redux/store';

const MinerClientParamsForm = () => {
    const dispatch = useDispatch<AppDispatch>();
    const isMining = useAppSelector(state => state.miner.isMining);
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

    return (
        <div>
            <div>
                <Input
                    label="Interval (in seconds)"
                    value={state.interval}
                    name="interval"
                    onChange={updateStateHandler}
                />
                <Input
                    label="Private Key"
                    placeholder="Q..."
                    value={state.privateKey}
                    name="privateKey"
                    onChange={updateStateHandler}
                />
                <Input
                    label="RPC URL"
                    value={state.rpcUrl}
                    name="rpcUrl"
                    onChange={updateStateHandler}
                />
            </div>

            <div className="mt-4 flex space-x-4">
                <Button
                    disabled={!isValidState()[0] || isMining}
                    onClick={() => {
                        const [isValid, error] = isValidState();
                        if (!isValid) return alert(error);

                        const interval = Number(state.interval);
                        const params = {
                            interval,
                            privateKey: state.privateKey,
                            rpcUrl: state.rpcUrl,
                        };
                        workerManager.startMining(params);
                        dispatch(updateMinerParams(params));
                        dispatch(getZkpBalance(params));
                    }}
                >
                    Start Mining
                </Button>

                <Button
                    disabled={!isMining}
                    variant="error"
                    onClick={() => {
                        workerManager.stopMining();
                    }}
                >
                    Stop Mining
                </Button>
            </div>
            <p className="text-xs mt-1">
                * Stop mining will not interpret the current iteration
            </p>
        </div>
    );
};

export default MinerClientParamsForm;
