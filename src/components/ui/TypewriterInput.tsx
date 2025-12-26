'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';

interface TypewriterInputProps {
    phrases: string[];
    speed?: number; // Typing speed in chars/ms
    pauseDuration?: number; // Pause at the end of a phrase in ms
    className?: string;
}

const TypewriterInput: React.FC<TypewriterInputProps> = ({
    phrases,
    speed = 100,
    pauseDuration = 2000,
    className = ""
}) => {
    const [displayText, setDisplayText] = useState('');
    const phraseIndexRef = useRef(0);
    const charIndexRef = useRef(0);
    const isDeletingRef = useRef(false);
    const lastTimestampRef = useRef(0);
    const pauseTimeoutRef = useRef<number | null>(null);

    const animate = useCallback((timestamp: number) => {
        if (!lastTimestampRef.current) lastTimestampRef.current = timestamp;

        const elapsed = timestamp - lastTimestampRef.current;
        const currentSpeed = isDeletingRef.current ? speed / 2 : speed;

        if (elapsed > currentSpeed) {
            lastTimestampRef.current = timestamp;
            const currentPhrase = phrases[phraseIndexRef.current];

            if (!isDeletingRef.current) {
                // Typing
                if (charIndexRef.current < currentPhrase.length) {
                    charIndexRef.current += 1;
                    setDisplayText(currentPhrase.substring(0, charIndexRef.current));
                } else {
                    // Finished typing phrase, pause
                    if (pauseTimeoutRef.current === null) {
                        pauseTimeoutRef.current = window.setTimeout(() => {
                            isDeletingRef.current = true;
                            pauseTimeoutRef.current = null;
                            requestAnimationFrame(animate);
                        }, pauseDuration);
                        return; // Stop animation loop during pause
                    }
                }
            } else {
                // Deleting
                if (charIndexRef.current > 0) {
                    charIndexRef.current -= 1;
                    setDisplayText(currentPhrase.substring(0, charIndexRef.current));
                } else {
                    // Finished deleting, move to next phrase
                    isDeletingRef.current = false;
                    phraseIndexRef.current = (phraseIndexRef.current + 1) % phrases.length;
                }
            }
        }
        requestAnimationFrame(animate);
    }, [phrases, speed, pauseDuration]);

    useEffect(() => {
        const frameId = requestAnimationFrame(animate);
        return () => {
            cancelAnimationFrame(frameId);
            if (pauseTimeoutRef.current) clearTimeout(pauseTimeoutRef.current);
        };
    }, [animate]);

    return (
        <span className={`${className} inline-flex items-center`}>
            {displayText}
            <span className="w-[2px] h-[1em] bg-current ml-1 animate-pulse" />
        </span>
    );
};

export default TypewriterInput;
