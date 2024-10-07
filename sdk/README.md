# Panther Miner

The Panther Miner repository contains the code for a miner specifically
developed to interact with a blockchain network. Its main functionality revolves
around fetching pending queues from the BusTree Smart Contract, processing the
data, generating Zero-Knowledge proofs, and submitting these proofs back to the
BusTree Smart Contract for mining Unspent Transaction Outputs (UTXOs) batches.

## Functionality

The Panther Miner script provides the following functionality:

1. **Batch and Queue Processing**: The Miner fetches utxos from a subgraph
   service, inserts them into a Merkle tree, and keeps track of all inserted
   utxos in a form of MinerTree (special type of the tree that stores
   information required for mining). It also fetches the highest reward queue
   from the BusTree smart contract, retrieves the corresponding UTXOs, and
   prepares the ZK proof for that queue.

2. **ZK Proof Generation and Submission**: The Miner generates ZK proof using
   the proof inputs prepared in the Queue Processing phase and submits the ZK
   proof to the BusTree Smart Contract. If the operation is successful, it
   updates the local copy of the MinerTree.

3. **Repetitive Work**: The script periodically performs functions described
   above. This periodic execution is managed using an interval mechanism.

## Installation

Follow these steps to install and configure the Panther Miner:

1. Clone the repository:

```bash
   git clone git@gitlab.com:pantherprotocol/tech-team/miner-client.git
```

2. Install the dependencies and generate the typescript types:

```bash
yarn install && ./gen-types.sh 1
```

3. Copy the .env.example file and rename it to .env:

```bash
cp .env.example .env
```

4. Update the values in the .env file with your specific configuration.

Usage
To start using the Panther Miner script, run the following command:

```
yarn start
```

## Docker Installation

To run the Panther Miner in a Docker container, perform the following steps:

1. Build the Docker image:

```bash
docker build -t miner-app .
```

2. Then run the image:

```bash
docker run miner-app start
```

Or use docker-compose:

```bash
docker-compose up --build
```

## Claiming rewards

There are two methods to claim rewards, each suited for different scenarios:

**Method 1: Claiming Without Signature (For Miner Private Key Holders)**

This method is used when you have direct access to the miner's private key:

```bash
yarn claimReward \
  -r <receiverAddress> \
  -a <PantherTreesContractAddress> \
  --pk <privateKey> \
  --rpc <rpcEndpoint>
```

**Method 2: Claiming With Signature (For Delegated Claims)**

This method enables a two-step process where:

1. The miner private key holder generates a signature
2. Anyone can then claim the rewards using this signature (no private key needed)
3. **Generate Signature File** (Done by miner private key holder)

```bash
yarn generate:signature \
  -o <outputDirectoryToStoreSignature> \
  --rpc <rpcEndpoint> \
  --pk <privateKey> \
  -a <PantherTreesContractAddress> \
  -r <receiverAddress>
```
This will create a JSON file containing: {"signature": "<yourSignature>"}

4. **Claim Using Generated Signature** (Can be done by anyone)

```bash
yarn claimRewardWithSignature \
  -s <pathToSignatureContainingJsonFile> \
  --rpc <rpcEndpoint> \
  --pk <anyPrivateKey> \
  -a <PantherTreesContractAddress> \
  -r <receiverAddress>
```
Note: This step doesn't require the miner's private key

## Using Docker for Claims

If you're using Docker (ensure you've built the image with docker build -t miner-app .), you have the following options:

1. **Claim Without Signature**

```bash
docker run miner-app claimReward \
  -r <receiverAddress> \
  -a <PantherTreesContractAddress> \
  --pk <privateKey> \
  --rpc <rpcEndpoint>
```

2. **Claim With Signature**

a. Generate signature file:

```bash
docker run -v $(pwd)/sdk:/app miner-app generate:signature \
  -o /app \
  --pk <privateKey> \
  --rpc <rpcEndpoint> \
  -a <PantherTreesContractAddress> \
  -r <receiverAddress>
```

b. Claim using generated signature (ensure signature.json is in sdk folder):

```bash
docker run -v $(pwd)/sdk:/app miner-app claimRewardWithSignature \
  -s signature.json \
  --rpc <rpcEndpoint> \
  --pk <anyPrivateKey> \
  -r <receiverAddress> \
  -a <PantherTreesContractAddress>
```
Note: This step doesn't require the miner's private key

**Parameter Description**

- `<receiverAddress>`: The address that will receive the claimed rewards
- `<PantherTreesContractAddress>`: The address of the Panther Trees contract
- `<privateKey>`: The miner's private key (only needed for Method 1 and signature generation)
- `<anyPrivateKey>`: The private key of any account with Matic
- `<rpcEndpoint>`: URL of the RPC node
- `<outputDirectoryToStoreSignature>`: Directory where the signature file will be saved
- `<pathToSignatureContainingJsonFile>`: Path to the generated signature JSON file

## Configuration

The Panther Miner script needs certain configurations to be set in the `.env` file:

1. `RPC_URL`: This is the URL of the RPC node.
2. `SUBGRAPH_ID`: This is the ID of the subgraph.
3. `CONTRACT_ADDRESS`: This is the address of the BusTree Smart Contract.
4. `GENESIS_BLOCK_NUMBER`: This represents the block number when the BusTree Smart Contract was deployed.
5. `INTERVAL`: This is the duration between each repetitive execution in seconds.
6. `PRIVATE_KEY`: This is the private key of the wallet that will submit the proofs as a Miner.
7. `FORCE_UTXO_SIMULATION`: controls whether the miner should consistently add a simulated UTXO, irrespective of the presence of any pending queues. If this parameter is set to 'false', a simulated UTXO will only be added when a pending queue exists.

## Contributing

Contributions are welcome! If you find any issues or have suggestions for
improvements, please open an issue or submit a pull request.

## License

This project is licensed under the BUSL License. See the [LICENSE](../LICENSE) file for details.
