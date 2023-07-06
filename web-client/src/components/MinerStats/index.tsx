import {useAppSelector} from '../../redux/store';
import React from 'react';
import {utils} from 'ethers';

const MinerStats = () => {
    const stats = useAppSelector(state => state.stats);
    const balance = useAppSelector(state => state.miner.zkpBalance.value);

    return (
        <div className="w-full">
            <h1 className="text-center mt-9 text-6xl">Mining Statistics</h1>

            <div className="mx-auto mt-4 px-4 max-w-xl">
                <p className="text-left mb-2">
                    Balance (reward):{' '}
                    <strong>{utils.formatEther(balance)} $ZKP</strong>
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
