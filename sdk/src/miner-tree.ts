// SPDX-License-Identifier: BUSL-1.1
// SPDX-FileCopyrightText: Copyright 2021-22 Panther Ventures Limited Gibraltar

import assert from 'assert';

import {poseidon} from 'circomlibjs';

import {bigintToBytes32} from './bigint-conversions';
import {BusBatchOnboardedEvent} from './types';

const EMPTY_BATCH =
    '0x2e99dc37b0a4f107b20278c26562b55df197e0b3eb237ec672f4cf729d159b69';

const ZERO_LEAF =
    '0x0667764c376602b72ef22218e1673c2cc8546201f9a77807570b3e5de137680d';

export class MinerTree {
    public root: string;
    public prevRoot: string;
    public branchRoot: string;
    public leaf: string;
    public leafInd: number;
    public siblings: string[];
    public filledNodes: string[];
    public emptyNodes: string[];
    public depth: number;

    constructor(depth = 20) {
        this.depth = depth;
        this.root = '0x0000000';
        this.prevRoot = '0x0000000';
        this.branchRoot = '0x0000000';
        this.leaf = EMPTY_BATCH;
        this.leafInd = -1;
        this.siblings = Array(this.depth);
        this.filledNodes = Array(this.depth);
        this.emptyNodes = Array(this.depth);
        this.computeEmptyNodes();
    }

    copy(): MinerTree {
        const copiedTree = new MinerTree(this.depth);
        copiedTree.root = this.root;
        copiedTree.prevRoot = this.prevRoot;
        copiedTree.branchRoot = this.branchRoot;
        copiedTree.leaf = this.leaf;
        copiedTree.leafInd = this.leafInd;
        copiedTree.siblings = [...this.siblings];
        copiedTree.filledNodes = [...this.filledNodes];
        copiedTree.getEmptyNode = this.getEmptyNode;
        copiedTree.emptyNodes = [...this.emptyNodes];
        return copiedTree;
    }

    insertLeaf(leaf: string) {
        this.leafInd++;
        if (this.leafInd > 2 ** this.depth) {
            throw new Error('Leaf index out of range');
        }
        this.prevRoot = this.root;
        this.leaf = leaf;
        this.root = leaf;
        let idx = this.leafInd;
        for (let l = 0; l < this.depth; l++) {
            const isRightNode = idx & 1;
            if (isRightNode) {
                this.siblings[l] = this.filledNodes[l];
                this.root = bigintToBytes32(
                    poseidon([this.siblings[l], this.root]),
                );
            } else {
                this.filledNodes[l] = this.root;
                this.siblings[l] = this.getEmptyNode(l);
                this.root = bigintToBytes32(
                    poseidon([this.root, this.siblings[l]]),
                );
            }

            if (l == this.depth / 2 - 1) {
                this.branchRoot = this.root;
            }

            idx >>= 1;
        }
    }

    insertBatch(batch: BusBatchOnboardedEvent) {
        this.insertLeaf(bigintToBytes32(BigInt(batch.batchRoot)));
        assert(this.root === batch.busTreeNewRoot, 'Tree root mismatch');
        assert(
            this.branchRoot === batch.busBranchNewRoot,
            'Branch root mismatch',
        );
    }

    private getEmptyNode(level: number): string {
        return this.emptyNodes[level];
    }

    private computeEmptyNodes(): void {
        this.emptyNodes = [this.leaf];
        for (let layer = 1; layer <= this.depth; layer++) {
            const prevLayerHash = this.emptyNodes[layer - 1];
            this.emptyNodes.push(
                bigintToBytes32(poseidon([prevLayerHash, prevLayerHash])),
            );
        }
    }
}

export function calculateBatchRoot(utxos: string[]): string {
    const emptyLeafsNum = 64 - utxos.length;
    let leaves = utxos.concat(Array(emptyLeafsNum).fill(ZERO_LEAF));

    while (leaves.length > 1)
        leaves = Array(leaves.length >> 1)
            .fill(0)
            .map((v: string, i: number) =>
                bigintToBytes32(poseidon([leaves[2 * i], leaves[2 * i + 1]])),
            );

    return leaves[0];
}

export function calculateDegenerateTreeRoot(utxos: string[]): string {
    return utxos
        .slice(1)
        .reduce((a, v) => bigintToBytes32(poseidon([a, v])), utxos[0]);
}
