import {resolve} from 'path';

import dotenv from 'dotenv';
import {Wallet, Contract, providers} from 'ethers';

import BUS_ABI from '../src/contract/bus-tree-abi.json';

import inputs from './data/busTreeScenario_32_steps.json';

dotenv.config({path: resolve(__dirname, '../.env')});

const deployer = new Wallet(process.env.PRIVATE_KEY!);
const provider = new providers.JsonRpcProvider(process.env.RPC_URL!);
const signer = deployer.connect(provider);

const busTree = new Contract(process.env.CONTRACT_ADDRESS!, BUS_ABI, signer);

type ScenarioStep = {
    description: string;
    calls: Array<{method: string; params: Array<any>}>;
};

async function playScenario(scenarioSteps: ScenarioStep[]) {
    const receipts: Array<any[]> = [];
    for (const step of scenarioSteps) {
        const stepInd = receipts.push([]) - 1;
        const nTxs = step.calls.length;
        console.log(`${step.description} (with ${nTxs} txs)`);
        let i = 1;

        for (const c of step.calls) {
            const method = c.method.replace(/\(.+\)/, '');
            console.log(`Tx ${i++} of ${nTxs} (${method})`);

            const tx = await busTree[method](...c.params);
            const rcp = await tx.wait();

            receipts[stepInd].push(rcp);
        }
    }
    return receipts;
}

async function main() {
    try {
        const rcps = await playScenario(
            inputs.filter((v: any) =>
                v.description.includes('Queue the Batch'),
            ),
        );
        console.log(JSON.stringify(rcps, null, 2));
    } catch (err) {
        console.error(err);
    }
}

main();
