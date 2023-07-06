# Miner Web Client

## Deployment

1. Create `.env` file in `web-client/` and environment variables. All enviorment
   variables are optional. Take a look at `.env.example` for for reference.

    - `CONTRACT_ADDRESS`: Bus tree contract address
    - `INTERVAL`: Mining work interval.
    - `RPC_URL`: Chain RPC RUL
    - `SUBGRAPH_ID`: The subgraph ID

2. Install dependencies

    ```bash
    nvm use && yarn
    ```

3. Build miner SDK

    ```bash
    cd sdk/ && yarn build
    ```

4. Build the web client

    ```bash
    cd web-client/ && yarn build:prod
    ```

5. Bundle the wasm/zkeys files

    ```bash
    cd web-client/ && yarn bundle:wasm
    ```

6. Read [ipfs deployment guide](./scripts/deploy-ipfs.md) to know how to deploy
   the output build to ipfs.

    Best option is to deploy using [infura](https://www.infura.io/product/ipfs).

    Add `INFURA_PROJECT_ID` and `INFURA_PROJECT_SECRET_ID` to `web-client/.env`
    Then run the script `yarn deploy:ipfs:infura`
