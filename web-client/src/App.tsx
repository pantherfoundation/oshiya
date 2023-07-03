import MinerClientParams from 'components/MinerClientParams';
import React, {useState} from 'react';
import './services/worker-manager';

const App = () => {
    const [loading, setLoading] = useState<boolean>(false);

    // useEffect(() => {
    //     setLoading(true);
    //     swManager
    //         .init()
    //         .then(() => {
    //             setLoading(false);
    //         })
    //         .catch((err: Error) => {
    //             setLoading(false);
    //             alert(`SW Error: ${err.message}`);
    //         });
    // }, []);

    return (
        <div className="max-w-screen-lg mx-auto">
            <h1 className="text-5xl text-center my-5">
                {loading
                    ? 'Initializing Service Worker'
                    : 'Panther Miner Client'}
            </h1>

            <MinerClientParams />
        </div>
    );
};

export default App;
