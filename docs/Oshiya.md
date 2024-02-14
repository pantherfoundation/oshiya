# Oshiya Documentation

[provide documentation introduction here]

## Oshiya functional abstract

Panther's Oshiya processes queues containing up to 64 UTXO commitments via a Zero-Knowledge (ZK) prover, enabling continual execution of transactions in Panther's Shielded Pools.

Overall, the script instantiates a miner (`miner.ts`), which appends queues of UTXOs by calling the `PantherBusTree.sol` contract and validating a proof of inclusion of the queue as a leaf into a Merkle Tree (MT) contained there.

Each time a user executes an operation resulting in the creation of UTXOs, UTXO/s are committed as leaves of a degenerate MT representing a queue, and are stored on-chain as a root, readable by Operators of Oshiya via the on-chain event `UtxoBusQueued`.

This provides a way for Oshiya to monitor and process UTXOs. UTXOs contained in queues in batches of up to 64 UTXOs are thereafter processed, via appending to the MT and writing of a new root of the MT within `BusTree.sol`. 

A ZK prover is used to verify the legitimacy of the appended queue. The event `BusBatchOnboarded` indicates successfully appended queues, denoted by the queueId parameter. Once appended, `setQueueAsProcessed()` is called, removing the queue from storage.

Oshiya Operators care able to continually append queues via calling `PantherBusTree.sol` and re-executing this process.

A subgraph records these events, enabling Oshiya to ‘copy’ the MT contained in `BusTree.sol` into local storage. The current root of the tree is read from the contract via the call `getRoot()`, and, thereafter, via the Cold Start mechanism (`coldstart.ts`) Oshiya gets an up-to-date copy of the MT’s current state. This allows it to append further UTXOs from the queue as the protocol continues to function.

Oshiya Operators are rewarded with $ZKP (Panther’s native token) for successfully appending UTXO queues to the MT, and rewards (per queue) are recorded in the `BusQueueRec` struct. 

Structs provide a reference point for Oshiya operators to see the reward associated with a pending queue. The Oshiya software is designed to pick **one out of five** most 'valuable' pending queues. The function `getOldestPendingQueues()` is called to return these structs. 

Statistics are currently recorded locally with the execution of each BatchProcess.
