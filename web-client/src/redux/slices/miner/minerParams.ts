import {createSlice} from '@reduxjs/toolkit';
import {MinerClientParams} from 'types/worker';

const initialState: MinerClientParams = {
    interval: 10,
    privateKey: '',
    rpcUrl: '',
};

const minerParamsSlice = createSlice({
    name: 'miner/params',
    initialState,
    reducers: {
        updateMinerParams: (_state, {payload}) => {
            return payload;
        },
    },
});

export const {updateMinerParams} = minerParamsSlice.actions;
export const minerParamsReducer = minerParamsSlice.reducer;
