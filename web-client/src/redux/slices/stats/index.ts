import {createSlice} from '@reduxjs/toolkit';
import {Stats} from '@panther-miner/sdk/src/mining-stats';

const initialState: Stats = {
    generatedProof: 0,
    submittedProof: 0,
    miningSuccess: 0,
    miningError: 0,
};

const statsSlice = createSlice({
    name: 'stats',
    initialState,
    reducers: {
        updateStats: (_state, {payload}) => {
            return payload;
        },
    },
});

export const {updateStats} = statsSlice.actions;
export const statsReducer = statsSlice.reducer;
