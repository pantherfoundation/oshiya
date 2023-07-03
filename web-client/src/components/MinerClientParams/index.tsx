import Button from 'components/widgets/Button';
import Input from 'components/widgets/Input';
import React from 'react';
import {env} from 'services/env';

const MinerClientParams = () => {
    return (
        <div>
            <div>
                <Input label="Interval (in seconds)" value={env.INTERVAL} />
                <Input label="Private Key" placeholder="Q..." />
                <Input label="RPC URL" value={env.RPC_URL} />
                <Input label="Contract Address" value={env.CONTRACT_ADDRESS} />
                <Input label="Subgraph ID" value={env.SUBGRAPH_ID} />
            </div>

            <div className="mt-4">
                <Button
                    onClick={() => {
                        // swManager.sendMessage({
                        //     type: SwMessage.StartMining,
                        // });
                    }}
                >
                    Start Mining
                </Button>
            </div>
        </div>
    );
};

export default MinerClientParams;
