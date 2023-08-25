// SPDX-License-Identifier: BUSL-1.1
// SPDX-FileCopyrightText: Copyright 2021-22 Panther Ventures Limited Gibraltar

import assert from 'assert';

import {groth16} from 'snarkjs';

import {ProofInputs} from './types';
import verificationKey from './wasm/VK_pantherBusTreeUpdater.json';

export class ZKProver {
    private readonly verificationKey: any;

    constructor(
        private readonly wasmFilePath: string,
        private readonly zKeyPath: string,
    ) {
        this.verificationKey = verificationKey;
    }

    public async generateProof(pInput: ProofInputs): Promise<any> {
        const {proof: lProof, publicSignals} = await groth16.fullProve(
            pInput,
            this.wasmFilePath,
            this.zKeyPath,
            null,
        );

        assert(
            await groth16.verify(
                this.verificationKey,
                publicSignals,
                lProof,
                null,
            ),
        );

        const solProof = (replica => [
            replica.pi_a.slice(0, 2),
            replica.pi_b.slice(0, 2).map((x: any) => x.reverse()),
            replica.pi_c.slice(0, 2),
        ])(JSON.parse(JSON.stringify(lProof)));

        return [solProof, publicSignals];
    }
}
