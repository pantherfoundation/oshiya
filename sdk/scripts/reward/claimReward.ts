import {ethers} from 'ethers';
import yargs from 'yargs';
import {
    initializeContract,
    ClaimRewardArgs,
    executeTransaction,
    validateInput,
    addExtraGasPercentage,
} from './utils';

const argv = yargs(process.argv)
    .option('receiver', {
        alias: 'r',
        description: 'Receiver address',
        type: 'string',
        demandOption: true,
    })
    .option('privateKey', {
        alias: 'pk',
        description: 'Private key of the user triggering the function',
        type: 'string',
        demandOption: true,
    })
    .option('rpc', {
        alias: 'rpc',
        description: 'RPC endpoint to connect to the blockchain',
        type: 'string',
        demandOption: true,
    })
    .option('address', {
        alias: 'a',
        description: 'Address of the ForestRoot contract',
        type: 'string',
        demandOption: true,
    })
    .help()
    .alias('help', 'h').argv as ClaimRewardArgs;

const functionFragment = 'function claimMiningReward(address receiver)';

async function main() {
    validateInput(argv);
    const contract = initializeContract(argv, functionFragment);

    try {
        const txData = await contract.populateTransaction.claimMiningReward(
            argv.receiver,
        );
        const gasLimit = addExtraGasPercentage((await contract.estimateGas.claimMiningReward(argv.receiver)).toBigInt());
        await executeTransaction(contract.signer as ethers.Wallet, txData, gasLimit);
    } catch (error) {
        console.error('Error claiming mining reward:', error);
    }
}

main();
