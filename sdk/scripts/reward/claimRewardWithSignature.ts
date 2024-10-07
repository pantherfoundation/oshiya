import {ethers} from 'ethers';
import fs from 'fs';
import yargs from 'yargs';
import {
    ClaimRewardWithSignatureArgs,
    initializeContract,
    executeTransaction,
    validateInput,
} from './utils';

const argv = yargs(process.argv)
    .option('receiver', {
        alias: 'r',
        description: 'Receiver address',
        type: 'string',
        demandOption: true,
    })
    .option('signaturePath', {
        alias: 's',
        description: 'Path to signature JSON file',
        type: 'string',
        demandOption: true,
    })
    .option('privateKey', {
        alias: 'pk',
        description: 'Private key of the account with Matic',
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
    .alias('help', 'h').argv as ClaimRewardWithSignatureArgs;

const functionFragment =
    'function claimMiningRewardWithSignature(address receiver, uint8 v, bytes32 r, bytes32 s)';

async function main() {
    validateInput(argv);
    const contract = initializeContract(argv, functionFragment);

    try {
        const {signature} = JSON.parse(
            fs.readFileSync(argv.signaturePath, 'utf-8'),
        );

        const {v, r, s} = ethers.utils.splitSignature(signature);

        const txData =
            await contract.populateTransaction.claimMiningRewardWithSignature(
                argv.receiver,
                v,
                r,
                s,
            );

        await executeTransaction(contract.signer as ethers.Wallet, txData);
    } catch (error) {
        console.error('Error claiming mining reward with signature:', error);
    }
}

main();
