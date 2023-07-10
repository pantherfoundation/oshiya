import {combineReducers} from '@reduxjs/toolkit';
import {minerParamsReducer} from './minerParams';
import {mienrBalanceReducer} from './minerBalance';
import {miningStatusRedcuer} from './miningStatus';

export const minerReducer = combineReducers({
    minerParams: minerParamsReducer,
    minerBalance: mienrBalanceReducer,
    miningStatus: miningStatusRedcuer,
});
