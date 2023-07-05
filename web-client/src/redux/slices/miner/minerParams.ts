import {createSlice} from '@reduxjs/toolkit';
import {MinerClientParams} from 'types/worker';

const initialState: MinerClientParams = {
    interval: 10,
    privateKey: '',
    rpcUrl: '',
    subgraphId: '',
    contractAddr: '',
};

const minerParamsSlice = createSlice({
    name: 'miner/params',
    initialState,
    reducers: {
        updateMinerParams: (state, {payload}) => {
            state.contractAddr = payload.contractAddr;
            state.interval = payload.interval;
            state.rpcUrl = payload.rpcUrl;
            state.subgraphId = payload.subgraphId;
            state.privateKey = payload.privateKey;
        },
    },
});

export const {updateMinerParams} = minerParamsSlice.actions;
export const minerParamsReducer = minerParamsSlice.reducer;
