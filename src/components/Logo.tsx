import React from 'react';

interface LogoProps {
    className?: string;
    variant?: 'light' | 'dark' | 'glass' | 'color';
}

export default function Logo({ className = "w-10 h-10", variant }: LogoProps) {
    return (
        <div className={`flex items-center gap-3 ${className}`}>
            <svg
                id="belmobile-logo"
                viewBox="0 0 100 100"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="w-full h-full"
                role="img"
                aria-labelledby="logo-title logo-desc"
            >
                <title id="logo-title">Belmobile Logo</title>
                <desc id="logo-desc">Belmobile - Smartphone Repair & Buyback Specialist</desc>
                {/* 
                   Concept: 'b' letter + Phone chassis + Doctor Cross
                   Style: Minimalist, thick rounded strokes, flat 2D
                */}

                {/* The 'b' / Phone Body 
                    - A rounded rectangle shape that looks like a lowercase 'b'
                    - Left side is straight (spine of b)
                    - Bottom creates the loop
                    - Top right is open to make room for the cross
                */}


                {/* Let's try a cleaner continuous path for the 'b' phone */}
                {/* Let's try a cleaner continuous path for the 'b' phone */}
                <path
                    d="M60 10 H 40 C 25 10 20 25 20 40 V 70 C 20 85 30 90 45 90 H 65 C 80 90 85 80 85 65 V 55"
                    stroke="currentColor"
                    strokeWidth="10"
                    strokeLinecap="round"
                    className="transition-colors duration-300"
                />

                {/* Home Button Dot */}
                <circle cx="52" cy="78" r="4" fill="currentColor" className="transition-colors duration-300" />

                {/* The Red Cross (Doctor Symbol) - Positioned Top Right, completing the 'b' negative space */}
                <path
                    d="M75 15 V 45 M 60 30 H 90"
                    stroke="#DC2626" // red-600
                    strokeWidth="10"
                    strokeLinecap="round"
                />
            </svg>

        </div>
    );
}
