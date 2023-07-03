import {ZKProver} from '../src/zk-prover';

import inputs from './data/busTreeScenario_32_steps.proofInput.json';

describe('zk-prover', () => {
    const zkProver = new ZKProver();

    it('correctly calculates proves on valid data', async () => {
        await zkProver.generateProof(inputs[0]);
    });
});
