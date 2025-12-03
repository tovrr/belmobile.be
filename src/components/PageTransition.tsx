'use client';
import React, { ReactNode } from 'react';
import { motion } from 'framer-motion';

interface PageTransitionProps {
    children: ReactNode;
    className?: string;
}

const PageTransition: React.FC<PageTransitionProps> = ({ children, className = "" }) => {
    return (
        <motion.div
            initial={{ opacity: 0, filter: 'blur(5px)' }}
            animate={{ opacity: 1, filter: 'blur(0px)' }}
            exit={{ opacity: 0, filter: 'blur(5px)' }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className={`w-full ${className}`}
        >
            {children}
        </motion.div>
    );
};

export default PageTransition;

