export enum WorkerMessage {
    StartMining = 'mining/start',
    StopMining = 'mining/stop',
    Logs = 'logs',
    Stats = 'stats',
    MiningStatus = 'mining/status',
}

export type MinerClientParams = {
    interval: number;
    privateKey: string;
    rpcUrl: string;
    address: string;
    subgraphId: string;
    genesisBlockNumber: string;
};
