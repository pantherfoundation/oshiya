import {useAppSelector} from '../../redux/store';
import React from 'react';
import {Wallet, utils} from 'ethers';
import BigNumber from 'bignumber.js';

const MinerStats = () => {
    const stats = useAppSelector(state => state.stats);
    const {matic, zkp} = useAppSelector(state => state.miner.minerBalance);
    const minerParams = useAppSelector(state => state.miner.minerParams);

    const walletAddress = minerParams.privateKey
        ? new Wallet(minerParams.privateKey).address
        : null;

    return (
        <div className="w-full">
            <h1 className="text-center mt-9 text-6xl">Mining Statistics</h1>

            <div className="mx-auto mt-4 px-4 max-w-xl">
                {minerParams.privateKey && (
                    <p className="mb-2">
                        Wallet Address:{' '}
                        <strong className="font-mono font-bold text-sm">
                            {new Wallet(minerParams.privateKey).address}{' '}
                        </strong>
                    </p>
                )}

                <div className="text-left mb-2">
                    <p>
                        <span>Balance:</span>
                        <strong className="inline-block ml-1">
                            {utils.formatEther(matic)} MATIC
                        </strong>
                    </p>
                    {walletAddress &&
                        new BigNumber(matic).shiftedBy(-18).lte(0.1) && (
                            <p className="text-sm text-red-700 font-bold">
                                <strong>
                                    Your MATIC balance is too low, make sure to
                                    send some MATIC to your wallet (
                                    {walletAddress}) to be able to mine
                                </strong>
                            </p>
                        )}
                </div>
                <p className="text-left mb-2">
                    Reward:{' '}
                    <strong className="inline-block ml-1">
                        {utils.formatEther(zkp)} $ZKP
                    </strong>
                </p>

                {[
                    ['Mining Success', stats.miningSuccess],
                    ['Mining Error', stats.miningError],
                    ['Generated Proof', stats.generatedProof],
                    ['Submitted Proof', stats.submittedProof],
                ].map(([key, value]) => (
                    <div
                        className="flex flex-row justify-between align-middle mb-2"
                        key={key}
                    >
                        <p>
                            <strong>{value}</strong> x {key}
                        </p>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default MinerStats;
