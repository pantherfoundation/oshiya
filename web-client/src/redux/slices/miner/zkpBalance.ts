import {createSlice, createAsyncThunk} from '@reduxjs/toolkit';
import {BigNumber, Contract, Wallet, getDefaultProvider} from 'ethers';
import {MinerClientParams} from 'types/worker';

const initialState: {
    value: string;
    status: 'idle' | 'loading' | 'error';
} = {
    value: '0',
    status: 'idle',
};

export const getZkpBalance = createAsyncThunk(
    'miner/zkp/balance',
    async ({rpcUrl, privateKey}: MinerClientParams) => {
        if (!privateKey || !rpcUrl) return '0';

        const provider = getDefaultProvider(rpcUrl);
        const wallet = new Wallet(privateKey, provider);

        const contract = new Contract(
            '0x3f73371cfa58f338c479928ac7b4327478cb859f', // zkp token address on mumbai
            [
                {
                    constant: true,
                    inputs: [
                        {
                            name: '_owner',
                            type: 'address',
                        },
                    ],
                    name: 'balanceOf',
                    outputs: [
                        {
                            name: 'balance',
                            type: 'uint256',
                        },
                    ],
                    payable: false,
                    stateMutability: 'view',
                    type: 'function',
                },
            ],
            provider,
        );

        const result: BigNumber = await contract.balanceOf(wallet.address);
        return result.toString();
    },
);

const zkpBalanceSlice = createSlice({
    name: 'miner/zkp/balance',
    initialState,
    reducers: {},
    extraReducers(builder) {
        builder
            .addCase(getZkpBalance.pending, state => {
                state.status = 'loading';
            })
            .addCase(getZkpBalance.fulfilled, (state, action) => {
                state.value = action.payload;
                state.status = 'idle';
            })
            .addCase(getZkpBalance.rejected, state => {
                state.status = 'error';
            });
    },
});

export const zkpBalanceReducer = zkpBalanceSlice.reducer;
