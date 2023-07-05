import {utils} from 'ethers';
import React from 'react';
import {useAppSelector} from 'redux/store';

const Balance = () => {
    const balance = useAppSelector(state => state.miner.zkpBalance.value);
    const minerParams = useAppSelector(state => state.miner.minerParams);

    if (minerParams.privateKey === '') return;
    return (
        <div className="my-10">
            <p className="text-center">
                Balance (reward):{' '}
                <strong>{utils.formatEther(balance)} $ZKP</strong>
            </p>
        </div>
    );
};

export default Balance;
