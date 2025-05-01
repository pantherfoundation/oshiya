import {ethers, BigNumber, utils} from 'ethers';
import yargs from 'yargs';
import {
    initializeContract,
    ClaimRewardArgs,
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
    const provider = contract.provider;
    const signerAddress = await contract.signer.getAddress(); // Get signer address for logging

    let tx: ethers.ContractTransaction | null = null; // Declare tx outside try block

    try {
        const feeData = await provider.getFeeData();
        const maxPriorityFeePerGas = BigNumber.from(30_000_000_000); // 30 gwei
        const baseFeePerGas = feeData.lastBaseFeePerGas;
        if (!baseFeePerGas) {
          throw new Error("Could not retrieve base fee, cannot proceed with fee estimation.");
        }
        const requiredMaxFeePerGas = baseFeePerGas.add(maxPriorityFeePerGas);
        const maxFeePerGas = (feeData.maxFeePerGas && feeData.maxFeePerGas.gte(requiredMaxFeePerGas))
            ? feeData.maxFeePerGas
            : requiredMaxFeePerGas;

        const txOverrides = {
            maxFeePerGas,
            maxPriorityFeePerGas,
        };

        console.log(
            `Attempting to claim reward for receiver: ${argv.receiver}`
        );
        console.log(`  Contract Address: ${contract.address}`);
        console.log(`  Signer Address: ${signerAddress}`);
        console.log(
            `  Using Gas Prices: maxFeePerGas=${utils.formatUnits(
                maxFeePerGas,
                'gwei',
            )} gwei, maxPriorityFeePerGas=${utils.formatUnits(
                maxPriorityFeePerGas,
                'gwei',
            )} gwei, baseFeePerGas=${utils.formatUnits(
                baseFeePerGas,
                'gwei',
            )} gwei`,
        );

        // Estimate gas first (optional, but can catch reverts earlier)
        try {
            const estimatedGas = await contract.estimateGas.claimMiningReward(
                argv.receiver,
                txOverrides
            );
            console.log(`  Estimated Gas Limit: ${estimatedGas.toString()}`);
            // You could add the estimated gas to txOverrides if desired:
            // txOverrides.gasLimit = estimatedGas;
        } catch (gasError: any) {
             console.error('Error estimating gas:', gasError.reason || gasError.message);
             // Rethrow or handle specific gas estimation errors if needed
             throw gasError;
        }


        tx = await contract.claimMiningReward(
            argv.receiver,
            txOverrides
        );

        // Check if tx is null before proceeding (satisfies TypeScript)
        if (!tx) {
            throw new Error("Transaction object was unexpectedly null after submission.");
        }

        console.log(`Transaction submitted with hash: ${tx.hash}`);
        console.log(`  Nonce: ${tx.nonce}`);
        console.log(`  Gas Price (legacy): ${tx.gasPrice ? utils.formatUnits(tx.gasPrice, 'gwei') + ' gwei' : 'N/A (EIP-1559)'}`);
        console.log(`  Max Fee Per Gas: ${tx.maxFeePerGas ? utils.formatUnits(tx.maxFeePerGas, 'gwei') + ' gwei' : 'N/A'}`);
        console.log(`  Max Priority Fee Per Gas: ${tx.maxPriorityFeePerGas ? utils.formatUnits(tx.maxPriorityFeePerGas, 'gwei') + ' gwei' : 'N/A'}`);


        const receipt = await tx.wait();
        console.log(`Transaction confirmed in block: ${receipt.blockNumber}`);
        console.log(`  Gas Used: ${receipt.gasUsed.toString()}`);
        console.log(`  Effective Gas Price: ${receipt.effectiveGasPrice ? utils.formatUnits(receipt.effectiveGasPrice, 'gwei') + ' gwei' : 'N/A'}`);

    } catch (error: any) {
        console.error('\n--- Error claiming mining reward ---');

        // Log basic error info
        if (error.code) {
            console.error(`Error Code: ${error.code}`);
        }
        if (error.reason) {
            console.error(`Reason: ${error.reason}`);
        }

        // Log transaction details if available (often included in ethers errors)
        const failedTx = error.transaction || tx; // Use error.transaction if available, else the tx object
        if (failedTx) {
            console.error('\nTransaction Details:');
            console.error(`  From: ${failedTx.from || signerAddress}`); // Use signerAddress if from is missing
            console.error(`  To: ${failedTx.to || contract.address}`); // Use contract address if to is missing
            console.error(`  Nonce: ${failedTx.nonce}`);
            console.error(`  Data: ${failedTx.data}`);
            if (failedTx.maxFeePerGas) console.error(`  Max Fee Per Gas: ${utils.formatUnits(failedTx.maxFeePerGas, 'gwei')} gwei`);
            if (failedTx.maxPriorityFeePerGas) console.error(`  Max Priority Fee Per Gas: ${utils.formatUnits(failedTx.maxPriorityFeePerGas, 'gwei')} gwei`);
            if (failedTx.gasLimit) console.error(`  Gas Limit: ${failedTx.gasLimit.toString()}`);
            if (failedTx.value) console.error(`  Value: ${utils.formatEther(failedTx.value)} ETH`);
        }

        // Log revert data if present (specific to contract reverts)
        if (error.error?.data && error.error.data !== '0x') {
            console.error(`\nRevert Data: ${error.error.data}`);
            // Attempt to decode revert reason string
            const decodedError = contract.interface.parseError(error.error.data);
             if (decodedError) {
                console.error(`Decoded Revert Reason: ${decodedError.name}(${decodedError.args.join(', ')})`);
                // You might want to log decodedError.args separately for clarity
                if (decodedError.name === 'Error') { // Standard string revert
                     console.error(`  Revert Message: ${decodedError.args[0]}`)
                }
            } else {
                 console.error("Could not decode revert reason from data.");
            }
        }

        // Log the full error object at the end for complete details if needed
        console.error('\nFull Error Object:');
        console.error(error);
    }
}

main();
