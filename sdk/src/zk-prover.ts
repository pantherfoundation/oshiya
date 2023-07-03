// SPDX-License-Identifier: BUSL-1.1
// SPDX-FileCopyrightText: Copyright 2021-22 Panther Ventures Limited Gibraltar

import assert from 'assert';
import {readFileSync} from 'fs';
import {join} from 'path';

import {groth16} from 'snarkjs';
import {ProofInputs} from 'types';

import verificationKey from './wasm/VK_pantherBusTreeUpdater.json';
import witnessCalculator from './wasm/witness_calculator';

export class ZKProver {
    private readonly wasmBuffer: Buffer;
    private readonly provKeyPath: string;
    private readonly verifKeyPath: any;

    constructor() {
        this.wasmBuffer = readFileSync(
            join(__dirname, './wasm/pantherBusTreeUpdater.wasm'),
        );
        this.provKeyPath = join(
            __dirname,
            './wasm/pantherBusTreeUpdater_final.zkey',
        );
        this.verifKeyPath = verificationKey;
    }

    public async generateProof(pInput: ProofInputs): Promise<any> {
        const witness = await witnessCalculator(this.wasmBuffer).then(
            async (witCalc: any) => witCalc.calculateWTNSBin(pInput, 0),
        );

        const {proof: lProof, publicSignals} = await groth16.prove(
            this.provKeyPath,
            witness,
            null,
        );

        assert(
            await groth16.verify(
                this.verifKeyPath,
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

        return solProof;
    }
}
