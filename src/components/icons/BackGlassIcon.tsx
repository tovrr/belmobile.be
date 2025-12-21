import React from 'react';

const BackGlassIcon = ({ className = "w-6 h-6" }: { className?: string }) => {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
            {/* Phone Body (Clean Rounded Rect - No Notch) */}
            <rect x="5" y="2" width="14" height="20" rx="2.5" strokeLinecap="round" strokeLinejoin="round" />

            {/* Camera Module (Top Left) */}
            <rect x="6.5" y="3.5" width="5" height="5" rx="1" strokeLinecap="round" strokeLinejoin="round" fill="currentColor" fillOpacity="0.1" />
            <circle cx="8" cy="5" r="0.5" fill="currentColor" />
            <circle cx="10" cy="5" r="0.5" fill="currentColor" />
            <circle cx="9" cy="7" r="0.5" fill="currentColor" />

            {/* Shatter / Crack Effect (Radiating) */}
            <path strokeLinecap="round" strokeLinejoin="round" d="M14 16l-3-3m0 0l-2 2m2-2l-1-2" opacity="0.6" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 18l1 2" opacity="0.6" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 14l-2 1" opacity="0.6" />
        </svg>
    );
};

export default BackGlassIcon;
