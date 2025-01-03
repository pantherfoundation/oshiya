import {ethers} from 'ethers';

const EIP712_NAME = 'Panther Protocol';
const EIP712_VERSION = '1';
const EIP712_SALT =
    '0x44b818e3e3a12ecf805989195d8f38e75517386006719e2dbb1443987a34db7b';

export type ClaimRewardArgs = {
    rpc: string;
    receiver: string;
    address: string;
    privateKey: string;
};

export type ClaimRewardWithSignatureArgs = ClaimRewardArgs & {
    signaturePath: string;
};

export type GenerateSignatureArgs = ClaimRewardArgs & {
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

export async function generateSignature(
    wallet: ethers.Wallet,
    contractAddress: string,
    receiver: string,
): Promise<string> {
    const chainId = await wallet.getChainId();

    const domain = {
        name: EIP712_NAME,
        version: EIP712_VERSION,
        chainId: chainId,
        verifyingContract: contractAddress,
        salt: EIP712_SALT,
    };

    const types = {
        ClaimMiningReward: [
            {name: 'receiver', type: 'address'},
            {name: 'version', type: 'uint256'},
        ],
    };

    const value = {
        receiver: receiver,
        version: EIP712_VERSION,
    };

    return await wallet._signTypedData(domain, types, value);
}
