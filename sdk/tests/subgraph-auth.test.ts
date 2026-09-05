import axios from 'axios';

import {Subgraph} from '../src/subgraph';

jest.mock('axios');
const post = jest.mocked(axios.post);
const get = jest.mocked(axios.get);

describe('subgraph authentication', () => {
    beforeEach(() => jest.resetAllMocks());

    it.each([undefined, 'test-token'])(
        'authenticates GraphQL and health reads with %s',
        async token => {
            post.mockResolvedValue({
                status: 200,
                data: {data: {busQueueOpeneds: [{blockNumber: '42'}]}},
            });
            get.mockResolvedValue({
                data: {
                    projection: {
                        lastCompletedBlock: 40,
                        chainCompletedBlock: 42,
                    },
                },
            });
            const subgraph = new Subgraph(
                'https://example.test/projection',
                token,
            );
            const headers = token ? {Authorization: `Bearer ${token}`} : {};

            await expect(subgraph.getOldestBlockNumber()).resolves.toBe(42);
            await expect(subgraph.getIndexedBlockNumber()).resolves.toBe(40);

            expect(post).toHaveBeenCalledWith(
                'https://example.test/projection',
                expect.any(Object),
                {timeout: 15000, headers},
            );
            expect(get).toHaveBeenCalledWith(
                'https://example.test/projection/health',
                {timeout: 15000, headers},
            );
        },
    );

    it('retains authentication on transport retries', async () => {
        jest.useFakeTimers();
        try {
            const failure = new Error('connection reset');
            jest.mocked(axios.isAxiosError).mockReturnValue(true);
            post.mockRejectedValueOnce(failure).mockResolvedValue({
                status: 200,
                data: {data: {busQueueOpeneds: []}},
            });
            const result = new Subgraph(
                'https://example.test',
                'test-token',
            ).getOldestBlockNumber();
            await jest.runAllTimersAsync();
            await result;
            expect(post).toHaveBeenCalledTimes(2);
            for (const call of post.mock.calls) {
                expect(call[2]?.headers).toEqual({
                    Authorization: 'Bearer test-token',
                });
            }
        } finally {
            jest.useRealTimers();
        }
    });
});

describe('subgraph response handling', () => {
    beforeEach(() => jest.resetAllMocks());

    it.each([401, 403])(
        'surfaces HTTP %s health authentication failures',
        async status => {
            jest.mocked(axios.isAxiosError).mockReturnValue(true);
            get.mockRejectedValue({response: {status}});
            await expect(
                new Subgraph(
                    'https://example.test',
                    'test-token',
                ).getIndexedBlockNumber(),
            ).rejects.toThrow('Subgraph authentication failed');
        },
    );

    it('retains the chain fallback when health is unavailable', async () => {
        jest.mocked(axios.isAxiosError).mockReturnValue(true);
        get.mockRejectedValue({response: {status: 404}});
        await expect(
            new Subgraph('https://example.test').getIndexedBlockNumber(),
        ).resolves.toBe(-1);
    });

    it('normalizes GraphQL batch identifiers and roots to bigint', async () => {
        post.mockResolvedValue({
            status: 200,
            data: {
                data: {
                    busBatchOnboardeds: [
                        {
                            queueId: '9007199254740993',
                            batchRoot: '9007199254740995',
                            leftLeafIndexInBusTree: '128',
                            numUtxosInBatch: '5',
                            blockNumber: '42',
                            busTreeNewRoot: '10',
                            busBranchNewRoot: '11',
                        },
                    ],
                },
            },
        });
        const batches = await new Subgraph(
            'https://example.test',
        ).getOnboardedBatches();
        expect(batches[0]).toMatchObject({
            queueId: BigInt('9007199254740993'),
            batchRoot: BigInt('9007199254740995'),
            leftLeafIndexInBusTree: 128,
            numUtxosInBatch: 5,
            blockNumber: 42,
            batchIndex: 2,
            branchIndex: 0,
        });
    });
});
