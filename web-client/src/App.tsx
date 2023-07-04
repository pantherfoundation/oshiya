import MinerClientParams from 'components/MinerClientParams';
import React, {useState} from 'react';
import './services/worker-manager';
import {useLogsHandler} from 'redux/hooks/logs';
import MinerLogs from 'components/MinerLogs';

const App = () => {
    useLogsHandler();

    return (
        <div className="max-w-screen-lg mx-auto pb-10">
            <h1 className="text-5xl text-center my-5">Panther Miner Client</h1>
            <MinerClientParams />
            <MinerLogs />
        </div>
    );
};

export default App;
