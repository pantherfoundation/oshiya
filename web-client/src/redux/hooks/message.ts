import {useEffect} from 'react';
import {useDispatch} from 'react-redux';
import {newLog} from 'redux/slices/logs';
import {StatsState, updateStats} from 'redux/slices/stats';
import {workerManager} from 'services/worker-manager';
import {WorkerMessage} from 'types/worker';
import {isMessageOf} from 'utils/worker';

export function useMessageHandler() {
    const dispatch = useDispatch();

    useEffect(() => {
        workerManager.handleMessages(event => {
            if (
                isMessageOf<{message: string}>(WorkerMessage.Logs, event.data)
            ) {
                dispatch(newLog(event.data.message));
            }

            if (isMessageOf<StatsState>(WorkerMessage.Stats, event.data)) {
                dispatch(
                    updateStats({
                        countMetrics: event.data.countMetrics,
                        listMetrics: event.data.listMetrics,
                    }),
                );
            }
        });
    }, []);
}
