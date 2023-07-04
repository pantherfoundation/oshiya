import React from 'react';

const Button: React.FC<{
    onClick?(): Promise<void> | void;
    children?: React.ReactNode;
}> = ({onClick, children}) => {
    return (
        <button
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
            onClick={onClick}
        >
            {children}
        </button>
    );
};

export default Button;
