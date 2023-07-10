import {combineReducers} from '@reduxjs/toolkit';
import {minerParamsReducer} from './minerParams';
import {mienrBalanceReducer} from './zkpBalance';
import {miningStatusRedcuer} from './miningStatus';

export const minerReducer = combineReducers({
    minerParams: minerParamsReducer,
    minerBalance: mienrBalanceReducer,
    miningStatus: miningStatusRedcuer,
});
