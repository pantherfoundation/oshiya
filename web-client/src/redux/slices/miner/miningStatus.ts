import {createSlice} from '@reduxjs/toolkit';

const initialState: boolean = false;

const miningStatusSlice = createSlice({
    name: 'miner/mining-status',
    initialState,
    reducers: {
        updateMiningStatus: (state, {payload}) => {
            state = payload;
            return payload;
        },
    },
});

export const {updateMiningStatus} = miningStatusSlice.actions;
export const miningStatusRedcuer = miningStatusSlice.reducer;
