import {useEffect} from 'react';
import {useDispatch} from 'react-redux';
import {newLog} from 'redux/slices/logs';
import {updateMiningStatus} from 'redux/slices/miner/miningStatus';
import {getMinerBalance} from 'redux/slices/miner/minerBalance';
import {updateStats} from 'redux/slices/stats';
import {AppDispatch, useAppSelector} from 'redux/store';
import {workerManager} from 'services/worker-manager';
import {WorkerMessage} from 'types/worker';
import {isMessageOf} from 'utils/worker';
import {Stats} from '@panther-miner/sdk/lib';
import {MiningStatus} from 'types/miner';

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

            if (isMessageOf<{stats: Stats}>(WorkerMessage.Stats, event.data)) {
                dispatch(updateStats(event.data.stats));
                dispatch(getMinerBalance(minerParams));
            }

            if (
                isMessageOf<{status: MiningStatus}>(
                    WorkerMessage.MiningStatus,
                    event.data,
                )
            ) {
                dispatch(updateMiningStatus(event.data.status));
            }
        });
    }, [minerParams]);
}
