# IPFS Deployment Script

The script is designed to deploy the content of the `build/` directory to IPFS. It can deploy whatever build (prod, dev, test, staging) to whatever IPFS node (local, custom, Infura).

The script can be used in couple of different ways.

1. [Deploy to local IPFS node with default settings](#deploy-to-local-ipfs-node-with-default-settings)
2. [Deploy to custom IPFS node](#deploy-to-custom-ipfs-node)
3. [Deploy to Infura node](#deploy-to-infura-ipfs-node)

## Deploy To local IPFS node with default settings

By default, the local IPFS node is running on port **5001** with **HTTP**. The script can deploy to IPFS node with the default settings below

```json
{
    "host": "127.0.0.1",
    "port": 5001,
    "protocol": "http"
}
```

To deploy to local node, you need to pass the `--local-default` flag.

```bash
$ yarn ts-node scripts/deploy-ipfs.ts --local-default
```

## Deploy to custom IPFS node

If you changed the local IPFS settings or want to deploy to a remote IPFS node. Both cases are the same and you need to provide the node info as environmental variables. `IPFS_HOST`, `IPFS_PORT`, and `IPFS_PROTOCOL`. Note that the protocol can only be `http` or `https`.

| Variable        | Description                                                           |
| --------------- | --------------------------------------------------------------------- |
| `IPFS_HOST`     | The IP address for the IPFS node (e.g. `ipfs.infura.io`, `127.0.0.1`) |
| `IPFS_PORT`     | The port of the IPFS node (e.g. 5001)                                 |
| `IPFS_PROTOCOL` | The protocol that IPFS node running at. Can be `http` or `https`      |

To deploy to local node, you need to pass the `--custom` flag.

```bash
$ yarn ts-node scripts/deploy-ipfs.ts --custom
```

## Deploy to Infura IPFS node

If you have an Infura node and want to deploy to it you need to provide both the Project ID and Project Secret.

To get an infura node go to [infura.io/ipfs](https://www.infura.io/product/ipfs).

| Variable                   | Description                                                 |
| -------------------------- | ----------------------------------------------------------- |
| `INFURA_PROJECT_ID`        | Project Id provided by Infura.                              |
| `INFURA_PROJECT_SECRET_ID` | Project Secret provided by Infura. **Should never shared**. |

To deploy to local node, you need to pass the `--custom` flag.

```bash
$ yarn ts-node scripts/deploy-ipfs.ts --custom
```
