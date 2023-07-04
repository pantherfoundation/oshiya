import {combineReducers, createSlice} from '@reduxjs/toolkit';

const initialState: string[] = [];

const logsSlice = createSlice({
    name: 'logs',
    initialState,
    reducers: {
        log: (state, {payload}) => {
            state.push(payload);
        },
    },
});

export const {log: newLog} = logsSlice.actions;
export const logsReducer = logsSlice.reducer;
