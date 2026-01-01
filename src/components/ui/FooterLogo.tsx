import React from 'react';

const FooterLogo = ({ className = "w-full h-full" }: { className?: string }) => {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 100 100"
            className={className}
            fill="none"
            role="img"
            aria-labelledby="footer-logo-title"
        >
            <title id="footer-logo-title">Belmobile Animated Logo</title>
            <defs>
                {/* Neon Glow Filter */}
                <filter id="footer-neon-glow" x="-50%" y="-50%" width="200%" height="200%">
                    <feGaussianBlur in="SourceGraphic" stdDeviation="1" result="blur1" />
                    <feGaussianBlur in="SourceGraphic" stdDeviation="3.5" result="blur2" />
                    <feMerge>
                        <feMergeNode in="blur2" />
                        <feMergeNode in="blur1" />
                        <feMergeNode in="SourceGraphic" />
                    </feMerge>
                </filter>
            </defs>
            <style>
                {`
                .footer-neon-pulse {
                    animation: footerNeonPulse 3s ease-in-out infinite;
                }
                
                @keyframes footerNeonPulse {
                    0%, 100% {
                        opacity: 1;
                        filter: url(#footer-neon-glow) drop-shadow(0 0 2px #dc2626);
                    }
                    50% {
                        opacity: 0.7;
                        filter: url(#footer-neon-glow) drop-shadow(0 0 6px #dc2626);
                    }
                }
                `}
            </style>

            {/* The 'b' / Phone Body (Same as original Logo) */}
            <path
                d="M60 10 H 40 C 25 10 20 25 20 40 V 70 C 20 85 30 90 45 90 H 65 C 80 90 85 80 85 65 V 55"
                stroke="#EAB308"
                strokeWidth="10"
                strokeLinecap="round"
                className="text-cyber-citron"
            />

            {/* Home Button Dot */}
            <circle cx="52" cy="78" r="4" fill="#EAB308" className="text-cyber-citron" />

            {/* The Red Cross (Animated) */}
            <g className="footer-neon-pulse">
                <path
                    d="M75 15 V 45 M 60 30 H 90"
                    stroke="#DC2626"
                    strokeWidth="10"
                    strokeLinecap="round"
                />
            </g>
        </svg>
    );
};

export default FooterLogo;
