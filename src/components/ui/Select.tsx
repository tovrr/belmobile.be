'use client';

import React, { forwardRef } from 'react';
import { ChevronDownIcon } from '@heroicons/react/24/outline';

interface SelectOption {
    value: string;
    label: string;
}

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
    label?: string;
    error?: string;
    description?: string;
    containerClassName?: string;
    options?: SelectOption[];
}

const Select = forwardRef<HTMLSelectElement, SelectProps>(
    ({ label, error, description, className, containerClassName, options, children, ...props }, ref) => {
        return (
            <div className={`space-y-2 ${containerClassName || ''}`}>
                {label && (
                    <label htmlFor={props.id || props.name} className="block text-sm font-bold text-gray-700 dark:text-gray-300 ml-1">
                        {label}
                    </label>
                )}
                <div className="relative">
                    <select
                        ref={ref}
                        className={`
                            w-full px-4 py-3 pr-10
                            bg-gray-50 dark:bg-surface-dark/50 
                            border rounded-xl 
                            focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent 
                            transition-all appearance-none
                            dark:text-white placeholder-gray-400
                            ${error
                                ? 'border-red-500 focus:ring-red-500'
                                : 'border-gray-200 dark:border-white/10'
                            }
                            ${className || ''}
                        `}
                        {...props}
                    >
                        {options ? (
                            options.map((opt) => (
                                <option key={opt.value} value={opt.value}>
                                    {opt.label}
                                </option>
                            ))
                        ) : children}
                    </select>
                    <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-gray-500 dark:text-gray-400">
                        <ChevronDownIcon className="h-5 w-5" />
                    </div>
                </div>
                {description && !error && (
                    <p className="text-sm text-gray-500 dark:text-gray-400 ml-1">{description}</p>
                )}
                {error && (
                    <p className="text-sm text-red-500 ml-1 font-medium">{error}</p>
                )}
            </div>
        );
    }
);

Select.displayName = 'Select';

export default Select;
