'use client';

import React, { forwardRef } from 'react';

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
    label?: string;
    error?: string;
    description?: string;
    containerClassName?: string;
}

const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
    ({ label, error, description, className, containerClassName, ...props }, ref) => {
        return (
            <div className={`space-y-2 ${containerClassName || ''}`}>
                {label && (
                    <label htmlFor={props.id || props.name} className="block text-sm font-bold text-gray-700 dark:text-gray-300 ml-1">
                        {label}
                    </label>
                )}
                <textarea
                    ref={ref}
                    className={`
                        w-full px-4 py-3 
                        bg-gray-50 dark:bg-surface-dark/50 
                        border rounded-xl 
                        focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent 
                        transition-all 
                        dark:text-white placeholder-gray-400
                        resize-none
                        ${error
                            ? 'border-red-500 focus:ring-red-500'
                            : 'border-gray-200 dark:border-white/10'
                        }
                        ${className || ''}
                    `}
                    {...props}
                />
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

Textarea.displayName = 'Textarea';

export default Textarea;
