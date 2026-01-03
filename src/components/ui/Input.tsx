'use client';

import React, { forwardRef } from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    error?: string;
    description?: string;
    containerClassName?: string;
    leftIcon?: React.ReactNode;
    rightIcon?: React.ReactNode;
    rightElement?: React.ReactNode;
    variant?: 'default' | 'buyback';
}

const Input = forwardRef<HTMLInputElement, InputProps>(
    ({ label, error, description, className, containerClassName, leftIcon, rightIcon, rightElement, variant = 'default', ...props }, ref) => {
        const focusRingClass = variant === 'buyback'
            ? 'focus:ring-bel-yellow focus:border-bel-yellow caret-bel-yellow'
            : 'focus:ring-primary focus:border-transparent';

        return (
            <div className={`space-y-2 ${containerClassName || ''}`}>
                {label && (
                    <label htmlFor={props.id || props.name} className="block text-sm font-bold text-gray-700 dark:text-gray-300 ml-1">
                        {label}
                    </label>
                )}
                <div className="relative">
                    {leftIcon && (
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                            {leftIcon}
                        </div>
                    )}
                    <input
                        ref={ref}
                        id={props.id || props.name}
                        className={`
                        w-full py-3 
                        ${leftIcon ? 'pl-10' : 'px-4'}
                        ${rightIcon || rightElement ? 'pr-12' : 'px-4'}
                        bg-white dark:bg-slate-900/50 
                        border rounded-xl 
                        focus:outline-none focus:ring-2 ${focusRingClass}
                        transition-all 
                        text-gray-900 dark:text-white placeholder-gray-400
                        ${error
                                ? 'border-red-500 focus:ring-red-500'
                                : variant === 'buyback' ? 'border-gray-200 dark:border-white/10 focus:border-bel-yellow' : 'border-gray-200 dark:border-white/10'
                            }
                        ${className || ''}
                    `}
                        {...props}
                    />
                    {(rightIcon || rightElement) && (
                        <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                            {rightElement || (rightIcon && <span className="text-gray-400 pointer-events-none">{rightIcon}</span>)}
                        </div>
                    )}
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

Input.displayName = 'Input';

export default Input;
