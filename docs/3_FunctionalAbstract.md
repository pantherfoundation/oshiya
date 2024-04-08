## Oshiya functional abstract

Panther's Oshiya processes queues containing up to 64 UTXO commitments with a SNARK proof, enabling continual execution of transactions in Panther's Shielded Pools.

Overall, the script instantiates a miner (`miner.ts`), which inserts queues of UTXOs by calling the `PantherBusTree.sol` contract, creating a proof of inclusion of the queue as a leaf into a Merkle Tree (MT) contained there, validating this proof via calling a verifier contract and updating the root. The details of this core architecture can be found in the `CoreArchitecture.md` section of this documentation.

Each time a user executes a MASP transaction resulting in the creation of UTXOs, UTXO/s are committed as leaves of a degenerate MT representing a queue, and are stored on-chain as a root, readable by Oshiya via the on-chain event `UtxoBusQueued`.

This provides a way for Oshiya to monitor and process UTXOs. UTXOs contained in queues in batches of up to 64 UTXOs are thereafter processed and inserted into the MT via the writing of a new root.

A SNARK prover is used to verify the legitimacy of the appended queue. The event `BusBatchOnboarded` indicates successfully appended queues, denoted by the `queueId` parameter. Once appended the queue is removed from storage.

Oshiya Operators care able to continually append queues via calling _PantherBusTree_ and re-executing this process.

A subgraph records these events, enabling Oshiya to ‘copy’ the MT contained in _PantherBusTree_ SC. The current root of the tree is read from the contract, an thereafter via the Cold Start script, Oshiya gets an up-to-date copy of the MT’s current state. This allows it to append further UTXOs from the queue as the protocol continues to function.

Oshiya Operators are rewarded with $ZKP (Panther’s native token) for successfully appending UTXO queues to the MT, and rewards (per queue) are recorded in the `BusQueueRec` struct.

Structs provide a reference point for Oshiya operators to see the reward associated with a pending queue. The Oshiya software is designed to pick **one out of five** most 'valuable' pending queues. The function `getOldestPendingQueues()` is called to return these structs.

Statistics are currently recorded locally with the execution of each BatchProcess.
