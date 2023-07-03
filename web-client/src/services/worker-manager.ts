import {TypedWorker, isMessageOf} from 'utils/worker';
import MinerWorker from './miner.worker';
import {WorkerMessage} from 'types/worker';

export class WorkerManager {
    private worker: TypedWorker;

    constructor() {
        this.worker = new MinerWorker();
        this.worker.addEventListener('message', event => {
            console.log('sev::manager', event.data);
        });
        this.worker.postMessage({type: WorkerMessage.StartMining});
    }
}

export const workerManager = new WorkerManager();

console.log('hello...');
