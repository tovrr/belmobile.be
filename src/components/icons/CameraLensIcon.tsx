import React from 'react';

const CameraLensIcon = ({ className = "w-6 h-6" }: { className?: string }) => {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
            {/* Outer Ring */}
            <circle cx="12" cy="12" r="8" strokeLinecap="round" strokeLinejoin="round" />
            <circle cx="12" cy="12" r="7" strokeLinecap="round" strokeLinejoin="round" opacity="0.5" />

            {/* Inner Lens Details (as per user image) */}
            <circle cx="10" cy="14" r="2.5" strokeLinecap="round" strokeLinejoin="round" />
            <circle cx="14" cy="11" r="1.2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
    );
};

export default CameraLensIcon;
