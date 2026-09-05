// SPDX-License-Identifier: MIT
// SPDX-FileCopyrightText: Copyright 2024 Panther Protocol Foundation

export const REQUIRED_NODE_MAJOR = 24;

/**
 * The miner requires Node 24.
 *
 * Node 16 has no Happy Eyeballs: `net` takes the first address `dns.lookup`
 * returns and never tries another. `subgraph.pantherdao.app` publishes an
 * anycast pair, and when one half is unroutable -- which happens -- the miner
 * would hang until ETIMEDOUT and fail its cold start, while curl and browsers
 * sailed through by walking the whole list. From Node 20 `autoSelectFamily` is
 * on by default and the dead address costs one attempt timeout instead.
 *
 * `engines` alone does not enforce this: yarn only warns, and running
 * `ts-node scripts/run.ts` under whatever `node` happens to be on PATH skips
 * the check entirely. So assert it in the process that depends on it.
 */
export function assertNodeVersion(): void {
    const major = Number(process.versions.node.split('.').at(0));
    if (major === REQUIRED_NODE_MAJOR) return;

    throw new Error(
        `The miner requires Node ${REQUIRED_NODE_MAJOR}, but this process is ` +
            `running ${process.version}. Run \`nvm use\` to pick up the ` +
            `version pinned in .nvmrc.`,
    );
}
