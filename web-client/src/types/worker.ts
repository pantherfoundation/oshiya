export enum WorkerMessage {
    StartMining = 'start-mining',
    StopMining = 'stop-mining',
    Logs = 'logs',
    Stats = 'stats',
}

export type MinerClientParams = {
    interval: number;
    privateKey: string;
    rpcUrl: string;
    contractAddr: string;
    subgraphId: string;
};
