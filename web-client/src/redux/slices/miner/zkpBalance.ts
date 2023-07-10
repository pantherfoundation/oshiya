import {createSlice, createAsyncThunk} from '@reduxjs/toolkit';
import {BigNumber, Contract, Wallet, getDefaultProvider} from 'ethers';
import {env} from 'services/env';
import {MinerClientParams} from 'types/worker';

const initialState: {
    zkp: string;
    matic: string;
    status: 'idle' | 'loading' | 'error';
} = {
    zkp: '0',
    matic: '0',
    status: 'idle',
};

export const getMinerBalance = createAsyncThunk(
    'miner/zkp/balance',
    async ({rpcUrl, privateKey}: MinerClientParams) => {
        if (!privateKey || !rpcUrl) return '0';

        const provider = getDefaultProvider(rpcUrl);
        const wallet = new Wallet(privateKey, provider);

        const matic = await wallet.getBalance();

        const contract = new Contract(
            env.ZKP_TOKEN_ADDRESS,
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

        const zkp: BigNumber = await contract.balanceOf(wallet.address);
        return [zkp.toString(), matic.toString()];
    },
);

const minerBalanceSlice = createSlice({
    name: 'miner/balance',
    initialState,
    reducers: {},
    extraReducers(builder) {
        builder
            .addCase(getMinerBalance.pending, state => {
                state.status = 'loading';
            })
            .addCase(getMinerBalance.fulfilled, (state, action) => {
                const [zkp, matic] = action.payload;
                state.zkp = zkp;
                state.matic = matic;
                state.status = 'idle';
            })
            .addCase(getMinerBalance.rejected, state => {
                state.status = 'error';
            });
    },
});

export const mienrBalanceReducer = minerBalanceSlice.reducer;
