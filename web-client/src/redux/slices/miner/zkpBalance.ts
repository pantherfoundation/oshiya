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
    async ({rpcUrl, privateKey, zkpTokenAddr}: MinerClientParams) => {
        console.log({rpcUrl, privateKey, zkpTokenAddr});
        if (!privateKey || !rpcUrl || !zkpTokenAddr) return '0';

        const provider = getDefaultProvider(rpcUrl);
        const wallet = new Wallet(privateKey, provider);

        const contract = new Contract(
            zkpTokenAddr,
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
