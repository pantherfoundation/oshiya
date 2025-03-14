# Miner Web Client

A web client for the miner application that interacts with blockchain contracts.

## Prerequisites

- Node.js (use the version specified in `.nvmrc`)
- Yarn package manager
- Basic knowledge of blockchain concepts and IPFS

## Setup

1. **Create Environment Configuration**

   Create a `.env` file in the `web-client/` directory. All environment variables are optional.
   See `.env.example` for reference:

   - `CONTRACT_ADDRESS`: Bus tree contract address
   - `INTERVAL`: Mining interval
   - `RPC_URL`: Chain RPC URL
   - `SUBGRAPH_ID`: The subgraph ID

2. **Install Dependencies**

   ```bash
   nvm use && yarn
   ```

## Build Process

1. **Build Miner SDK and Generate Types**

   ```bash
   cd sdk/ && ./gen-types.sh && yarn build
   ```

2. **Build the Web Client**

   ```bash
   cd web-client/ && yarn build:prod
   ```

3. **Bundle the WASM/ZKeys Files**

   ```bash
   yarn bundle:wasm
   ```

## Deployment to IPFS

You can deploy the build folder to IPFS using any of the following methods:

### Option 1: Using IPFS CLI

1. Install IPFS CLI if not already installed:
   ```bash
   # Installation instructions: https://docs.ipfs.tech/install/command-line/
   ipfs --version
   ```

2. Initialize IPFS (if first time):
   ```bash
   ipfs init
   ```

3. Start the IPFS daemon:
   ```bash
   ipfs daemon
   ```

4. Add your build folder to IPFS:
   ```bash
   ipfs add -r web-client/build
   ```

5. Use the CID from the last line of the output to access your deployment:
   ```
   https://ipfs.io/ipfs/<YOUR_CID>
   ```

### Option 2: Using Pinata or Similar IPFS Pinning Service

1. Create an account on [Pinata](https://www.pinata.cloud/) or another IPFS pinning service
2. Upload your build folder through their web interface
3. Access your deployment via the provided CID:
   ```
   https://ipfs.io/ipfs/<YOUR_CID>
   ```

### Option 3: Using web3.storage

1. Sign up at [web3.storage](https://web3.storage/)
2. Install their CLI tool:
   ```bash
   yarn global add @web3-storage/w3cli
   ```3. Configure and authenticate:
   ```bash
   w3 login
   ```
4. Upload your build folder:
   ```bash
   w3 put web-client/build
   ```
5. Access your deployment via the provided CID:
   ```
   https://ipfs.io/ipfs/<YOUR_CID>
   ```

## Making Your IPFS Deployment Persistent

For production deployments, consider:
- Pinning your content with services like Pinata, Infura, or web3.storage
- Running your own IPFS node and pinning the content
- Using a service like Fleek for automatic deployment from git to IPFS

## License

This project is licensed under the MIT License - see the [LICENSE](../LICENSE) file in the root directory of this project for details.

Copyright 2024 Panther Protocol Foundation



