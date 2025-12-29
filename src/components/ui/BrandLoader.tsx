import React from 'react';
import Image from 'next/image';

interface BrandLoaderProps {
    size?: number;
    className?: string;
    text?: string;
    variant?: 'full' | 'inline';
}

const BrandLoader: React.FC<BrandLoaderProps> = ({ size = 64, className = "", text, variant = 'full' }) => {
    const isInline = variant === 'inline';
    const actualSize = isInline ? 20 : size;

    return (
        <div className={`flex ${isInline ? 'flex-row' : 'flex-col'} items-center justify-center gap-4 ${className}`}>
            <div className="relative flex items-center justify-center">
                {/* Outer Glow - Only for non-inline */}
                {!isInline && (
                    <div
                        className="absolute bg-cyber-citron/20 blur-2xl rounded-full animate-medical-pulse"
                        style={{ width: actualSize * 1.5, height: actualSize * 1.5 }}
                    />
                )}

                {/* Animated Favicon */}
                <div className="relative animate-medical-pulse flex items-center justify-center">
                    <Image
                        src="/favicon.svg"
                        alt="Loading..."
                        width={actualSize}
                        height={actualSize}
                        className={!isInline ? "drop-shadow-[0_0_8px_rgba(234,179,8,0.5)]" : ""}
                    />
                </div>
            </div>

            {text && (
                <p className={`${isInline ? 'text-xs' : 'text-slate-400 font-medium tracking-wide'} animate-pulse`}>
                    {text}
                </p>
            )}
        </div>
    );
};

export default BrandLoader;
