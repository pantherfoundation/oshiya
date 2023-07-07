//@ts-ignore
import {babyjub, poseidon} from 'circomlibjs';
import assert from 'assert';
import {Signer} from 'ethers';
import {hexlify} from 'ethers/lib/utils.js';

// ALT_BN128 (also known as BN254) order and BabyJubJub field prime
export const SNARK_FIELD_SIZE = BigInt(
    '21888242871839275222246405745257275088548364400416034343698204186575808495617',
);

const moduloSnarkFieldPrime = (v: bigint): bigint => {
    return v % SNARK_FIELD_SIZE;
};

const moduloBabyJubSubFieldPrime = (value: bigint) => {
    return value % babyjub.subOrder;
};

const extractSecretsPair = (signature: string): [r: bigint, s: bigint] => {
    if (!signature) {
        throw new Error('Signature must be provided');
    }
    assert(
        signature.length === 132,
        `Tried to create keypair from signature of length '${signature.length}'`,
    );
    assert(
        signature.slice(0, 2) === '0x',
        `Tried to create keypair from signature without 0x prefix`,
    );
    const r = signature.slice(2, 66);
    const s = signature.slice(66, 130);
    return [
        moduloSnarkFieldPrime(BigInt('0x' + r)),
        moduloSnarkFieldPrime(BigInt('0x' + s)),
    ];
};

const derivePrivKeyFromSignature = (signature: string): bigint => {
    const pair = extractSecretsPair(signature);
    if (!pair) {
        throw new Error('Failed to extract secrets pair from signature');
    }
    const privKey = poseidon(pair);
    return privKey;
};

export async function generatePrivKey(signer: Signer) {
    try {
        const derivationMessage = [
            'Greetings from Panther Protocol!',
            'Sign this message in order to obtain the keys to your Panther Miner Client Wallet.',
            'This signature will not cost you any fees.',
            'Keypair version: 1',
        ].join('\n\n');
        const signature = await signer.signMessage(derivationMessage);
        const pk = await derivePrivKeyFromSignature(signature);
        return hexlify(pk);
    } catch (error: any) {
        return new Error('Failed to generate private key');
    }
}
