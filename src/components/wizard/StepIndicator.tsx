'use client';

import React from 'react';
import { CheckCircleIcon } from '@heroicons/react/24/outline';

interface StepIndicatorProps {
    type: 'buyback' | 'repair';
    step: number;
    t: (key: string) => string;
}

const StepIndicator: React.FC<StepIndicatorProps> = ({ type, step, t }) => {
    // Dynamic labels based on type
    const getLabel = (id: number) => {
        if (id === 1) return t('Device');
        if (id === 2) return t('Model');
        if (id === 3) return type === 'buyback' ? t('Specs') : t('Diagnostics');
        if (id === 4) return type === 'buyback' ? t('Condition') : t('Details');
        if (id === 5) return t('Summary');
        return '';
    };

    const currentSteps = type === 'buyback' ? [1, 2, 3, 4, 5] : [1, 2, 3, 4];
    const currentStepIndex = currentSteps.indexOf(step);
    // Fallback for transition states where step might not be in array (unlikely but safe)
    const safeIndex = currentStepIndex === -1 ? 0 : currentStepIndex;

    return (
        <div className="flex flex-col w-full max-w-3xl mx-auto mb-8">
            <div className="flex justify-between items-center relative z-10">
                {currentSteps.map((s, index) => {
                    // Check completion based on index, not just raw step value, 
                    // to handle the 4-step sequence correctly.
                    const isCompleted = safeIndex > index;
                    const isCurrent = safeIndex === index;

                    return (
                        <div key={s} className="flex flex-col items-center">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm transition-all duration-300 border-2 ${isCurrent ? 'bg-bel-blue border-bel-blue text-white scale-110 shadow-lg shadow-blue-500/30' :
                                isCompleted ? 'bg-bel-blue border-bel-blue text-white' :
                                    'bg-white dark:bg-slate-900 border-gray-200 dark:border-slate-700 text-gray-400'
                                }`}>
                                {isCompleted ? <CheckCircleIcon className="w-5 h-5" /> : (index + 1)}
                            </div>
                            <span className={`mt-2 text-xs font-medium transition-colors duration-300 ${isCurrent ? 'text-bel-blue' : isCompleted ? 'text-bel-blue' : 'text-gray-400'
                                }`}>
                                {getLabel(s)}
                            </span>
                        </div>
                    );
                })}
                {/* Connecting Lines */}
                <div className="absolute top-4 left-0 w-full h-0.5 bg-gray-100 dark:bg-slate-800 -z-10" />
                <div
                    className="absolute top-4 left-0 h-0.5 bg-bel-blue transition-all duration-500 -z-10"
                    style={{ width: `${(safeIndex / (currentSteps.length - 1)) * 100}%` }}
                />
            </div>
        </div>
    );
};

export default StepIndicator;
