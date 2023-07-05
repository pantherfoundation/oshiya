import {combineReducers} from '@reduxjs/toolkit';
import {minerParamsReducer} from './minerParams';
import {zkpBalanceReducer} from './zkpBalance';
import {miningStatusRedcuer} from './miningStatus';

export const minerReducer = combineReducers({
    minerParams: minerParamsReducer,
    zkpBalance: zkpBalanceReducer,
    isMining: miningStatusRedcuer,
});
