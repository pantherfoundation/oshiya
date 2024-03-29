/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */
import {
    BaseContract,
    BigNumber,
    BigNumberish,
    BytesLike,
    CallOverrides,
    ContractTransaction,
    Overrides,
    PopulatedTransaction,
    Signer,
    utils,
} from 'ethers';
import {FunctionFragment, Result, EventFragment} from '@ethersproject/abi';
import {Listener, Provider} from '@ethersproject/providers';
import type {Event, EventFilter} from 'ethers';

export interface TypedEvent<
    TArgsArray extends Array<any> = any,
    TArgsObject = any,
> extends Event {
    args: TArgsArray & TArgsObject;
}
type TypechainArgsArray<T> = T extends TypedEvent<infer U> ? U : never;

export interface OnEvent<TRes> {
    <TEvent extends TypedEvent>(
        eventFilter: TypedEventFilter<TEvent>,
        listener: TypedListener<TEvent>,
    ): TRes;
    (eventName: string, listener: Listener): TRes;
}

export interface TypedEventFilter<_TEvent extends TypedEvent>
    extends EventFilter {}
export interface TypedListener<TEvent extends TypedEvent> {
    (...listenerArg: [...TypechainArgsArray<TEvent>, TEvent]): void;
}

export type G1PointStruct = {x: BigNumberish; y: BigNumberish};

export type G1PointStructOutput = [BigNumber, BigNumber] & {
    x: BigNumber;
    y: BigNumber;
};

export type G2PointStruct = {
    x: [BigNumberish, BigNumberish];
    y: [BigNumberish, BigNumberish];
};

export type G2PointStructOutput = [
    [BigNumber, BigNumber],
    [BigNumber, BigNumber],
] & {x: [BigNumber, BigNumber]; y: [BigNumber, BigNumber]};

export type SnarkProofStruct = {
    a: G1PointStruct;
    b: G2PointStruct;
    c: G1PointStruct;
};

export type SnarkProofStructOutput = [
    G1PointStructOutput,
    G2PointStructOutput,
    G1PointStructOutput,
] & {a: G1PointStructOutput; b: G2PointStructOutput; c: G1PointStructOutput};

export declare namespace BusQueues {
    export type BusQueueRecStruct = {
        queueId: BigNumberish;
        nUtxos: BigNumberish;
        reward: BigNumberish;
        potentialExtraReward: BigNumberish;
        firstUtxoBlock: BigNumberish;
        lastUtxoBlock: BigNumberish;
        remainingBlocks: BigNumberish;
        commitment: BytesLike;
    };

    export type BusQueueRecStructOutput = [
        number,
        number,
        BigNumber,
        BigNumber,
        number,
        number,
        number,
        string,
    ] & {
        queueId: number;
        nUtxos: number;
        reward: BigNumber;
        potentialExtraReward: BigNumber;
        firstUtxoBlock: number;
        lastUtxoBlock: number;
        remainingBlocks: number;
        commitment: string;
    };
}

export interface PantherBusTreeInterface extends utils.Interface {
    contractName: 'PantherBusTree';
    functions: {
        'CIRCUIT_ID()': FunctionFragment;
        'OWNER()': FunctionFragment;
        'PANTHER_POOL()': FunctionFragment;
        'REWARD_TOKEN()': FunctionFragment;
        'START_TIME()': FunctionFragment;
        'VERIFIER()': FunctionFragment;
        'addUtxoToBusQueue(bytes32)': FunctionFragment;
        'addUtxosToBusQueue(bytes32[],uint96)': FunctionFragment;
        'basePerUtxoReward()': FunctionFragment;
        'getAllowedUtxosAt(uint256,uint256)': FunctionFragment;
        'getBusQueue(uint32)': FunctionFragment;
        'getBusQueuesStats()': FunctionFragment;
        'getBusTreeStats()': FunctionFragment;
        'getOldestPendingQueues(uint32)': FunctionFragment;
        'getParams()': FunctionFragment;
        'getRoot()': FunctionFragment;
        'onboardQueue(address,uint32,uint256[],((uint256,uint256),(uint256[2],uint256[2]),(uint256,uint256)))': FunctionFragment;
        'perMinuteUtxosLimit()': FunctionFragment;
        'simulateAddUtxosToBusQueue()': FunctionFragment;
        'updateParams(uint16,uint96,uint16,uint16,uint16)': FunctionFragment;
        'utxoCounter()': FunctionFragment;
    };

    encodeFunctionData(
        functionFragment: 'CIRCUIT_ID',
        values?: undefined,
    ): string;
    encodeFunctionData(functionFragment: 'OWNER', values?: undefined): string;
    encodeFunctionData(
        functionFragment: 'PANTHER_POOL',
        values?: undefined,
    ): string;
    encodeFunctionData(
        functionFragment: 'REWARD_TOKEN',
        values?: undefined,
    ): string;
    encodeFunctionData(
        functionFragment: 'START_TIME',
        values?: undefined,
    ): string;
    encodeFunctionData(
        functionFragment: 'VERIFIER',
        values?: undefined,
    ): string;
    encodeFunctionData(
        functionFragment: 'addUtxoToBusQueue',
        values: [BytesLike],
    ): string;
    encodeFunctionData(
        functionFragment: 'addUtxosToBusQueue',
        values: [BytesLike[], BigNumberish],
    ): string;
    encodeFunctionData(
        functionFragment: 'basePerUtxoReward',
        values?: undefined,
    ): string;
    encodeFunctionData(
        functionFragment: 'getAllowedUtxosAt',
        values: [BigNumberish, BigNumberish],
    ): string;
    encodeFunctionData(
        functionFragment: 'getBusQueue',
        values: [BigNumberish],
    ): string;
    encodeFunctionData(
        functionFragment: 'getBusQueuesStats',
        values?: undefined,
    ): string;
    encodeFunctionData(
        functionFragment: 'getBusTreeStats',
        values?: undefined,
    ): string;
    encodeFunctionData(
        functionFragment: 'getOldestPendingQueues',
        values: [BigNumberish],
    ): string;
    encodeFunctionData(
        functionFragment: 'getParams',
        values?: undefined,
    ): string;
    encodeFunctionData(functionFragment: 'getRoot', values?: undefined): string;
    encodeFunctionData(
        functionFragment: 'onboardQueue',
        values: [string, BigNumberish, BigNumberish[], SnarkProofStruct],
    ): string;
    encodeFunctionData(
        functionFragment: 'perMinuteUtxosLimit',
        values?: undefined,
    ): string;
    encodeFunctionData(
        functionFragment: 'simulateAddUtxosToBusQueue',
        values?: undefined,
    ): string;
    encodeFunctionData(
        functionFragment: 'updateParams',
        values: [
            BigNumberish,
            BigNumberish,
            BigNumberish,
            BigNumberish,
            BigNumberish,
        ],
    ): string;
    encodeFunctionData(
        functionFragment: 'utxoCounter',
        values?: undefined,
    ): string;

    decodeFunctionResult(
        functionFragment: 'CIRCUIT_ID',
        data: BytesLike,
    ): Result;
    decodeFunctionResult(functionFragment: 'OWNER', data: BytesLike): Result;
    decodeFunctionResult(
        functionFragment: 'PANTHER_POOL',
        data: BytesLike,
    ): Result;
    decodeFunctionResult(
        functionFragment: 'REWARD_TOKEN',
        data: BytesLike,
    ): Result;
    decodeFunctionResult(
        functionFragment: 'START_TIME',
        data: BytesLike,
    ): Result;
    decodeFunctionResult(functionFragment: 'VERIFIER', data: BytesLike): Result;
    decodeFunctionResult(
        functionFragment: 'addUtxoToBusQueue',
        data: BytesLike,
    ): Result;
    decodeFunctionResult(
        functionFragment: 'addUtxosToBusQueue',
        data: BytesLike,
    ): Result;
    decodeFunctionResult(
        functionFragment: 'basePerUtxoReward',
        data: BytesLike,
    ): Result;
    decodeFunctionResult(
        functionFragment: 'getAllowedUtxosAt',
        data: BytesLike,
    ): Result;
    decodeFunctionResult(
        functionFragment: 'getBusQueue',
        data: BytesLike,
    ): Result;
    decodeFunctionResult(
        functionFragment: 'getBusQueuesStats',
        data: BytesLike,
    ): Result;
    decodeFunctionResult(
        functionFragment: 'getBusTreeStats',
        data: BytesLike,
    ): Result;
    decodeFunctionResult(
        functionFragment: 'getOldestPendingQueues',
        data: BytesLike,
    ): Result;
    decodeFunctionResult(
        functionFragment: 'getParams',
        data: BytesLike,
    ): Result;
    decodeFunctionResult(functionFragment: 'getRoot', data: BytesLike): Result;
    decodeFunctionResult(
        functionFragment: 'onboardQueue',
        data: BytesLike,
    ): Result;
    decodeFunctionResult(
        functionFragment: 'perMinuteUtxosLimit',
        data: BytesLike,
    ): Result;
    decodeFunctionResult(
        functionFragment: 'simulateAddUtxosToBusQueue',
        data: BytesLike,
    ): Result;
    decodeFunctionResult(
        functionFragment: 'updateParams',
        data: BytesLike,
    ): Result;
    decodeFunctionResult(
        functionFragment: 'utxoCounter',
        data: BytesLike,
    ): Result;

    events: {
        'BusBatchOnboarded(uint256,bytes32,uint256,uint256,bytes32,bytes32)': EventFragment;
        'BusBranchFilled(uint256,bytes32)': EventFragment;
        'BusQueueOpened(uint256)': EventFragment;
        'BusQueueProcessed(uint256)': EventFragment;
        'BusQueueRewardAdded(uint256,uint256)': EventFragment;
        'BusQueueRewardParamsUpdated(uint256,uint256,uint256)': EventFragment;
        'BusQueueRewardReserveUsed(uint256)': EventFragment;
        'BusQueueRewardReserved(uint256)': EventFragment;
        'MinerRewarded(address,uint256)': EventFragment;
        'UtxoBusQueued(bytes32,uint256,uint256)': EventFragment;
    };

    getEvent(nameOrSignatureOrTopic: 'BusBatchOnboarded'): EventFragment;
    getEvent(nameOrSignatureOrTopic: 'BusBranchFilled'): EventFragment;
    getEvent(nameOrSignatureOrTopic: 'BusQueueOpened'): EventFragment;
    getEvent(nameOrSignatureOrTopic: 'BusQueueProcessed'): EventFragment;
    getEvent(nameOrSignatureOrTopic: 'BusQueueRewardAdded'): EventFragment;
    getEvent(
        nameOrSignatureOrTopic: 'BusQueueRewardParamsUpdated',
    ): EventFragment;
    getEvent(
        nameOrSignatureOrTopic: 'BusQueueRewardReserveUsed',
    ): EventFragment;
    getEvent(nameOrSignatureOrTopic: 'BusQueueRewardReserved'): EventFragment;
    getEvent(nameOrSignatureOrTopic: 'MinerRewarded'): EventFragment;
    getEvent(nameOrSignatureOrTopic: 'UtxoBusQueued'): EventFragment;
}

export type BusBatchOnboardedEvent = TypedEvent<
    [BigNumber, string, BigNumber, BigNumber, string, string],
    {
        queueId: BigNumber;
        batchRoot: string;
        numUtxosInBatch: BigNumber;
        leftLeafIndexInBusTree: BigNumber;
        busTreeNewRoot: string;
        busBranchNewRoot: string;
    }
>;

export type BusBatchOnboardedEventFilter =
    TypedEventFilter<BusBatchOnboardedEvent>;

export type BusBranchFilledEvent = TypedEvent<
    [BigNumber, string],
    {branchIndex: BigNumber; busBranchFinalRoot: string}
>;

export type BusBranchFilledEventFilter = TypedEventFilter<BusBranchFilledEvent>;

export type BusQueueOpenedEvent = TypedEvent<[BigNumber], {queueId: BigNumber}>;

export type BusQueueOpenedEventFilter = TypedEventFilter<BusQueueOpenedEvent>;

export type BusQueueProcessedEvent = TypedEvent<
    [BigNumber],
    {queueId: BigNumber}
>;

export type BusQueueProcessedEventFilter =
    TypedEventFilter<BusQueueProcessedEvent>;

export type BusQueueRewardAddedEvent = TypedEvent<
    [BigNumber, BigNumber],
    {queueId: BigNumber; accumReward: BigNumber}
>;

export type BusQueueRewardAddedEventFilter =
    TypedEventFilter<BusQueueRewardAddedEvent>;

export type BusQueueRewardParamsUpdatedEvent = TypedEvent<
    [BigNumber, BigNumber, BigNumber],
    {
        reservationRate: BigNumber;
        premiumRate: BigNumber;
        minEmptyQueueAge: BigNumber;
    }
>;

export type BusQueueRewardParamsUpdatedEventFilter =
    TypedEventFilter<BusQueueRewardParamsUpdatedEvent>;

export type BusQueueRewardReserveUsedEvent = TypedEvent<
    [BigNumber],
    {usage: BigNumber}
>;

export type BusQueueRewardReserveUsedEventFilter =
    TypedEventFilter<BusQueueRewardReserveUsedEvent>;

export type BusQueueRewardReservedEvent = TypedEvent<
    [BigNumber],
    {extraReseve: BigNumber}
>;

export type BusQueueRewardReservedEventFilter =
    TypedEventFilter<BusQueueRewardReservedEvent>;

export type MinerRewardedEvent = TypedEvent<
    [string, BigNumber],
    {miner: string; reward: BigNumber}
>;

export type MinerRewardedEventFilter = TypedEventFilter<MinerRewardedEvent>;

export type UtxoBusQueuedEvent = TypedEvent<
    [string, BigNumber, BigNumber],
    {utxo: string; queueId: BigNumber; utxoIndexInBatch: BigNumber}
>;

export type UtxoBusQueuedEventFilter = TypedEventFilter<UtxoBusQueuedEvent>;

export interface PantherBusTree extends BaseContract {
    contractName: 'PantherBusTree';
    connect(signerOrProvider: Signer | Provider | string): this;
    attach(addressOrName: string): this;
    deployed(): Promise<this>;

    interface: PantherBusTreeInterface;

    queryFilter<TEvent extends TypedEvent>(
        event: TypedEventFilter<TEvent>,
        fromBlockOrBlockhash?: string | number | undefined,
        toBlock?: string | number | undefined,
    ): Promise<Array<TEvent>>;

    listeners<TEvent extends TypedEvent>(
        eventFilter?: TypedEventFilter<TEvent>,
    ): Array<TypedListener<TEvent>>;
    listeners(eventName?: string): Array<Listener>;
    removeAllListeners<TEvent extends TypedEvent>(
        eventFilter: TypedEventFilter<TEvent>,
    ): this;
    removeAllListeners(eventName?: string): this;
    off: OnEvent<this>;
    on: OnEvent<this>;
    once: OnEvent<this>;
    removeListener: OnEvent<this>;

    functions: {
        CIRCUIT_ID(overrides?: CallOverrides): Promise<[BigNumber]>;

        OWNER(overrides?: CallOverrides): Promise<[string]>;

        PANTHER_POOL(overrides?: CallOverrides): Promise<[string]>;

        REWARD_TOKEN(overrides?: CallOverrides): Promise<[string]>;

        START_TIME(overrides?: CallOverrides): Promise<[BigNumber]>;

        VERIFIER(overrides?: CallOverrides): Promise<[string]>;

        addUtxoToBusQueue(
            utxo: BytesLike,
            overrides?: Overrides & {from?: string | Promise<string>},
        ): Promise<ContractTransaction>;

        addUtxosToBusQueue(
            utxos: BytesLike[],
            reward: BigNumberish,
            overrides?: Overrides & {from?: string | Promise<string>},
        ): Promise<ContractTransaction>;

        basePerUtxoReward(overrides?: CallOverrides): Promise<[BigNumber]>;

        getAllowedUtxosAt(
            _timestamp: BigNumberish,
            _utxoCounter: BigNumberish,
            overrides?: CallOverrides,
        ): Promise<[BigNumber] & {allowedUtxos: BigNumber}>;

        getBusQueue(
            queueId: BigNumberish,
            overrides?: CallOverrides,
        ): Promise<
            [BusQueues.BusQueueRecStructOutput] & {
                queue: BusQueues.BusQueueRecStructOutput;
            }
        >;

        getBusQueuesStats(overrides?: CallOverrides): Promise<
            [number, number, number, BigNumber] & {
                curQueueId: number;
                numPendingQueues: number;
                oldestPendingQueueId: number;
                rewardReserve: BigNumber;
            }
        >;

        getBusTreeStats(overrides?: CallOverrides): Promise<
            [number, number, number, number] & {
                numBatchesInBusTree: number;
                numUtxosInBusTree: number;
                latestBranchFirstBatchBlock: number;
                latestBatchBlock: number;
            }
        >;

        getOldestPendingQueues(
            maxLength: BigNumberish,
            overrides?: CallOverrides,
        ): Promise<
            [BusQueues.BusQueueRecStructOutput[]] & {
                queues: BusQueues.BusQueueRecStructOutput[];
            }
        >;

        getParams(overrides?: CallOverrides): Promise<
            [number, number, number] & {
                reservationRate: number;
                premiumRate: number;
                minEmptyQueueAge: number;
            }
        >;

        getRoot(overrides?: CallOverrides): Promise<[string]>;

        onboardQueue(
            miner: string,
            queueId: BigNumberish,
            inputs: BigNumberish[],
            proof: SnarkProofStruct,
            overrides?: Overrides & {from?: string | Promise<string>},
        ): Promise<ContractTransaction>;

        perMinuteUtxosLimit(overrides?: CallOverrides): Promise<[number]>;

        simulateAddUtxosToBusQueue(
            overrides?: Overrides & {from?: string | Promise<string>},
        ): Promise<ContractTransaction>;

        updateParams(
            _perMinuteUtxosLimit: BigNumberish,
            _basePerUtxoReward: BigNumberish,
            reservationRate: BigNumberish,
            premiumRate: BigNumberish,
            minEmptyQueueAge: BigNumberish,
            overrides?: Overrides & {from?: string | Promise<string>},
        ): Promise<ContractTransaction>;

        utxoCounter(overrides?: CallOverrides): Promise<[number]>;
    };

    CIRCUIT_ID(overrides?: CallOverrides): Promise<BigNumber>;

    OWNER(overrides?: CallOverrides): Promise<string>;

    PANTHER_POOL(overrides?: CallOverrides): Promise<string>;

    REWARD_TOKEN(overrides?: CallOverrides): Promise<string>;

    START_TIME(overrides?: CallOverrides): Promise<BigNumber>;

    VERIFIER(overrides?: CallOverrides): Promise<string>;

    addUtxoToBusQueue(
        utxo: BytesLike,
        overrides?: Overrides & {from?: string | Promise<string>},
    ): Promise<ContractTransaction>;

    addUtxosToBusQueue(
        utxos: BytesLike[],
        reward: BigNumberish,
        overrides?: Overrides & {from?: string | Promise<string>},
    ): Promise<ContractTransaction>;

    basePerUtxoReward(overrides?: CallOverrides): Promise<BigNumber>;

    getAllowedUtxosAt(
        _timestamp: BigNumberish,
        _utxoCounter: BigNumberish,
        overrides?: CallOverrides,
    ): Promise<BigNumber>;

    getBusQueue(
        queueId: BigNumberish,
        overrides?: CallOverrides,
    ): Promise<BusQueues.BusQueueRecStructOutput>;

    getBusQueuesStats(overrides?: CallOverrides): Promise<
        [number, number, number, BigNumber] & {
            curQueueId: number;
            numPendingQueues: number;
            oldestPendingQueueId: number;
            rewardReserve: BigNumber;
        }
    >;

    getBusTreeStats(overrides?: CallOverrides): Promise<
        [number, number, number, number] & {
            numBatchesInBusTree: number;
            numUtxosInBusTree: number;
            latestBranchFirstBatchBlock: number;
            latestBatchBlock: number;
        }
    >;

    getOldestPendingQueues(
        maxLength: BigNumberish,
        overrides?: CallOverrides,
    ): Promise<BusQueues.BusQueueRecStructOutput[]>;

    getParams(overrides?: CallOverrides): Promise<
        [number, number, number] & {
            reservationRate: number;
            premiumRate: number;
            minEmptyQueueAge: number;
        }
    >;

    getRoot(overrides?: CallOverrides): Promise<string>;

    onboardQueue(
        miner: string,
        queueId: BigNumberish,
        inputs: BigNumberish[],
        proof: SnarkProofStruct,
        overrides?: Overrides & {from?: string | Promise<string>},
    ): Promise<ContractTransaction>;

    perMinuteUtxosLimit(overrides?: CallOverrides): Promise<number>;

    simulateAddUtxosToBusQueue(
        overrides?: Overrides & {from?: string | Promise<string>},
    ): Promise<ContractTransaction>;

    updateParams(
        _perMinuteUtxosLimit: BigNumberish,
        _basePerUtxoReward: BigNumberish,
        reservationRate: BigNumberish,
        premiumRate: BigNumberish,
        minEmptyQueueAge: BigNumberish,
        overrides?: Overrides & {from?: string | Promise<string>},
    ): Promise<ContractTransaction>;

    utxoCounter(overrides?: CallOverrides): Promise<number>;

    callStatic: {
        CIRCUIT_ID(overrides?: CallOverrides): Promise<BigNumber>;

        OWNER(overrides?: CallOverrides): Promise<string>;

        PANTHER_POOL(overrides?: CallOverrides): Promise<string>;

        REWARD_TOKEN(overrides?: CallOverrides): Promise<string>;

        START_TIME(overrides?: CallOverrides): Promise<BigNumber>;

        VERIFIER(overrides?: CallOverrides): Promise<string>;

        addUtxoToBusQueue(
            utxo: BytesLike,
            overrides?: CallOverrides,
        ): Promise<[number, number] & {queueId: number; indexInQueue: number}>;

        addUtxosToBusQueue(
            utxos: BytesLike[],
            reward: BigNumberish,
            overrides?: CallOverrides,
        ): Promise<
            [number, number] & {
                firstUtxoQueueId: number;
                firstUtxoIndexInQueue: number;
            }
        >;

        basePerUtxoReward(overrides?: CallOverrides): Promise<BigNumber>;

        getAllowedUtxosAt(
            _timestamp: BigNumberish,
            _utxoCounter: BigNumberish,
            overrides?: CallOverrides,
        ): Promise<BigNumber>;

        getBusQueue(
            queueId: BigNumberish,
            overrides?: CallOverrides,
        ): Promise<BusQueues.BusQueueRecStructOutput>;

        getBusQueuesStats(overrides?: CallOverrides): Promise<
            [number, number, number, BigNumber] & {
                curQueueId: number;
                numPendingQueues: number;
                oldestPendingQueueId: number;
                rewardReserve: BigNumber;
            }
        >;

        getBusTreeStats(overrides?: CallOverrides): Promise<
            [number, number, number, number] & {
                numBatchesInBusTree: number;
                numUtxosInBusTree: number;
                latestBranchFirstBatchBlock: number;
                latestBatchBlock: number;
            }
        >;

        getOldestPendingQueues(
            maxLength: BigNumberish,
            overrides?: CallOverrides,
        ): Promise<BusQueues.BusQueueRecStructOutput[]>;

        getParams(overrides?: CallOverrides): Promise<
            [number, number, number] & {
                reservationRate: number;
                premiumRate: number;
                minEmptyQueueAge: number;
            }
        >;

        getRoot(overrides?: CallOverrides): Promise<string>;

        onboardQueue(
            miner: string,
            queueId: BigNumberish,
            inputs: BigNumberish[],
            proof: SnarkProofStruct,
            overrides?: CallOverrides,
        ): Promise<void>;

        perMinuteUtxosLimit(overrides?: CallOverrides): Promise<number>;

        simulateAddUtxosToBusQueue(overrides?: CallOverrides): Promise<void>;

        updateParams(
            _perMinuteUtxosLimit: BigNumberish,
            _basePerUtxoReward: BigNumberish,
            reservationRate: BigNumberish,
            premiumRate: BigNumberish,
            minEmptyQueueAge: BigNumberish,
            overrides?: CallOverrides,
        ): Promise<void>;

        utxoCounter(overrides?: CallOverrides): Promise<number>;
    };

    filters: {
        'BusBatchOnboarded(uint256,bytes32,uint256,uint256,bytes32,bytes32)'(
            queueId?: BigNumberish | null,
            batchRoot?: BytesLike | null,
            numUtxosInBatch?: null,
            leftLeafIndexInBusTree?: null,
            busTreeNewRoot?: null,
            busBranchNewRoot?: null,
        ): BusBatchOnboardedEventFilter;
        BusBatchOnboarded(
            queueId?: BigNumberish | null,
            batchRoot?: BytesLike | null,
            numUtxosInBatch?: null,
            leftLeafIndexInBusTree?: null,
            busTreeNewRoot?: null,
            busBranchNewRoot?: null,
        ): BusBatchOnboardedEventFilter;

        'BusBranchFilled(uint256,bytes32)'(
            branchIndex?: BigNumberish | null,
            busBranchFinalRoot?: null,
        ): BusBranchFilledEventFilter;
        BusBranchFilled(
            branchIndex?: BigNumberish | null,
            busBranchFinalRoot?: null,
        ): BusBranchFilledEventFilter;

        'BusQueueOpened(uint256)'(queueId?: null): BusQueueOpenedEventFilter;
        BusQueueOpened(queueId?: null): BusQueueOpenedEventFilter;

        'BusQueueProcessed(uint256)'(
            queueId?: BigNumberish | null,
        ): BusQueueProcessedEventFilter;
        BusQueueProcessed(
            queueId?: BigNumberish | null,
        ): BusQueueProcessedEventFilter;

        'BusQueueRewardAdded(uint256,uint256)'(
            queueId?: BigNumberish | null,
            accumReward?: null,
        ): BusQueueRewardAddedEventFilter;
        BusQueueRewardAdded(
            queueId?: BigNumberish | null,
            accumReward?: null,
        ): BusQueueRewardAddedEventFilter;

        'BusQueueRewardParamsUpdated(uint256,uint256,uint256)'(
            reservationRate?: null,
            premiumRate?: null,
            minEmptyQueueAge?: null,
        ): BusQueueRewardParamsUpdatedEventFilter;
        BusQueueRewardParamsUpdated(
            reservationRate?: null,
            premiumRate?: null,
            minEmptyQueueAge?: null,
        ): BusQueueRewardParamsUpdatedEventFilter;

        'BusQueueRewardReserveUsed(uint256)'(
            usage?: null,
        ): BusQueueRewardReserveUsedEventFilter;
        BusQueueRewardReserveUsed(
            usage?: null,
        ): BusQueueRewardReserveUsedEventFilter;

        'BusQueueRewardReserved(uint256)'(
            extraReseve?: null,
        ): BusQueueRewardReservedEventFilter;
        BusQueueRewardReserved(
            extraReseve?: null,
        ): BusQueueRewardReservedEventFilter;

        'MinerRewarded(address,uint256)'(
            miner?: null,
            reward?: null,
        ): MinerRewardedEventFilter;
        MinerRewarded(miner?: null, reward?: null): MinerRewardedEventFilter;

        'UtxoBusQueued(bytes32,uint256,uint256)'(
            utxo?: BytesLike | null,
            queueId?: BigNumberish | null,
            utxoIndexInBatch?: null,
        ): UtxoBusQueuedEventFilter;
        UtxoBusQueued(
            utxo?: BytesLike | null,
            queueId?: BigNumberish | null,
            utxoIndexInBatch?: null,
        ): UtxoBusQueuedEventFilter;
    };

    estimateGas: {
        CIRCUIT_ID(overrides?: CallOverrides): Promise<BigNumber>;

        OWNER(overrides?: CallOverrides): Promise<BigNumber>;

        PANTHER_POOL(overrides?: CallOverrides): Promise<BigNumber>;

        REWARD_TOKEN(overrides?: CallOverrides): Promise<BigNumber>;

        START_TIME(overrides?: CallOverrides): Promise<BigNumber>;

        VERIFIER(overrides?: CallOverrides): Promise<BigNumber>;

        addUtxoToBusQueue(
            utxo: BytesLike,
            overrides?: Overrides & {from?: string | Promise<string>},
        ): Promise<BigNumber>;

        addUtxosToBusQueue(
            utxos: BytesLike[],
            reward: BigNumberish,
            overrides?: Overrides & {from?: string | Promise<string>},
        ): Promise<BigNumber>;

        basePerUtxoReward(overrides?: CallOverrides): Promise<BigNumber>;

        getAllowedUtxosAt(
            _timestamp: BigNumberish,
            _utxoCounter: BigNumberish,
            overrides?: CallOverrides,
        ): Promise<BigNumber>;

        getBusQueue(
            queueId: BigNumberish,
            overrides?: CallOverrides,
        ): Promise<BigNumber>;

        getBusQueuesStats(overrides?: CallOverrides): Promise<BigNumber>;

        getBusTreeStats(overrides?: CallOverrides): Promise<BigNumber>;

        getOldestPendingQueues(
            maxLength: BigNumberish,
            overrides?: CallOverrides,
        ): Promise<BigNumber>;

        getParams(overrides?: CallOverrides): Promise<BigNumber>;

        getRoot(overrides?: CallOverrides): Promise<BigNumber>;

        onboardQueue(
            miner: string,
            queueId: BigNumberish,
            inputs: BigNumberish[],
            proof: SnarkProofStruct,
            overrides?: Overrides & {from?: string | Promise<string>},
        ): Promise<BigNumber>;

        perMinuteUtxosLimit(overrides?: CallOverrides): Promise<BigNumber>;

        simulateAddUtxosToBusQueue(
            overrides?: Overrides & {from?: string | Promise<string>},
        ): Promise<BigNumber>;

        updateParams(
            _perMinuteUtxosLimit: BigNumberish,
            _basePerUtxoReward: BigNumberish,
            reservationRate: BigNumberish,
            premiumRate: BigNumberish,
            minEmptyQueueAge: BigNumberish,
            overrides?: Overrides & {from?: string | Promise<string>},
        ): Promise<BigNumber>;

        utxoCounter(overrides?: CallOverrides): Promise<BigNumber>;
    };

    populateTransaction: {
        CIRCUIT_ID(overrides?: CallOverrides): Promise<PopulatedTransaction>;

        OWNER(overrides?: CallOverrides): Promise<PopulatedTransaction>;

        PANTHER_POOL(overrides?: CallOverrides): Promise<PopulatedTransaction>;

        REWARD_TOKEN(overrides?: CallOverrides): Promise<PopulatedTransaction>;

        START_TIME(overrides?: CallOverrides): Promise<PopulatedTransaction>;

        VERIFIER(overrides?: CallOverrides): Promise<PopulatedTransaction>;

        addUtxoToBusQueue(
            utxo: BytesLike,
            overrides?: Overrides & {from?: string | Promise<string>},
        ): Promise<PopulatedTransaction>;

        addUtxosToBusQueue(
            utxos: BytesLike[],
            reward: BigNumberish,
            overrides?: Overrides & {from?: string | Promise<string>},
        ): Promise<PopulatedTransaction>;

        basePerUtxoReward(
            overrides?: CallOverrides,
        ): Promise<PopulatedTransaction>;

        getAllowedUtxosAt(
            _timestamp: BigNumberish,
            _utxoCounter: BigNumberish,
            overrides?: CallOverrides,
        ): Promise<PopulatedTransaction>;

        getBusQueue(
            queueId: BigNumberish,
            overrides?: CallOverrides,
        ): Promise<PopulatedTransaction>;

        getBusQueuesStats(
            overrides?: CallOverrides,
        ): Promise<PopulatedTransaction>;

        getBusTreeStats(
            overrides?: CallOverrides,
        ): Promise<PopulatedTransaction>;

        getOldestPendingQueues(
            maxLength: BigNumberish,
            overrides?: CallOverrides,
        ): Promise<PopulatedTransaction>;

        getParams(overrides?: CallOverrides): Promise<PopulatedTransaction>;

        getRoot(overrides?: CallOverrides): Promise<PopulatedTransaction>;

        onboardQueue(
            miner: string,
            queueId: BigNumberish,
            inputs: BigNumberish[],
            proof: SnarkProofStruct,
            overrides?: Overrides & {from?: string | Promise<string>},
        ): Promise<PopulatedTransaction>;

        perMinuteUtxosLimit(
            overrides?: CallOverrides,
        ): Promise<PopulatedTransaction>;

        simulateAddUtxosToBusQueue(
            overrides?: Overrides & {from?: string | Promise<string>},
        ): Promise<PopulatedTransaction>;

        updateParams(
            _perMinuteUtxosLimit: BigNumberish,
            _basePerUtxoReward: BigNumberish,
            reservationRate: BigNumberish,
            premiumRate: BigNumberish,
            minEmptyQueueAge: BigNumberish,
            overrides?: Overrides & {from?: string | Promise<string>},
        ): Promise<PopulatedTransaction>;

        utxoCounter(overrides?: CallOverrides): Promise<PopulatedTransaction>;
    };
}
