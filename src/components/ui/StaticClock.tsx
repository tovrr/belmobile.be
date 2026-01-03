'use client';
import React, { useState, useEffect } from 'react';

const StaticClock: React.FC = () => {
    const [currentTime, setCurrentTime] = useState('');

    useEffect(() => {
        const update = () => {
            const now = new Date();
            setCurrentTime(now.toLocaleTimeString(navigator.language, { hour: '2-digit', minute: '2-digit' }));
        };
        update();
        const timer = setInterval(update, 1000);
        return () => clearInterval(timer);
    }, []);

    if (!currentTime) return null;

    return <>{currentTime}</>;
};

export default StaticClock;
