'use client';

import React from 'react';
import { CheckCircleIcon } from '@heroicons/react/24/solid';

interface Step {
    id: string;
    label: string;
    icon: React.ElementType;
}

interface VerticalTimelineProps {
    steps: Step[];
    currentStepIndex: number;
    t: (key: string) => string;
}

const VerticalTimeline: React.FC<VerticalTimelineProps> = ({ steps, currentStepIndex, t }) => {
    return (
        <div className="relative">
            {/* Vertical Line */}
            <div className="absolute left-6 top-8 bottom-0 w-0.5 bg-gray-200 dark:bg-gray-700" />

            <div className="space-y-8 relative">
                {steps.map((step, index) => {
                    const isCompleted = index <= currentStepIndex;
                    const isCurrent = index === currentStepIndex;

                    return (
                        <div key={step.id} className={`flex items-start gap-4 relative Group fade-in-up delay-${index * 100} ${isCompleted ? 'opacity-100' : 'opacity-50 grayscale'}`}>
                            {/* Icon Circle */}
                            <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 z-10 border-4 transition-all duration-300 ${isCompleted
                                ? 'bg-bel-blue border-white dark:border-slate-900 text-white shadow-md'
                                : 'bg-white dark:bg-slate-800 border-gray-200 dark:border-gray-700 text-gray-400'
                                }`}>
                                {index < currentStepIndex ? (
                                    <CheckCircleIcon className="w-6 h-6" />
                                ) : (
                                    <step.icon className="w-5 h-5" />
                                )}
                            </div>

                            {/* Text Content */}
                            <div className="pt-2">
                                <h3 className={`font-bold text-sm md:text-base ${isCurrent ? 'text-bel-blue' : 'text-gray-900 dark:text-white'}`}>
                                    {step.label}
                                </h3>
                                {isCurrent && (
                                    <span className="inline-block mt-1 px-2 py-0.5 rounded text-[10px] font-bold bg-bel-blue/10 text-bel-blue uppercase tracking-wider">
                                        {t('Current Status')}
                                    </span>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default VerticalTimeline;
