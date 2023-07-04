import {WorkerMessage} from 'types/worker';

export function isMessageOf<T>(
    type: WorkerMessage,
    data: any,
): data is T & {type: WorkerMessage} {
    return data && data.type === type;
}

export class TypedWorker extends Worker {
    constructor() {
        super('');
    }
}
