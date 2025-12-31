'use client';

import React, { useState, useEffect } from 'react';
import { ClockIcon } from '@heroicons/react/24/outline';
import { useLanguage } from '../../hooks/useLanguage';

interface PriceLockTimerProps {
    durationMinutes?: number;
    className?: string;
}

export const PriceLockTimer: React.FC<PriceLockTimerProps> = ({
    durationMinutes = 15, // Default 15 minutes of "Price Lock Validity"
    className = ""
}) => {
    const { t } = useLanguage();

    // Initialize timer state
    // In a production app, this should ideally be stored in context/localstorage to persist refreshes.
    // For this implementation, we reset on mount to give the user the "full time" feeling whenever they engage.
    const [timeLeft, setTimeLeft] = useState(durationMinutes * 60);

    useEffect(() => {
        if (!timeLeft) return;

        const intervalId = setInterval(() => {
            setTimeLeft(prev => Math.max(0, prev - 1));
        }, 1000);

        return () => clearInterval(intervalId);
    }, [timeLeft]);

    // Format time logic
    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;
    const isUrgent = minutes < 3; // Urgent red color if less than 3 mins
    const isExpired = timeLeft === 0;

    return (
        <div className={`flex items-center gap-1.5 text-xs font-bold transition-colors duration-300 ${isUrgent ? 'text-red-600 dark:text-red-400 animate-pulse' : 'text-gray-500 dark:text-gray-400'} ${className}`}>
            <ClockIcon className={`w-3.5 h-3.5 ${isUrgent ? 'animate-bounce' : ''}`} />

            {isExpired ? (
                <span>{t('offer_expired')}</span>
            ) : (
                <div className="flex gap-1">
                    <span>{t('price_valid_for')}</span>
                    <span className="tabular-nums font-mono text-sm leading-none pt-0.5">
                        {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
                    </span>
                </div>
            )}
        </div>
    );
};
