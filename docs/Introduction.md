# Oshiya Documentation

Panther Oshiya features a critical component in the Panther Protocol ecosystem.

Its primary function is to retrieve pending queues from the BusTree SC, generate SNARK proofs of these queue's inclusion in a MT, and submit these proofs to the validator contract.

A queue's legitimacy can be analysed by comparing it against on-chain UTXOs stored in the form of a degenerate merkle tree. The root of this tree can be calculated and comparedd against the root stored there.

If successful, and the proof is valid, the effect of the process is recording of batches of up to 64 Unspent Transaction Outputs
(UTXOs) on the BusTree SC: specifically, the insertion of a merkle tree containing a queue of UTXOs at a specified depth.

Importantly, this simultaneously yields a process requiring relatively low computational power to execute (compared to other methods) and a high level of security. This means the client can be run in a browser, for example, and the community can run Oshiya nodes to gain rewards for properly submitting proofs.
