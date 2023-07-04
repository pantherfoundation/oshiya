import {useEffect} from 'react';
import {useDispatch} from 'react-redux';
import {newLog} from 'redux/slices/logs';
import {workerManager} from 'services/worker-manager';
import {WorkerMessage} from 'types/worker';
import {isMessageOf} from 'utils/worker';

export function useLogsHandler() {
    const dispatch = useDispatch();

    useEffect(() => {
        workerManager.handleMessages(event => {
            if (
                isMessageOf<{message: string}>(WorkerMessage.Logs, event.data)
            ) {
                dispatch(newLog(event.data.message));
            }
        });
    }, []);
}
