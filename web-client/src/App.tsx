import MinerClientParams from 'components/MinerClientParams';
import React, {useState} from 'react';
import './services/worker-manager';
import {useLogsHandler} from 'redux/hooks/logs';

const App = () => {
    useLogsHandler();

    return (
        <div className="max-w-screen-lg mx-auto">
            <h1 className="text-5xl text-center my-5">Panther Miner Client</h1>

            <MinerClientParams />
        </div>
    );
};

export default App;
