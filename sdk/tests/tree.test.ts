// SPDX-License-Identifier: MIT
// SPDX-FileCopyrightText: Copyright 2024 Panther Protocol Foundation

import {
    calculateBatchRoot,
    calculateDegenerateTreeRoot,
} from '../src/miner-tree';

import inputs from './data/busTreeScenario_32_steps.proofInput.json';

describe('prof inputs preparation', () => {
    it('#calculateDegenerateTreeRoot', async () => {
        expect(
            calculateDegenerateTreeRoot(
                inputs[0].newLeafs.slice(0, inputs[0].nNonEmptyNewLeafs),
            ),
        ).toEqual(inputs[0].newLeafsCommitment);
    });

    it('#calculateBatchRoot', async () => {
        expect(calculateBatchRoot(inputs[0].newLeafs)).toEqual(
            inputs[0].batchRoot,
        );
    });
});
