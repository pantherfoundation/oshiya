# Enhancement Proposals

Protocol/Team Proposals
The following proposals have been provided by key members of the protocol. The areas in which Oshiya may be optimised is not restricted to these areas alone: further/innovative optimisations are still viable for a **BONUS** reward.

Enhancements may be implemented in 3 main functional areas:

-   Core SDK: Providing enhanced functionality, advanced utilities and intuitive error handling
-   UI: A browser-based interface for operators of Oshiya, this should include an attractive, cutting edge interface, advanced statistics and a potential browser extension
-   Overall Improvements: Here, better architecture is invited to be proposed, which may include a complete overhaul and/or refactoring.

Although Core SDK, UI, and Overall Improvements are distinct areas of Oshiya, enhancements in these areas may overlap.

Specific areas for improvement have been identified internally, as follows:

1. Miner-client/SDK

### Transaction Nomination

**MEDIUM**

_Background_: Currently, Oshiya retrieves all pending UTXOs from on-chain events and processes them in a semi-random election process. This is effective, however some people may wish to process their own transactions.

_Proposal_: Produce a ‘nominate transactions to process’ feature, allowing a user to nominate a queue ID from a drop down menu or via direct injection on Oshiya.

-   UI: Frontend UI elements to include are: search bar, drop down menu, switchover button (between standard or nominator modes).
-   Events Retrieval: This method will require specific branch(es) being returned from the search. This will require implementation of a specially designed events scanner which returns all queued batches, from which the corresponding queue ID can be chosen.
-   Stop/Begin Oshiya: Since there are two modes of operation, consider that the ‘live events scanner’ (part of the core architecture) will need to be stopped to allow for the user’s Oshiya to mine said specified transactions. This start/stop process should self initiate (ergo, keep the UJ to a minimum).

_Advantages_:

-   Explicit transaction nomination: Users can process their own or a proposed set of transactions without the need to consider the semi-random election process built into Oshiya.
-   Process transactions with low-value rewards: The election process utilizes the reward volume available with any queue ID to select transactions to process: therein, users who have sent a low-value reward face the issue of prolonged process times. This feature of Oshiya can omit this concern for users who are motivated by reward, but rather are concerned about processing transactions in good time.

_Implementation Considerations_:

-   UX & flow: Since Oshiya will have two modes of operation, ensure that switching between standard or nominator modes implements a clean transition.
-   Parallel zMiners: If a zMiner processes the queue in parallel, i.e. while another zMiner is processing the nominated queue, the process should halt. If the zMiner wishes to restart the auto-mine process, it should be done so explicitly.

### Cold start process

**LOW**

_Background_: Oshiya’s current cold start process relies exclusively on BusBatchOnboarded events from the subgraph. This approach misses out on utilizing UtxoBusQueued events, leading to an inefficient scanning of Ethereum logs from a point further in the past than necessary.

_Proposal_: Enhance the cold start mechanism by incorporating a memory cache (MemCache) system that utilizes UtxoBusQueued events. This can be achieved through the following:

-   Inclusion of UtxoBusQueued events: Populate this MemCache with UtxoBusQueued events, which are currently not being utilized. These events provide crucial information about queued transactions, offering a more accurate starting point for log scanning.

_Advantages_:

-   Improved Efficiency: Starting the log scanning from a more relevant point, streamlines the process, avoiding unnecessary data processing.
-   Reduced Cold Start Time: The overall time taken for the cold start would be significantly decreased, enhancing the responsiveness of Oshiya.
-   Resource Optimization: This approach would require fewer computational resources, contributing to a more efficient operation of the system.

_Implementation Considerations_:

-   Integration with Existing Architecture: The new MemCache system should be seamlessly integrated with the existing Oshiya infrastructure: ensuring that it does not interfere with other processes.
-   Reliability and Testing: Rigorous testing is essential to confirm that the integration of the MemCache system and the utilization of UtxoBusQueued events enhance the cold start process without introducing new vulnerabilities or inefficiencies.

### Scalability optimization

**MEDIUM**

_Background_: The current architecture picks the top 5 un-onboarded queues with highest reward values from the smart contract to mine, via the function call getOldestPendingQueues(), which looks at structs BusQueueRec. While effective, it doesn’t lend consideration to a large number (e.g. >10) miners competing for insertion/rewards. Quickly, this could render the role of running a miner (zMining) to be financially uninteresting to potential new zMiners. The more zMiners, the faster the transitioning system.

_Proposal_: Consider an update or addition to the queue-processing, that stores > 1 queue, whilst listening for BusBatchOnboarded events to trigger a switch to appending of another as yet unprocessed queue without needing to rely on retrieving new events/data.

-   Modification of Reward-Based-Election: Modify the current electoral system of 1-in-5 high reward queues to either give access to a higher spread (e.g. M-in-N where N>>5 and M ~ number of active miners (value can be discretised initially)).
-   Multi-Storage for Unprocessed Queues: Store more than 1 (e.g. implement an M+1-in-N electoral system) unprocessed queues to provide for a fallback if one queue is successfully appended mid-process. If the in-process queue is appended by a parallel zMiner, Oshiya should then begin processing the backup queue, find another queue, store it, and repeat/continue the process.
-   Fallback Scanning: Via utilisation of live events scanning, ensure that, if a queue has been double-elected and one is submitted, that the zMiner will halt the current process and start on a different queue that is yet to be confirmed as appended.

_Advantages_:

-   Scalability: This method provides for a larger number of zMiners to operate in the network whilst maintaining profitability.
-   Consistency: Less batch processed queues will be rejected by the contract due to a parallel Oshiya instance having processed the queue, and, in the case that XXX flags a being-processed queue as submitted, the switchover latency will be reduced.
-   Optimised Profit Stream: Profits extracted by zMiners will be more regular.

_Implementation Considerations_:

-   Latency: Ensure the time required to load a second (+1) queue is less than the time taken to register, halt, and restart the appending process.
-   Time Handling: Utilize promises and await to effectively streamline the function of the zMiner in times of poor RPC response time and other unwanted errors.

### Event Handling

**LOW**

_Background_: The current implementation of Oshiya relies on periodic scanning of EVM logs for events such as BusBatchOnboarded and UtxoBusQueued. While effective, this method can be resource-intensive and less responsive compared to real-time event listening.

_Proposal_: Transition from an event scanning approach to an event listening model. This would involve setting up listeners that actively monitor and respond to relevant Ethereum events as they occur. To ensure no events are missed, implement the following strategies:

-   Robust event listeners: Develop and deploy event listeners that are designed to continuously monitor the blockchain for specified events. These listeners should be optimized for minimal latency and high reliability.
-   Fallback scanning mechanism: Implement a fallback scanning mechanism that periodically checks for any events that might have been missed by the listeners. This could be scheduled during low-activity periods to minimize resource usage.
-   Event confirmation system: Introduce a confirmation system where each detected event is verified for its completion and integrity. This would ensure that the listeners have accurately captured and processed each event.

_Advantages_:

-   Real-time responsiveness: Event listening provides real-time updates, allowing Oshiya to respond more quickly to changes on the blockchain.
-   Resource efficiency: This method is typically less resource-intensive than continuous scanning, as it reacts to events rather than searching for them.
-   Reduced latency: Listening for events as they occur reduces the time lag between an event occurrence and Oshiya's response.

_Implementation Considerations_:

-   Reliability and redundancy: Ensure the event listeners are robust enough to maintain continuous operation and have redundancy measures to handle potential downtimes or failures.
-   Compatibility and integration: Careful integration with the existing Oshiya system is crucial, ensuring that the transition to event listening does not disrupt other functionalities.
-   Extensive testing: Rigorous testing is needed to ensure that the event listening system, along with its fallback and confirmation mechanisms, operates reliably and accurately under various conditions.

### Enhanced Logging System

**MEDIUM**

_Background_: The current logging mechanism in Oshiya is limited to simple print statements into standard output. While this provides basic logging functionality, it lacks advanced features and flexibility required for efficient debugging and monitoring.

_Proposal_: Implement a more robust logging system using advanced logging libraries. This enhanced system should include the following features:

-   Log levels: Implement different log levels (e.g. INFO, DEBUG, WARNING, ERROR, CRITICAL) to categorize the logs. This allows for more granular control over what is logged and under what circumstances.
-   Log formatting: Customize log formats to include essential details such as timestamps, log levels, and message content. This enhances readability and makes it easier to trace issues.
-   File and console logging: Configure the system to log to both files and the console. File logging creates a persistent record for historical analysis, while console logging offers real-time insights.
-   Rotation and archiving: Introduce log rotation and archiving mechanisms to manage log file sizes and maintain historical data without overwhelming the system's storage.

_Advantages_

-   Improved debugging: Enhanced logging provides more detailed insights into the system’s operation, making it easier to identify and resolve issues.
-   Customizability: Advanced logging systems offer greater flexibility to tailor logging to specific needs and preferences.
-   Performance monitoring: With better logs, monitoring the performance and health of Oshiya becomes more straightforward and effective.

_Implementation Considerations_

-   Seamless integration: Ensure that the new logging system integrates smoothly with the existing Panther Miner infrastructure without causing disruptions.
-   Performance impact: Assess the impact of the enhanced logging on the system’s performance, ensuring it remains lightweight and efficient.
-   Security and privacy: Ensure that logs do not inadvertently capture sensitive information, maintaining the system's security and user privacy.

### Records for Statistics

**MEDIUM**

_Background_: Statistics, covering only proof status and zMining success/failure, are currently taken from mining and are recorded to a local file.

_Proposal_: Implement a statistical monitoring client, for both local and global use, which allows monitoring of the effectiveness of Oshiya and for potentially pinpointing of system flaws over the duration of its implementation. This should include data from the genesis block, and scrape the chain periodically/under a trigger (e.g. event/emit from SC).

-   Time to process queue: Time taken, from last UtxoBusqueued with a specific queueId to BusBatchOnboarded.
-   Number of UTXOs processed: Each BusBatchOnboarded event contains data for the number of UTXOs contained in the queue (whilst the number is <= 64, it can be less, where empty leaves are hashed in place of other potential entries).
-   RPC response time: Time taken from RPC request to retrieval of data, along with errors experienced per RPC call. This shouldn’t vary much, but may give insight to avoidable bugs that are difficult to sense in small testing timeframes vs. large implementation run times, thereby potentially providing room for further optimization.
-   Rewards: Reward obtained per queue, along with number of queues processed, to provide averaged data. Consider implementing time-based records as well, as this may give insight to peak and trough times for the protocol.
-   Number of Registered zMiners: zMiner address is emitted with each BusBatchOnboarded event. Retrieve all zMiner addresses to provide a monitor on network activity.
    _N.B: The records should be tuned to yield per Oshiya and global records. See UI/Statistics Client_

_Advantages_

-   Comprehensive Insights: Comprehensive statistical records provide for a true insight into zMiner performance.
-   Community Participation: Endpoints are created that can serve to provide insight into local/individual statistics for those in the community operating an Oshiya.
-   Performance Monitoring: A continual model means Panther internally can monitor and, eventually via DAO, propose evidence-based improvements to the software.

_Implementation Consideration_

-   Github Actions: Base the software on a platform such as GitHub and utilise GitHub Actions to initiate collection of data dependent on an event trigger.
-   Web Sockets: Web Sockets can be used to retrieve live data and ensure an up to date statistical record.
-   Infura/Alchemy & Scope of Panther: Ensure that logs do not inadvertently capture sensitive information, maintaining the system's security and user privacy.
-   UI Interfacing: Ensure the client provides datasets in a readable format (e.g. JSON) for frontend (or backend) interfacing.
-   Privacy: Whilst individual performance metrics are attainable (e.g. zMiner who received the most/least rewards, etc), these shouldn’t necessarily be formally collected, as zMiners will likely appreciate a degree of privacy.
-   Multi-chain: This should only scrape Polygon Mumbai for now, but be adaptable.

### Enhanced Error Handling

**LOW**

_Background_: There exists known errors in operation of Oshiya which lead to its failure mid process, requiring human interaction for reboot.

_Proposal_: Mitigate these breakdowns of function through proper error handling, possibly via timeout implementations on promise/await/async functions.

-   RPC, Private key & Matic in EOA: A check should be done at the initiation of Oshiya to ensure that the software is actually able to write data to the BusTree stack. This requires proper definition of environment variables, specifically the RPC node and private key. Also, the EOA should have a MATIC balance of >10 $MATIC.
-   Tree Root Mismatch: The Tree Root Mismatch error arises occasionally when running the web client. Oshiya continues to run indefinitely, whilst submissions are continually unsuccessful. This requires a manual/’hard restart’ (CLI code denoted below), which can be automated.
-   Events scanner unsynced: On occasion, the events scanner becomes unsynced with the network, resulting in rejected submissions of roots and thus requiring a manual/’hard reset’, which again can be automated.
-   Other Errors: The manner in which errors listed can be corrected present some form of continuity. Utilize this to mitigate (if not fully, at least partially) other errors which may require manual interaction to reboot Oshiya.

_Advantages_

-   Better performance: Reduced critical errors mean more continuous mining, resulting in a more reliable and streamlined protocol function and zMiner yield.
-   Hands-off operation: The software should be initiated and left, providing a smooth user experience whilst maintaining consistent rewards/profits.

_Implementation Considerations_:

-   Seamless integration: Ensure that the error handling integrates smoothly with the existing Oshiya infrastructure without causing disruptions.
-   Testing: Ensure Oshiya runs without unwanted interruptions due to new timeouts/error handling.

Hard Reset

`docker run -e RPC_URL=.... -e SUBGRAPH_ID=QmUVLJABZYqpoEn8L9JWFzE1WJJLZMDQLoBKRQXJyABLEe -e CONTRACT_ADDRESS=0xC042Dd23517eDB7E38F7e92d2e38B6a1f03D7947 -e GENESIS_BLOCK_NUMBER=38811462 -e INTERVAL=20 -e PRIVATE_KEY=0x.... pantherprotocol/miner-client;`
`&&`
`yarn start`

2. UI

### Web App Improvements

**HIGH**

_Background_: The current web app functions from a technical perspective (not considering logging, error handling or statistics). The UI is still rudimentary, and would greatly benefit from enhanced design features to give a more attractive interface for Oshiya operators, the zMiners.

_Proposal_: Produce an enhanced browser-based UI design, operating from mobile-first principles, applying Panther Protocol’s existing colour palette and design features as seen on the main website www.pantherprotocol.io.

-   Apply Panther brand: Ensure the resulting interface compliments the established design of Panther’s main website to ensure consistency.
-   Interactive Elements: Utilise hover, transitions, transforms, box shadows and other advanced CSS elements to produce a responsive design.
-   Color pallette: Consider and largely mimic the existing color palette of Panther.
-   Mobile first: Ensure that, although the application should be designed for browser, the resultant framework operates well on mobile-sized screens and devices. This provides for potential future adoption of a mobile based application.
-   Cutting edge: Consider utilising TouchDesigner or other visual programming software to bring a cutting edge feel to the interface.
-   User journey: Ensure the user journey is intuitive considering both desired function and the access to/reading of logs.
-   **BONUS** Browser Extension: Produce the framework, or derived framework, that allows Oshiya to be run as a browser extension. The app should boot quickly and, if in extension, should accommodate automatic initiation when a browser is opened.

_Advantages_

-   Attractive: zMiners yield rewards for their work. The product itself should have an attractive presentation.
-   Intuitive: Individual elements which make up Oshiya’s function should be clearly readable, in clean-cut containers with an intuitive UI.
-   Easy access: Automatic start on browser launch means a truly hands-off approach to zMining, yielding an easy route for the community to support the network and achieve consistently quick transaction times.

_Implementation Consideration_

-   Lightweight: The lighter the software package, the quicker it boots.
-   Performance impact: Ensure the data files (e.g. images) and responsiveness don’t produce high latency/laggy interface, and ensure any errors in processing are suitably dealt with (e.g. loading bars, etc).

### Statistics Interface

**MEDIUM**

_Background_: Given a Statistics Client has been implemented, an interface will provide a single point of access to monitor the performance of Oshiyas across the network, and provide room for further optimisation/customizability.

_Proposal_: Create a landing page with customizable graph and metric interfaces, considering those metrics defined earlier in Statistics Client. The page should retrieve data from a set of endpoints, should provide a global overview of raw datas and, via a form of Wallet Connect, provide individual insights into the performance of zMiners and Oshiya. The page should include containers (divs) for each of the desired metric outputs, including but not limited to:

-   Rate of Queue Processing (Local): Oshiya’s performance considering number of queues being processed per time taken to onboard the queue (not per second!).
-   Total Yield: A per zMiner (according to the Oshiya operator/zMiner themselves, defined by public key) and global yield of rewards earnt through Oshiya instances.
-   Average TPS: A global statistic for UTXOs processed per unit time.
-   Number of Registered Oshiyas: Global number of Oshiya instances operating (this can be derived from the `address(from)` field in tx receipts for all BusBatchOnboarded events).
-   RPC Response Time (global): Average time taken between request and return of blockchain data, to provide an interface for network activity and overall performance.

_Advantages_

-   Insight: Community and internal insight into the performance of Oshiya instances and the overall Panther network will be easily observable.
-   Monitoring: If there is an anomaly or persistent error, it will be clear and signifies points of interest for further improvement/management.

_Implementation Considerations_:

-   Statistics Client: This requires the installation of the previously proposed Statistics Client.
-   Pagination: Over time, the data set contained will become large. Consider paginating datas, or utilising adaptable graph packages to ensure the page doesn’t experience overloading and affect system performance.
-   Intricacy of UI: This is not a retail-focused Web App: prioritize utility over looks.

3. Docker/Containerisation

**LOW**
_Background_: While the current Docker file operates, it doesn’t accommodate advanced functionalities of Docker to produce a streamlined build.

_Proposal_: Optimise the Dockerization process for the Oshiya software. The goal is to enhance efficiency, reduce image size, and streamline the deployment process.

-   Multi-Stage Builds: Utilize multi-stage builds to separate the build dependencies from the runtime, resulting in a smaller production image.
-   Clean-up: Remove unnecessary dependencies and files after the build process in the final stage to further reduce the image size.
-   Security: Regularly update the base image and dependencies to include the latest security patches.

_Advantages_

-   Streamlined deployment: Optimising the Dockerization process will result in a more efficient deployment pipeline, reducing the time and resources required for application deployment.
-   Reduced image size: By implementing best practices and leveraging multi-stage builds, we aim to minimise the final - Docker image size. This is crucial for faster image pull times and efficient resource utilisation.

4. Out of Scope
   **BONUS**

_Background_: There is a possibility that at least a significant part of this architecture would benefit from a complete overhaul, addressing topics that are outside of the scope of Enhancement \_Proposal_s mentioned hitherto.

_Proposal_: Re-design the Oshiya architecture to provide a notably more effective miner.

-   Efficiency: Considering time taken per insertion of a branch/batch, ensure the new architecture takes less time per `n` queues processed — don’t forget the impact of parallel zMiners!
-   Scalability: Ensure the system scales as the protocol and user base grows.
-   Records: Clean, concise, and intuitive records should be monitored live and logged for historical reference in a public place.
-   Security: Ensure the security and integrity of the system isn’t compromised, and is robust enough to omit any bad players (think front running, sandwich attacks and MEV style manipulation).
-   User Experience: The UX should feature intuitive UI/UJ, with clean interface(s) and a style matching that of the Panther wallet, website and general design image for the protocol. It should be built in a familiar stack (ergo React/Typescript).

_Advantages_

-   Robustness: If a better architecture is provided, the resultant Oshiya should be more robust considering the points listed above, and thus more interesting to potential Oshiya operators and/or active members of the community.
