// SPDX-License-Identifier: BUSL-1.1
// SPDX-FileCopyrightText: Copyright 2021-22 Panther Ventures Limited Gibraltar

import fs from 'fs';

import {LogFn, log as defaultLog} from './logging';

export type Stats = {
    generatedProof: number;
    submittedProof: number;
    miningSuccess: number;
    miningError: number;
    simulateError: number;
};

export class MiningStats {
    public readonly countMetrics: Record<string, number> = {};
    public readonly listMetrics: Record<string, Array<number>> = {};
    public readonly stats: Stats = {
        generatedProof: 0,
        submittedProof: 0,
        miningSuccess: 0,
        miningError: 0,
        simulateError: 0,
    };

    public incrementStats(key: keyof Stats): void {
        this.stats[key] += 1;
    }

    incrementCountMetric(key: string, value: number = 1) {
        if (!this.countMetrics[key]) {
            this.countMetrics[key] = 0;
        }
        this.countMetrics[key] += value;
    }

    addToListMetric(key: string, value: number) {
        if (!this.listMetrics[key]) {
            this.listMetrics[key] = [];
        }
        this.listMetrics[key].push(value);
    }

    getCountMetrics(): Record<string, number> {
        return this.countMetrics;
    }

    getListMetrics(): Record<string, Array<number>> {
        return this.listMetrics;
    }

    writeToFile(): void {
        this.computeDerivedMetrics(this.listMetrics); // compute average, min, max, etc
        fs.writeFileSync('stats.json', JSON.stringify(this.countMetrics));
    }

    printMetrics(): void {
        console.log('='.repeat(20), 'Mining Stats', '='.repeat(20));
        console.table(this.countMetrics);

        if (Object.keys(this.listMetrics).length > 0)
            console.log('List Metrics:');
        for (const key in this.listMetrics) {
            console.log(`\n${key}:`);
            console.table(this.listMetrics[key]);
        }
        console.log('='.repeat(52));
    }

    // compute derived metrics (average, min, max, etc.) from listMetrics and
    // return a new object
    private computeDerivedMetrics(
        listMetrics: Record<string, Array<number>>,
    ): void {
        for (const key in listMetrics) {
            const sum = listMetrics[key].reduce((a, b) => a + b, 0);
            const avg = sum / listMetrics[key].length;
            this.countMetrics[`${key}_sum`] = sum;
            this.countMetrics[`${key}_avg`] = avg;
            this.countMetrics[`${key}_min`] = Math.min(...listMetrics[key]);
            this.countMetrics[`${key}_max`] = Math.max(...listMetrics[key]);
        }
    }
}

export function logAndCount(
    messageAndMetric: string,
    miningStats: MiningStats,
    log: LogFn = defaultLog,
) {

    log(messageAndMetric);
    miningStats.incrementCountMetric(messageAndMetric, 1);
}

export function addToListAndCount(
    metric: string,
    value: number,
    miningStats: MiningStats,
) {
    miningStats.addToListMetric(metric, value);
}
