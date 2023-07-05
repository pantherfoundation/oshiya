import {useEffect} from 'react';
import {useDispatch} from 'react-redux';
import {newLog} from 'redux/slices/logs';
import {updateMiningStatus} from 'redux/slices/miner/miningStatus';
import {getZkpBalance} from 'redux/slices/miner/zkpBalance';
import {StatsState, updateStats} from 'redux/slices/stats';
import {AppDispatch, useAppSelector} from 'redux/store';
import {workerManager} from 'services/worker-manager';
import {WorkerMessage} from 'types/worker';
import {isMessageOf} from 'utils/worker';

export function useMessageHandler() {
    const dispatch = useDispatch<AppDispatch>();
    const minerParams = useAppSelector(state => state.miner.minerParams);

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
                dispatch(getZkpBalance(minerParams));
            }
        });
    }, [minerParams]);
}
