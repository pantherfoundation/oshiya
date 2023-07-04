import {TypedWorker, isMessageOf} from 'utils/worker';
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
        this.worker.addEventListener('message', handler);
    }
}

export const workerManager = new WorkerManager();
