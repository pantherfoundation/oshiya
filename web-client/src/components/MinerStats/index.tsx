import {useAppSelector} from '../../redux/store';
import React from 'react';

const MinerStats = () => {
    const {countMetrics, listMetrics} = useAppSelector(state => state.stats);

    const isNoCountMetrics = Object.keys(countMetrics).length === 0;
    const isNoListMetrics = Object.keys(listMetrics).length === 0;

    if (isNoCountMetrics && isNoListMetrics) return null;

    return (
        <div className="w-full">
            <h1 className="text-center mt-9 text-6xl">Mining Statistics</h1>

            {isNoCountMetrics === false && (
                <div className="max-w-sm mx-auto mt-4">
                    {Object.entries(countMetrics).map(([key, value]) => (
                        <div
                            className="flex flex-row justify-between align-middle mb-2"
                            key={key}
                        >
                            <p>{key}</p>
                            <p className="font-bold">{value}</p>
                        </div>
                    ))}
                </div>
            )}

            {isNoListMetrics === false && (
                <div className="max-w-sm mx-auto">
                    {Object.entries(listMetrics).map(([key, value]) => (
                        <div
                            className="flex flex-row justify-between align-middle"
                            key={key}
                        >
                            <p className="first-letter:capitalize">{key}</p>
                            <p className="font-bold">{value.join(',')}</p>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default MinerStats;
