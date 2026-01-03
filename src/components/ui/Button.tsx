'use client';

import React, { forwardRef } from 'react';

import BrandLoader from './BrandLoader';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'cyber' | 'action';
    isLoading?: boolean;
    icon?: React.ReactNode;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
    ({ className, variant = 'primary', isLoading, icon, children, disabled, ...props }, ref) => {

        const baseStyles = "font-black py-3 px-6 rounded-ui transition-all duration-300 flex items-center justify-center gap-2 group active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed uppercase tracking-wide text-sm";

        const variants = {
            primary: "bg-primary text-white hover:bg-primary/90 hover:shadow-lg hover:shadow-primary/25 hover:-translate-y-0.5",
            secondary: "bg-surface-light dark:bg-surface-dark text-gray-900 dark:text-white border border-gray-200 dark:border-white/10 hover:bg-gray-50 dark:hover:bg-white/5 hover:shadow-md",
            outline: "bg-transparent border-ui border-primary text-primary hover:bg-primary/10",
            ghost: "bg-transparent text-primary hover:bg-primary/10",
            danger: "bg-red-500 text-white hover:bg-red-600 hover:shadow-lg hover:shadow-red-500/25",
            cyber: "bg-cyber-citron text-midnight fill-midnight hover:bg-cyber-citron/90 hover:shadow-lg hover:shadow-cyber-citron/30 hover:-translate-y-0.5",
            action: "bg-bel-blue text-white fill-white hover:bg-bel-blue/90 hover:shadow-lg hover:shadow-bel-blue/30 hover:-translate-y-0.5"
        };

        return (
            <button
                ref={ref}
                className={`${baseStyles} ${variants[variant]} ${className || ''}`}
                disabled={disabled || isLoading}
                {...props}
            >
                {isLoading ? (
                    <BrandLoader variant="inline" />
                ) : icon ? (
                    <span className="shrink-0 transition-transform group-hover:scale-110">{icon}</span>
                ) : null}
                {children}
            </button>
        );
    }
);

Button.displayName = 'Button';

export default Button;
