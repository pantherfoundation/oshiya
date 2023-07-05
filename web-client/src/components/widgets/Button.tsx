import React from 'react';
import classnames from 'classnames';

const Button: React.FC<{
    onClick?(): Promise<void> | void;
    children?: React.ReactNode;
    variant?: 'primary' | 'error';
    disabled?: boolean;
}> = ({onClick, children, variant, disabled}) => {
    return (
        <button
            disabled={disabled}
            className={classnames(
                variant === 'error'
                    ? 'bg-red-500 hover:bg-red-600'
                    : 'bg-blue-500 hover:bg-blue-600',
                'text-white font-bold py-2 px-4 rounded',
                disabled &&
                    'opacity-80 bg-gray-500 hover:bg-gray-700 hover:cursor-not-allowed',
            )}
            onClick={onClick}
        >
            {children}
        </button>
    );
};

export default Button;
