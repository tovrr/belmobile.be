'use client';

import { motion } from 'framer-motion';

interface SkeletonProps {
    className?: string;
    variant?: 'text' | 'rect' | 'circle';
}

const Skeleton: React.FC<SkeletonProps> = ({ className = '', variant = 'rect' }) => {
    const variants = {
        text: 'h-4 w-full rounded-md',
        rect: 'h-full w-full rounded-2xl',
        circle: 'h-10 w-10 rounded-full'
    };

    return (
        <motion.div
            animate={{
                opacity: [0.4, 0.7, 0.4],
            }}
            transition={{
                duration: 1.5,
                repeat: Infinity,
                ease: "easeInOut"
            }}
            className={`bg-gray-200 dark:bg-slate-800 ${variants[variant]} ${className}`}
        />
    );
};

export default Skeleton;
