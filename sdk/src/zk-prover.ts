// SPDX-License-Identifier: MIT
// SPDX-FileCopyrightText: Copyright 2024 Panther Protocol Foundation

import fs from 'fs';
import {join} from 'path';

import {groth16} from 'snarkjs';

import {ProofInputs} from './types';

export interface ProofArtifacts {
    wasmFilePath: string;
    zKeyPath: string;
    verificationKey: object;
}

export class ZKProver {
    private readonly verificationKey: object;
    private readonly wasmFilePath: string;
    private readonly zKeyPath: string;

    constructor(protocolVersion: string | ProofArtifacts) {
        if (typeof protocolVersion !== 'string') {
            this.wasmFilePath = protocolVersion.wasmFilePath;
            this.zKeyPath = protocolVersion.zKeyPath;
            this.verificationKey = protocolVersion.verificationKey;
            return;
        }
        const vkey = join(
            __dirname,
            `./wasm/${protocolVersion}/verificationKey.json`,
        );

        this.wasmFilePath = join(
            __dirname,
            `./wasm/${protocolVersion}/circuits.wasm`,
        );

        this.zKeyPath = join(
            __dirname,
            `./wasm/${protocolVersion}/provingKey.zkey`,
        );

        this.verificationKey = JSON.parse(
            fs.readFileSync(vkey).toString('utf-8'),
        );
    }

    public async generateProof(pInput: ProofInputs): Promise<any> {
        const {proof: lProof, publicSignals} = await groth16.fullProve(
            pInput,
            this.wasmFilePath,
            this.zKeyPath,
            null,
        );

        const solProof = (replica => [
            replica.pi_a.slice(0, 2),
            replica.pi_b.slice(0, 2).map((x: any) => x.reverse()),
            replica.pi_c.slice(0, 2),
        ])(JSON.parse(JSON.stringify(lProof)));

        const isValid = await groth16.verify(
            this.verificationKey,
            publicSignals,
            lProof,
            null,
        );

        if (!isValid) throw new Error('Proof verification failed');
        else console.log('Proof verified successfully');
        return [solProof, publicSignals];
    }
}
