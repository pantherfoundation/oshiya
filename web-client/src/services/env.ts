export const env = Object.freeze({
    INTERVAL: process.env.INTERVAL,
    CONTRACT_ADDRESS: process.env.CONTRACT_ADDRESS,
    RPC_URL: process.env.RPC_URL,
    SUBGRAPH_ID: process.env.SUBGRAPH_ID,
    ZKP_TOKEN_ADDRESS: process.env.ZKP_TOKEN_ADDRESS,
    GENESIS_BLOCK_NUMBER: process.env.GENESIS_BLOCK_NUMBER,
});

export const requiredEnvVars: Array<keyof typeof env> = [
    'CONTRACT_ADDRESS',
    'SUBGRAPH_ID',
    'GENESIS_BLOCK_NUMBER',
    'ZKP_TOKEN_ADDRESS',
];
