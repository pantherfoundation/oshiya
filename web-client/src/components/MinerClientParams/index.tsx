import Button from 'components/widgets/Button';
import Input from 'components/widgets/Input';
import React, {useState} from 'react';
import {env} from 'services/env';
import {workerManager} from 'services/worker-manager';
import {MinerClientParams} from 'types/worker';
import {isValidHttpUrl} from 'utils/helpers';
import {ethers} from 'ethers';

const MinerClientParamsForm = () => {
    const [state, setState] = useState<
        Omit<MinerClientParams, 'interval'> & {interval: string}
    >({
        interval: '30',
        privateKey: '',
        rpcUrl: env.RPC_URL || '',
        contractAddr: env.CONTRACT_ADDRESS || '',
        subgraphId: env.SUBGRAPH_ID || '',
    });

    function updateStateHandler(e: React.ChangeEvent<HTMLInputElement>): void {
        const name = e.target.name as keyof typeof state;
        setState({...state, [name]: e.target.value.trim()});
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
                <Input
                    label="Contract Address"
                    value={state.contractAddr}
                    name="contractAddr"
                    onChange={updateStateHandler}
                />
                <Input
                    label="Subgraph ID"
                    value={state.subgraphId}
                    name="subgraphId"
                    onChange={updateStateHandler}
                />
            </div>

            <div className="mt-4">
                <Button
                    onClick={() => {
                        if (!state.interval)
                            return alert('Interval field is required');

                        const interval = Number(state.interval);

                        if (Number.isNaN(interval))
                            return alert(
                                'Invalid interval. It must be a valid number',
                            );

                        if (interval <= 0)
                            return alert(
                                'Invalid interval. Must be a positive integers',
                            );

                        if (!state.privateKey)
                            return alert('Private key field is required');

                        if (!state.rpcUrl)
                            return alert('RPC URL field is required');

                        if (!isValidHttpUrl(state.rpcUrl))
                            return alert(
                                'Invalid RPC URL. Must be a valid HTTP(s) URL',
                            );

                        if (!ethers.utils.isAddress(state.contractAddr))
                            return alert('Invalid contract address.');

                        if (!state.subgraphId)
                            return alert('Subgraph ID field is required.');

                        workerManager.startMining({
                            ...state,
                            interval,
                        });
                    }}
                >
                    Start Mining
                </Button>
            </div>
        </div>
    );
};

export default MinerClientParamsForm;
