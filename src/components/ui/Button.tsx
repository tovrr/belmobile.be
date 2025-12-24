'use client';

import React, { forwardRef } from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
    isLoading?: boolean;
    icon?: React.ReactNode;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
    ({ className, variant = 'primary', isLoading, icon, children, disabled, ...props }, ref) => { // Removed size prop for simplicity as per requirements, defaulting to standard

        const baseStyles = "font-bold py-3 px-6 rounded-xl transition-all duration-200 flex items-center justify-center gap-2 group active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed";

        const variants = {
            primary: "bg-primary text-white hover:bg-primary-hover hover:shadow-lg hover:shadow-primary/25 hover:-translate-y-0.5",
            secondary: "bg-surface-light dark:bg-surface-dark text-gray-900 dark:text-white border border-gray-200 dark:border-white/10 hover:bg-gray-50 dark:hover:bg-white/5 hover:shadow-md",
            outline: "bg-transparent border-2 border-primary text-primary hover:bg-primary/10",
            ghost: "bg-transparent text-primary hover:bg-primary/10",
            danger: "bg-red-500 text-white hover:bg-red-600 hover:shadow-lg hover:shadow-red-500/25"
        };

        return (
            <button
                ref={ref}
                className={`${baseStyles} ${variants[variant]} ${className || ''}`}
                disabled={disabled || isLoading}
                {...props}
            >
                {isLoading ? (
                    <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                ) : icon ? (
                    <span className="shrink-0">{icon}</span>
                ) : null}
                {children}
            </button>
        );
    }
);

Button.displayName = 'Button';

export default Button;
