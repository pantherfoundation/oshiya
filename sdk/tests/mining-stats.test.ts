import fs from 'fs';

import {MiningStats} from '../src/mining-stats'; // path to your MiningStats file

jest.mock('fs', () => ({
    writeFileSync: jest.fn(),
}));

describe('MiningStats', () => {
    let miningStats: MiningStats;

    beforeEach(() => {
        miningStats = new MiningStats();
    });

    it('increments count metric', () => {
        miningStats.incrementCountMetric('countKey');
        expect(miningStats.getCountMetrics()).toEqual({countKey: 1});
        miningStats.incrementCountMetric('countKey', 2);
        expect(miningStats.getCountMetrics()).toEqual({countKey: 3});
    });

    it('adds to list metric', () => {
        miningStats.addToListMetric('listKey', 1);
        expect(miningStats.getListMetrics()).toEqual({listKey: [1]});
        miningStats.addToListMetric('listKey', 2);
        expect(miningStats.getListMetrics()).toEqual({listKey: [1, 2]});
    });

    it('writes to file correctly', () => {
        miningStats.incrementCountMetric('countKey', 3);
        miningStats.addToListMetric('listKey', 1);
        miningStats.addToListMetric('listKey', 2);
        miningStats.writeToFile();

        const expectedMetrics = {
            countKey: 3,
            listKey_sum: 3,
            listKey_avg: 1.5,
            listKey_min: 1,
            listKey_max: 2,
        };

        expect(fs.writeFileSync).toBeCalledWith(
            'stats.json',
            JSON.stringify(expectedMetrics),
        );
    });
});
