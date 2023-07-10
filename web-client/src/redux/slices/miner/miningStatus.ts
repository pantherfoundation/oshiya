import {createSlice} from '@reduxjs/toolkit';
import {MiningStatus} from 'types/miner';

const miningStatusSlice = createSlice({
    name: 'miner/mining-status',
    initialState: MiningStatus.Stoped,
    reducers: {
        updateMiningStatus: (state, {payload}) => {
            state = payload;
            return payload;
        },
    },
});

export const {updateMiningStatus} = miningStatusSlice.actions;
export const miningStatusRedcuer = miningStatusSlice.reducer;
