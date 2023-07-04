import React, {useEffect, useRef} from 'react';
import {EmptyObject} from 'redux';
import {useAppSelector} from 'redux/store';

const MinerLogs: React.FC<EmptyObject> = () => {
    const container = useRef<HTMLDivElement>(null);
    const logs = useAppSelector(state => state.logs);

    useEffect(() => {
        if (container.current) {
            container.current.scrollTo({
                top: container.current.scrollHeight,
            });
        }
    }, [logs, container]);

    if (logs.length === 0) return null;

    return (
        <div className="w-full">
            <h1 className="text-center mt-9 text-6xl">Logs</h1>
            <div
                ref={container}
                className="bg-gray-800 text-white py-4 px-4 rounded-lg mt-5 font-mono text-sm h-96 overflow-y-scroll w-full"
            >
                {logs.map((log, idx) => (
                    <p key={idx}>{log}</p>
                ))}
            </div>
        </div>
    );
};

export default MinerLogs;
