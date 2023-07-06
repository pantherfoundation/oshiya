import MinerClientParams from 'components/MinerClientParams';
import React from 'react';
import './services/worker-manager';
import {useMessageHandler} from 'redux/hooks/message';
import MinerLogs from 'components/MinerLogs';
import MinerStats from 'components/MinerStats';
import Balance from 'components/Balance';
import {env, requiredEnvVars} from 'services/env';

const App = () => {
    useMessageHandler();

    const missingEnvVars = requiredEnvVars.filter(envVar => !env[envVar]);
    if (missingEnvVars.length !== 0) {
        return (
            <div className="m-10 text-left">
                <h1 className="text-5xl my-5">Panther Miner Client</h1>

                <h1>Missing Required Environment Variables</h1>

                <ul className="list-disc list-inside my-4">
                    {missingEnvVars.map(envVar => (
                        <li key={envVar} className="font-mono mb-1">
                            {envVar}
                        </li>
                    ))}
                </ul>
            </div>
        );
    }

    return (
        <div className="max-w-screen-lg mx-auto pb-10">
            <h1 className="text-5xl text-center my-5">Panther Miner Client</h1>
            <MinerClientParams />
            <Balance />
            <MinerLogs />
            <MinerStats />
        </div>
    );
};

export default App;
