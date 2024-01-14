// SPDX-License-Identifier: BUSL-1.1
// SPDX-FileCopyrightText: Copyright 2021-22 Panther Ventures Limited Gibraltar

import assert from 'assert';

import {poseidon} from 'circomlibjs';

import {bigintToBytes32} from './bigint-conversions';
import {BranchFilledEvent, BusBatchOnboardedEvent} from './types';

const EMPTY_BATCH =
    '0x2e99dc37b0a4f107b20278c26562b55df197e0b3eb237ec672f4cf729d159b69';

export const EMPTY_TREE_ROOT =
    '0x1bdded415724018275c7fcc2f564f64db01b5bbeb06d65700564b05c3c59c9e6';

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
        this.root = EMPTY_TREE_ROOT;
        this.prevRoot = EMPTY_TREE_ROOT;
        this.branchRoot = bigintToBytes32(0n);
        this.leaf = EMPTY_BATCH;
        this.leafInd = -1;
        this.siblings = Array(this.depth);
        this.filledNodes = Array(this.depth);
        this.emptyNodes = Array(this.depth);
        this.computeEmptyNodes();
    }

    public copy(): MinerTree {
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

    public insertFilledBranch(filledBranch: BranchFilledEvent): void {
        this.insertBranch(
            bigintToBytes32(BigInt(filledBranch.busBranchFinalRoot)),
            filledBranch.branchIndex,
        );
    }

    public insertBatch(batch: BusBatchOnboardedEvent): void {
        this.insertLeaf(bigintToBytes32(BigInt(batch.batchRoot)));
        assert(
            this.branchRoot === batch.busBranchNewRoot,
            'Branch root mismatch',
        );
        assert(this.root === batch.busTreeNewRoot, 'Tree root mismatch');
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

    private insertBranch(branch: string, branchIdx: number): void {
        this.leafInd = (branchIdx << 10) - 1;
        this.root = branch;
        let nodeIdx = branchIdx;
        for (let lvl = 10; lvl < this.depth; lvl++) {
            nodeIdx = this.processNode(nodeIdx, lvl);
        }
    }

    public insertLeaf(leaf: string) {
        this.leafInd++;
        if (this.leafInd > 2 ** this.depth) {
            throw new Error('Leaf index out of range');
        }
        this.prevRoot = this.root;
        this.leaf = leaf;
        this.root = leaf;
        let nodeIdx = this.leafInd;
        for (let lvl = 0; lvl < this.depth; lvl++) {
            nodeIdx = this.processNode(nodeIdx, lvl);

            // Save the root of the branch when we're halfway through the depth
            if (lvl == this.depth / 2 - 1) {
                this.branchRoot = this.root;
            }
        }
    }

    /**
     * This function processes a node at a given depth level and index. It
     * updates the root, siblings and filledNodes properties of the class based
     * on whether the node is a right node or not.
     * @param idx - The index of the node to process
     * @param lvl - The depth level of the node to process
     * @returns The updated index
     */
    private processNode(idx: number, lvl: number): number {
        const isRightNode = idx & 1;
        if (isRightNode) {
            this.siblings[lvl] = this.filledNodes[lvl];
            this.root = bigintToBytes32(
                poseidon([this.siblings[lvl], this.root]),
            );
        } else {
            this.filledNodes[lvl] = this.root;
            this.siblings[lvl] = this.getEmptyNode(lvl);
            this.root = bigintToBytes32(
                poseidon([this.root, this.siblings[lvl]]),
            );
        }
        // Right shift the index for the next iteration
        return (idx >>= 1);
    }
}

export function calculateBatchRoot(utxos: string[]): string {
    let leaves = [...utxos];
    while (leaves.length > 1)
        leaves = Array(leaves.length >> 1)
            .fill(0)
            .map((_v: string, i: number) =>
                bigintToBytes32(poseidon([leaves[2 * i], leaves[2 * i + 1]])),
            );

    return leaves[0];
}

export function fillEmptyUTXOs(utxos: string[]): string[] {
    const emptyLeafsNum = 64 - utxos.length;
    return utxos.concat(Array(emptyLeafsNum).fill(ZERO_LEAF));
}

export function calculateDegenerateTreeRoot(utxos: string[]): string {
    return utxos
        .slice(1)
        .reduce((a, v) => bigintToBytes32(poseidon([a, v])), utxos[0]);
}
