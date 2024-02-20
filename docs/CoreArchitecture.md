---
proofedDate: na
comments: This doc will act to replace the existing Gdoc https://docs.google.com/document/d/1Mkweu5TlwaKR-eeu-xLJlo8h3xCUFCFbvCOFGLYoTzc/edit?usp=sharing
approvedBy:
---

# Core Architecture

The architecture of Oshiya utilizes a 3-stage process to add UTXOs created via the dApp to the Merkle tree contained in the `PantherBusTree` contract. The appending of UTXOs to form a queue, and this queue's insertion of into the smart contract as a standalone procedure is named *cMining* in this context.

This process is in place to provide a low-cost and verifiable methodology to ultimately record transaction history whilst preserving privacy. This process takes the following form:

1. UTXOs are sent to `PantherBusTree`. There, they are recorded in storage as the root of a degenerate Merkle tree. Each leaf of this tree serves as the commitment of the UTXO. This provides a point of storage on-chain for evaluation by Oshiya when searching for queues to process.

N.B. The actual mining process uses the event `UtxoBusQueued` to match `queueId` with the data available in the contract during reward evaluation. 

2. Oshiya then looks for events `UtxoBusQueued` to identify queued UTXOs. It calls the `PantherBusTree` contract to read `BusBatchRec` structs, simultaneously revealing which batches will yield high reward.

3. Once Oshiya has up to 64 UTXOs to process, it does the following:

- The fully formed queue, containing <= 64 legitimate UTXOs (any remaining space in the tree is taken up with dummy UTXOs), is appended to the fully balanced binary Merkle Tree, of depth 26, located in local storage. 

- A proof of inclusion is generated. This is forwarded to the verifier contract and, if verified as correct, the root of the MT held on `PantherBusTree` is updated. 

As the process continues, Oshiya reads `BusBatchOnboarded` events to attain the new root of each branch being added to the tree to build a complete tree in memory, providing for the continuous appending of UTXOs.

This yields the following benefits:
- A single proof for 64 UTXOs
- A constant source of truth, in the form of smart contract storage, for all UTXOs
- A verifiable method for Oshiyas to mine UTXOs on a reward-based premise

