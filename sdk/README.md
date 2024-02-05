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
docker run miner-app
```

Or use docker-compose:

```bash
docker-compose up --build
```



Configuration

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
