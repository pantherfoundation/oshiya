# Panther Miner

The Panther Miner repository houses code specifically developed for the Panther
Miner, a critical component in the Panther Protocol ecosystem. Its primary
function is to retrieve pending queues from the BusTree Smart Contract, process
the data, generate Zero-Knowledge proofs, and submit these proofs back to the
BusTree Smart Contract. This enables the mining of Unspent Transaction Outputs
(UTXOs) batches.

## Repository Structure

This repository is structured into two main workspaces: SDK and web-client.

1. **SDK Workspace**: This workspace houses the miner's core code. For running
   the miner without a UI, you can use a terminal and Docker. Detailed
   instructions are available in the [SDK Readme](./sdk/README.md) file.

2. **Web-client Workspace**: This workspace contains the code for running the
   miner in a browser. It includes a basic React-based UI and a web worker
   running in the background, which becomes operational once the user inputs the
   necessary configuration data. For deploying your version of the UI, refer to
   the instructions provided in the [web-client Readme](./sdk/README.md) file.

## Configuration

Both versions of Panther Miner require certain configuration settings, which can
be defined in a `.env` file or through the web interface. Here are the necessary
configuration parameters:

- `RPC_URL`: The URL of the RPC node.
- `SUBGRAPH_ID`: The ID of the subgraph.
- `CONTRACT_ADDRESS`: The address of the BusTree Smart Contract.
- `INTERVAL`: The time (in seconds) between each successive execution.
- `PRIVATE_KEY`: The private key of the wallet that will submit the proofs as a Miner.

## Contributing

We appreciate your contributions! If you discover any issues or have suggestions
for improvements, feel free to open an issue or submit a pull request. Let's
build a stronger Panther ecosystem together!

## License

Panther Miner is licensed under the BUSL License. For more details, please see
the [LICENSE](/LICENSE) file.
