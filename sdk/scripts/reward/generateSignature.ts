import {ethers} from 'ethers';
import fs from 'fs/promises';
import path from 'path';
import yargs from 'yargs';
import {GenerateSignatureArgs} from './utils';

const argv = yargs(process.argv.slice(2))
    .option('outputDir', {
        alias: 'o',
        description: 'Directory to save the signature JSON',
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
    .help()
    .alias('help', 'h').argv as GenerateSignatureArgs;

async function main() {
    const provider = new ethers.providers.JsonRpcProvider(argv.rpc);
    const wallet = new ethers.Wallet(argv.privateKey, provider);

    const message = 'Sign this message to generate a signature';

    const signature = await wallet.signMessage(message);

    const resolvedOutputDir = path.resolve(argv.outputDir);
    const filePath = path.join(resolvedOutputDir, 'signature.json');

    try {
        await fs.mkdir(resolvedOutputDir, {recursive: true});
        await fs.writeFile(filePath, JSON.stringify({signature}, null, 2));
        console.log(`Signature saved at ${filePath}`);
    } catch (error) {
        console.error('Error writing the signature file:', error);
    }
}

main();
