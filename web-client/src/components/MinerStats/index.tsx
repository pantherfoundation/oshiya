import {useAppSelector} from '../../redux/store';
import React from 'react';
import {utils} from 'ethers';

const MinerStats = () => {
    const stats = useAppSelector(state => state.stats);
    const {matic, zkp} = useAppSelector(state => state.miner.zkpBalance);

    return (
        <div className="w-full">
            <h1 className="text-center mt-9 text-6xl">Mining Statistics</h1>

            <div className="mx-auto mt-4 px-4 max-w-xl">
                <p className="text-left mb-2">
                    Balance:
                    <strong className="inline-block ml-1">
                        {utils.formatEther(matic)} MATIC
                    </strong>
                </p>
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
