'use client';

import React from 'react';
import { motion } from 'framer-motion';

interface StepWrapperProps {
    children: React.ReactNode;
    stepKey: number | string;
}

const StepWrapper = React.forwardRef<HTMLDivElement, StepWrapperProps>(({ children, stepKey }, ref) => {
    // Critical LCP Fix: Don't animate opacity for the first step on mount.
    // This allows SSR content to be visible immediately.
    const isFirstStep = stepKey === 1 || stepKey === 'step1';

    return (
        <motion.div
            ref={ref}
            key={stepKey}
            initial={isFirstStep ? { opacity: 1, x: 0 } : { opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className="w-full"
        >
            {children}
        </motion.div>
    );
});

StepWrapper.displayName = 'StepWrapper';

export default StepWrapper;
