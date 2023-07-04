import MinerClientParams from 'components/MinerClientParams';
import React, {useState} from 'react';
import './services/worker-manager';
import {useMessageHandler} from 'redux/hooks/message';
import MinerLogs from 'components/MinerLogs';
import MinerStats from 'components/MinerStats';

const App = () => {
    useMessageHandler();

    return (
        <div className="max-w-screen-lg mx-auto pb-10">
            <h1 className="text-5xl text-center my-5">Panther Miner Client</h1>
            <MinerClientParams />
            <MinerStats />
            <MinerLogs />
        </div>
    );
};

export default App;
