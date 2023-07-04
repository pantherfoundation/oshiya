import {createSlice} from '@reduxjs/toolkit';

export type StatsState = {
    countMetrics: Record<string, number>;
    listMetrics: Record<string, Array<number>>;
};

const initialState: StatsState = {countMetrics: {}, listMetrics: {}};

const statsSlice = createSlice({
    name: 'stats',
    initialState,
    reducers: {
        updateStats: (state, {payload}) => {
            state.countMetrics = payload.countMetrics;
            state.listMetrics = payload.listMetrics;
        },
    },
});

export const {updateStats} = statsSlice.actions;
export const statsReducer = statsSlice.reducer;
