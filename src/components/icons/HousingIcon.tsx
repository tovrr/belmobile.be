import React from 'react';

const HousingIcon = ({ className = "w-6 h-6" }: { className?: string }) => {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
            {/* Phone Body (Clean Rounded Rect) */}
            <rect x="5" y="2" width="14" height="20" rx="2.5" strokeLinecap="round" strokeLinejoin="round" />

            {/* Camera Module (Top Left) - Identifies it as Back */}
            <rect x="6.5" y="3.5" width="5" height="5" rx="1" strokeLinecap="round" strokeLinejoin="round" fill="currentColor" fillOpacity="0.1" />
            <circle cx="8" cy="5" r="0.5" fill="currentColor" />
            <circle cx="10" cy="5" r="0.5" fill="currentColor" />
            <circle cx="9" cy="7" r="0.5" fill="currentColor" />

            {/* Side Buttons (Volume/Power) - Emphasizes 'Housing' aspect */}
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 6v3" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 6v2" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 10v2" />

            {/* Wireless Charging Coil / Center Circle (Marketing subtle hint) */}
            <circle cx="12" cy="12" r="3" strokeWidth={0.5} strokeDasharray="2 2" opacity="0.5" />
        </svg>
    );
};

export default HousingIcon;
