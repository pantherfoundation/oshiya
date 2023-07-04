import {} from 'redux';
import {configureStore, combineReducers} from '@reduxjs/toolkit';
import {logsReducer} from './slices/logs';

const rootReducer = combineReducers({
    logs: logsReducer,
});

export const store = configureStore({
    reducer: rootReducer,
});

export type AppDispatch = typeof store.dispatch;
export type RootState = ReturnType<typeof store.getState>;
