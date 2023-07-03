# Panther Miner

The Panther Miner repository contains the code for a miner specifically developed to interact with a blockchain network. Its main functionality revolves around fetching pending queues from the BusTree Smart Contract, processing the data, generating Zero-Knowledge proofs, and submitting these proofs back to the BusTree Smart Contract for mining Unspent Transaction Outputs (UTXOs) batches.

## Functionality

The Panther Miner script provides the following functionality:

1. **Batch and Queue Processing**: The Miner fetches utxo batches from a
   subgraph service, inserts them into a Merkle tree, and keeps track of all
   inserted leaves. It also fetches the highest reward queue from the smart
   contract, retrieves the corresponding UTXOs, and prepares the ZK proof for
   that queue.

2. **ZK Proof Generation and Submission**: The Miner generates a ZK proof using
   the proof inputs prepared in the Queue Processing phase and submits the ZK
   proof to the BusTree Smart Contract. If the operation is successful, it
   updates the local tree.

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

## Configuration

The Panther Miner script requires the following configurations to be set in the
`.env` file:

-   RPC_URL: The URL of the RPC node.
-   SUBGRAPH_ID: The ID of the subgraph.
-   CONTRACT_ADDRESS: The address of the BusTree Smart Contract.
-   INTERVAL: The duration between each repetitive execution in seconds.
-   PRIVATE_KEY: private key of the wallet that will submit the proofs as a Miner.

## Contributing

Contributions are welcome! If you find any issues or have suggestions for improvements, please open an issue or submit a pull request.

## License

This project is licensed under the MIT License.
