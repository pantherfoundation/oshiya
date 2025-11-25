export const env = Object.freeze({
    INTERVAL: process.env.INTERVAL!,
    RPC_URL: process.env.RPC_URL!,
    CONTRACT_ADDRESS: process.env.CONTRACT_ADDRESS!,
    SUBGRAPH_ID: process.env.SUBGRAPH_ID!,
    SUBGRAPH_AUTH_TOKEN: process.env.SUBGRAPH_AUTH_TOKEN!,
    ZKP_TOKEN_ADDRESS: process.env.ZKP_TOKEN_ADDRESS!,
    GENESIS_BLOCK_NUMBER: process.env.GENESIS_BLOCK_NUMBER!,
    MIN_REWARD: process.env.MIN_REWARD!,
});

export const requiredEnvVars: Array<keyof typeof env> = [
    'CONTRACT_ADDRESS',
    'SUBGRAPH_ID',
    'SUBGRAPH_AUTH_TOKEN',
    'GENESIS_BLOCK_NUMBER',
    'INTERVAL',
    'RPC_URL',
    'MIN_REWARD',
    'ZKP_TOKEN_ADDRESS',
];
