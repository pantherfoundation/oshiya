import fs from 'fs';
import {groth16} from 'snarkjs';

import {ZKProver} from '../src/zk-prover';
import {ProofInputs} from '../src/types';

jest.mock('fs', () => ({readFileSync: jest.fn()}));
jest.mock('snarkjs', () => ({
    groth16: {fullProve: jest.fn(), verify: jest.fn()},
}));

describe('browser proof artifacts', () => {
    it('uses supplied artifacts without filesystem access and still verifies the proof', async () => {
        const proof = {
            protocol: 'groth16',
            curve: 'bn128',
            pi_a: ['1', '2'],
            pi_b: [
                ['3', '4'],
                ['5', '6'],
            ],
            pi_c: ['7', '8'],
        };
        const verificationKey = {protocol: 'groth16'};
        jest.mocked(groth16.fullProve).mockResolvedValue({
            proof,
            publicSignals: ['9'],
        });
        jest.mocked(groth16.verify).mockResolvedValue(true);
        const prover = new ZKProver({
            wasmFilePath: '/circuits.wasm',
            zKeyPath: '/provingKey.zkey',
            verificationKey,
        });
        const inputs = {} as ProofInputs;

        await prover.generateProof(inputs);

        expect(fs.readFileSync).not.toHaveBeenCalled();
        expect(groth16.fullProve).toHaveBeenCalledWith(
            inputs,
            '/circuits.wasm',
            '/provingKey.zkey',
            null,
        );
        expect(groth16.verify).toHaveBeenCalledWith(
            verificationKey,
            ['9'],
            proof,
            null,
        );
        jest.mocked(groth16.verify).mockResolvedValue(false);
        await expect(prover.generateProof(inputs)).rejects.toThrow(
            'Proof verification failed',
        );
    });
});
