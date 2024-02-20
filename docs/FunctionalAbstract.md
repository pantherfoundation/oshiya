---
proofedDate: na
comments: This doc will act to replace the existing Gdoc https://docs.google.com/document/d/1Mkweu5TlwaKR-eeu-xLJlo8h3xCUFCFbvCOFGLYoTzc/edit?usp=sharing
approvedBy:
---

# Oshiya Documentation

This documentation serves to provide insight into how an Oshiya node functions. The Oshiya codebase, and this supporting documentation, is publicly available to enable community-driven optimizations.

Oshiya nodes are run by Panther Ecosystem Operaters known as cMiners &mdash; so called because Oshiya mines transactions to the Panther contract that underpins Panther's cross-protocol app layer. cMiners support the protocol by providing a decentralized transaction processing mechanism. 


## Oshiya functional abstract

Panther's Oshiya processes queues containing up to 64 UTXO commitments within a single SNARK proof &mdash; enabling continual execution of transactions in Panther's Shielded Pools.

The Oshiya script instantiates a miner (`miner.ts`), which inserts queues of Unspent Transaction Outputs (UTXOs) by:

- calling the `PantherBusTree.sol` contract
- creating a proof of inclusion of the queue as a leaf into a Merkle Tree (MT) contained there
- validating this proof by calling a verifier contract and updating the root

See [CoreArchitecture](CoreArchitecture.md) for further details.

### Transactions and rewards

Each time a user executes a Multi-Asset Shielded Pool (MASP) transaction, this results in the creation of UTXO/s. UTXO/s are committed as leaves of a degenerate MT representing a queue, and are stored on-chain as a root, readable by Oshiya via the on-chain event `UtxoBusQueued`. This provides a way for Oshiya to monitor and process UTXOs. 

UTXOs contained in queues in batches of up to 64 UTXOs are processed by Oshiya and inserted into the MT by writing a new root.

A ZK prover is used to verify the legitimacy of the appended queue. The event `BusBatchOnboarded` indicates successfully appended queues, denoted by the `queueId` parameter. Once appended, the queue is removed from storage.

Oshiya Operators care able to continually append queues via calling  the `PantherBusTree` contract and re-executing this process.

A subgraph records these events, enabling Oshiya to ‘copy’ the MT contained in `PantherBusTree` into local storage. The current root of the tree is read from the contract, an thereafter via the Cold Start script, Oshiya gets an up-to-date copy of the MT’s current state. This allows it to append further UTXOs from the queue as the protocol continues to function.

Oshiya Operators are rewarded with $ZKP (Panther’s native token) for successfully appending UTXO queues to the MT, and rewards (per queue) are recorded in the `BusQueueRec` struct. 

Structs provide a reference point for Oshiya operators to see the reward associated with a pending queue. The Oshiya software is designed to pick **one out of five** most 'valuable' pending queues. The function `getOldestPendingQueues()` is called to return these structs. 

Statistics are currently recorded locally with the execution of each BatchProcess.
