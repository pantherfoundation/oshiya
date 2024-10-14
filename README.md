# Oshiya

This repository contains the code for the Oshiya component, previously known as
the "Panther Miner".

The Oshiya's task is, in exchange for rewards, to append commitments to Unspent
Transaction Outputs (UTXOs) to a Merkle Tree of UTXOs maintained on a blockchain
by a specialized Smart Contract called the "BusTree".

Oshiya appends UTXOs in batches, of up to 64 UTXOs at once, providing a SNARK-proof
that justifies validity of the batch and correctness of the batch insertion.

This efficient process of building the Merkle Tree enhances the performance of
the Panther Protocol.

## Repository Structure

This repository is structured into code and [docs](docs/1_Introduction.md). The code is divided into two main workspaces:

- SDK Workspace: This workspace houses the miner's core code. For running the miner without a UI, you can use a terminal and Docker. Detailed instructions are available in the [SDK Readme](sdk/README.md) file.

- Web-client Workspace: This workspace contains the code for running the miner in a browser. It includes a basic React-based UI and a web worker running in the background, which becomes operational once the user inputs the necessary configuration data. For deploying your version of the UI, refer to the instructions provided in the [web-client Readme](web-client/README.md) file.


## Configuration

Both versions of Oshiya require certain configuration settings, which can be defined in a `.env` file or through the web interface. Here are the necessary configuration parameters:

-   `RPC_URL`: The URL of the RPC node.
-   `SUBGRAPH_ID`: The ID of the subgraph.
-   `CONTRACT_ADDRESS`: The address of the BusTree Smart Contract.
-   `GENESIS_BLOCK_NUMBER`: block number when the BusTree Smart Contract was deployed.
-   `INTERVAL`: The time (in seconds) between each successive execution.
-   `PRIVATE_KEY`: The private key of the wallet that will submit the proofs as a Miner.
-   `MIN_REWARD`: The minimum reward for a queue to be considered for mining.

## Contributing

We appreciate your contributions! If you discover any issues or have suggestions for improvements, feel free to open an issue or submit a pull request. Let's build a stronger Panther ecosystem together!

A [community enhancement incentive program](docs/6_CommunityEnhancement.md) is being developed, if this receives approval by the DAO, then submission of the proposed improvements will be rewarded according to the assessment criteria.

## Learn More

To learn more about Panther Protocol, visit this repo's [documentation](/docs/Introduction.md), or learn more about the Panther Ecosystem from the [public-facing documentation](https://docs.pantherprotocol.io/docs).

## License

Panther Miner is licensed under the MIT License. For more details, please see the [LICENSE](/LICENSE) file.
