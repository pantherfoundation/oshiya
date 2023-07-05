import {TypedWorker} from 'utils/worker';
import MinerWorker from './miner.worker';
import {MinerClientParams, WorkerMessage} from 'types/worker';

export class WorkerManager {
    private worker: TypedWorker;

    constructor() {
        this.worker = new MinerWorker();
    }

    public startMining(params: MinerClientParams) {
        this.worker.postMessage({type: WorkerMessage.StartMining, ...params});
    }

    public handleMessages(handler: (event: MessageEvent) => void): void {
        if (this.worker === null) return;
        this.worker.onmessage = handler;
    }

    public stopMining(): void {
        this.worker.postMessage({type: WorkerMessage.StopMining});
    }
}

export const workerManager = new WorkerManager();
