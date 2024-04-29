# Core Architecture

The architecture of Oshiya utilizes a 3-stage process to add UTXOs created via the dApp to the Merkle Tree (MT) contained in PantherBusTree Smart Contract (SC). The appending of UTXOs to form a queue, and this queue's insertion into the SC as a standalone procedure is named ‘mining’ in the software.

This process provides a low-cost and verifiable methodology to ultimately record transaction history whilst preserving privacy. This process takes the following form:

1. UTXOs are sent to `PantherBusTree`. There, they are recorded in storage as the root of a degenerate MT. Each leaf of this tree serves as the commitment of the UTXO. This provides a point of storage on-chain for evaluation by Oshiya when searching for queues later in the mining process.

> N.B. The actual mining process uses event `UtxoBusQueued` to match `queueId` with the data available in the contract during reward evaluation.

2. Oshiya then looks for events `UtxoBusQueued` to identify queued UTXOs. It calls `getOldestPendingQueues` function in the PantherBusTree to read `BusBatchRec` structs, simultaneously revealing which batches yield high reward.

3. Now that Oshiya has up to 64 UTXOs it needs to process, it does the following:

3.1 The fully formed queue, containing <= 64 legitimate UTXOs (any remaining space in the tree is taken up with dummy UTXOs), is appended to the fully balanced binary MT, of depth 26, located in local storage.

3.2 A proof of inclusion is then generated. 

3.3 The proof of inclusion is forwarded to the verifier contract.

3.4 If the proof of inclusion is verified as correct, the root of the MT held on PantherBusTree is updated.

As the process continues, Oshiya reads `BusBatchOnboarded` events to attain the new root of each branch being added to the tree to build a complete tree in memory, providing for continuous appending of UTXOs.

This yields the following benefits:

-   A single proof for 64 UTXOs
-   A constant source of truth, in the form of SC storage, for all UTXOs
-   A verifiable method for Oshiyas to mine UTXOs on a reward-based premise

## What next?

- Refresh the [keywords](2_Keywords.md)
- See the [Process Flow](5_ProcessFlow.md)
