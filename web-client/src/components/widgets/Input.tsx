import React from 'react';

const Input: React.FC<{
    label: string;
    name?: string;
    value?: string | number;
    onChange?(e: React.ChangeEvent<HTMLInputElement>): void;
    placeholder?: string;
    required?: boolean;
}> = ({label, onChange, placeholder, required, value, name}) => {
    return (
        <div className="mb-4">
            <label className="block mb-2 text-sm font-medium text-gray-900">
                {label} {required ? '*' : ''}
            </label>
            <input
                type="text"
                value={value}
                name={name}
                className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
                placeholder={placeholder}
                required={required}
                onChange={onChange}
            />
        </div>
    );
};

export default Input;
