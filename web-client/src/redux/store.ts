import {} from 'redux';
import {configureStore, combineReducers} from '@reduxjs/toolkit';
import {logsReducer} from './slices/logs';
import {statsReducer} from './slices/stats';
import {minerReducer} from './slices/miner';
import {TypedUseSelectorHook, useSelector} from 'react-redux';

const rootReducer = combineReducers({
    logs: logsReducer,
    stats: statsReducer,
    miner: minerReducer,
});

export const store = configureStore({
    reducer: rootReducer,
});

export type AppDispatch = typeof store.dispatch;
export type RootState = ReturnType<typeof store.getState>;
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
