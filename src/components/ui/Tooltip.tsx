'use client';
import React, { useState } from 'react';
import { InformationCircleIcon } from '@heroicons/react/24/outline';

interface TooltipProps {
    content: string;
    children?: React.ReactNode;
    position?: 'top' | 'bottom' | 'left' | 'right';
}

const Tooltip: React.FC<TooltipProps> = ({ content, children, position = 'top' }) => {
    const [isVisible, setIsVisible] = useState(false);

    const positionClasses = {
        top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
        bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
        left: 'right-full top-1/2 -translate-y-1/2 mr-2',
        right: 'left-full top-1/2 -translate-y-1/2 ml-2',
    };

    return (
        <div
            className="relative inline-flex items-center"
            onMouseEnter={() => setIsVisible(true)}
            onMouseLeave={() => setIsVisible(false)}
        >
            {children || <InformationCircleIcon className="h-5 w-5 text-slate-400 hover:text-bel-blue transition-colors cursor-help" />}

            {isVisible && (
                <div className={`absolute z-50 w-64 p-3 text-xs text-white bg-slate-800 rounded-lg shadow-xl ${positionClasses[position]} animate-fade-in`}>
                    {content}
                    {/* Arrow */}
                    <div className={`absolute w-2 h-2 bg-slate-800 transform rotate-45 
                        ${position === 'top' ? 'bottom-[-4px] left-1/2 -translate-x-1/2' : ''}
                        ${position === 'bottom' ? 'top-[-4px] left-1/2 -translate-x-1/2' : ''}
                        ${position === 'left' ? 'right-[-4px] top-1/2 -translate-y-1/2' : ''}
                        ${position === 'right' ? 'left-[-4px] top-1/2 -translate-y-1/2' : ''}
                    `}></div>
                </div>
            )}
        </div>
    );
};

export default Tooltip;

