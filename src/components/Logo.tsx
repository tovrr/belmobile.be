import React from 'react';
import { useLanguage } from '../hooks/useLanguage';

interface LogoProps {
    variant?: 'light' | 'dark' | 'glass';
    className?: string;
}

const Logo: React.FC<LogoProps> = ({ variant = 'dark', className = '' }) => {
    // Colors
    const textColor = variant === 'light' ? 'text-white' : 'text-slate-900 dark:text-white';
    const subtextColor = variant === 'light' ? 'text-slate-400' : 'text-slate-500 dark:text-slate-400';
    const accentColor = 'text-cyber-citron'; // Yellow

    return (
        <div className={`flex items-center gap-3 select-none ${className}`} aria-label="Belmobile Logo" role="img">
            {/* Icon: Smartphone + AI Sparkles */}
            <div className="relative w-10 h-10 shrink-0">
                {/* Smartphone Silhouette - Thinner Borders & Modern Look */}
                <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    className={`w-full h-full drop-shadow-sm ${accentColor}`}
                    xmlns="http://www.w3.org/2000/svg"
                >
                    {/* Modern Bezel-less Outline */}
                    <rect
                        x="6.5"
                        y="3"
                        width="11"
                        height="19"
                        rx="2"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                    />
                    {/* Dynamic Island indication */}
                    <path
                        d="M10.5 4.5h3"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                    />
                </svg>

                {/* AI Sparkles (Stars) - Overlaying the phone */}
                <div className="absolute -top-1.5 -right-1.5 animate-pulse-slow">
                    <svg viewBox="0 0 24 24" fill="currentColor" className={`w-4 h-4 ${accentColor}`}>
                        <path d="M12 2L14.39 8.26L21 10.5L14.39 12.74L12 19L9.61 12.74L3 10.5L9.61 8.26L12 2Z" />
                    </svg>
                </div>
                <div className="absolute top-8 -left-1 animate-pulse-slow" style={{ animationDelay: '0.4s' }}>
                    <svg viewBox="0 0 24 24" fill="currentColor" className={`w-2.5 h-2.5 ${accentColor}`}>
                        <path d="M12 2L14.39 8.26L21 10.5L14.39 12.74L12 19L9.61 12.74L3 10.5L9.61 8.26L12 2Z" />
                    </svg>
                </div>
            </div>

            {/* Typography */}
            <div className="flex flex-col leading-none">
                <div className={`text-2xl font-black tracking-tight ${textColor} flex items-center`}>
                    BELMOBILE<span className={accentColor}>.BE</span>
                </div>
                {/* Subtext - hidden on very small screens if needed, but keeping for logo integrity */}
                <div className={`text-[0.6rem] font-bold tracking-[0.3em] uppercase mt-0.5 ${subtextColor}`}>
                    BUYBACK & REPAIR
                </div>
            </div>
        </div>
    );
};

export default Logo;
