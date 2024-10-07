import {ethers} from 'ethers';

type BaseCLIArgs = {
    privateKey: string;
    rpc: string;
};

export type ClaimRewardArgs = BaseCLIArgs & {
    receiver: string;
    address: string;
};

export type ClaimRewardWithSignatureArgs = ClaimRewardArgs & {
    signaturePath: string;
};

export type GenerateSignatureArgs = BaseCLIArgs & {
    outputDir: string;
};

export const initializeContract = (
    argv: ClaimRewardArgs,
    functionFragment: string,
) => {
    const provider = new ethers.providers.JsonRpcProvider(argv.rpc);
    const wallet = new ethers.Wallet(argv.privateKey, provider);

    const iface = new ethers.utils.Interface([functionFragment]);
    return new ethers.Contract(argv.address, iface, wallet);
};

export async function executeTransaction(
    wallet: ethers.Wallet,
    txData: ethers.PopulatedTransaction,
): Promise<void> {
    const txResponse = await wallet.sendTransaction(txData);
    console.log('Transaction Hash:', txResponse.hash);
    await txResponse.wait();
    console.log('Transaction confirmed.');
}

class InvalidInputError extends Error {
    constructor(message: string) {
        super(message);
        this.name = 'InvalidInputError';
    }
}

export function validateInput(args: ClaimRewardArgs): void {
    if (!ethers.utils.isAddress(args.address)) {
        throw new InvalidInputError('Invalid contract address');
    }
    if (!ethers.utils.isAddress(args.receiver)) {
        throw new InvalidInputError('Invalid receiver address');
    }
    if (!isValidUrl(args.rpc)) {
        throw new InvalidInputError('Invalid RPC URL');
    }
}

function isValidUrl(url: string): boolean {
    try {
        new URL(url);
        return true;
    } catch (err) {
        return false;
    }
}
