'use client';

import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { CheckCircleIcon, XCircleIcon, InformationCircleIcon } from '@heroicons/react/24/solid';

/**
 * TOAST TYPES & INTERFACES
 */
export type ToastType = 'success' | 'error' | 'info';

export interface ToastMessage {
    id: string;
    type: ToastType;
    title: string;
    message?: string;
    duration?: number;
}

interface ToastContextType {
    showToast: (type: ToastType, title: string, message?: string, duration?: number) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

/**
 * TOAST HOOK
 */
export const useToast = () => {
    const context = useContext(ToastContext);
    if (!context) {
        throw new Error('useToast must be used within a ToastProvider');
    }
    return context;
};

/**
 * TOAST COMPONENT (Individual)
 */
const ToastItem: React.FC<{ toast: ToastMessage; onRemove: (id: string) => void }> = ({ toast, onRemove }) => {
    useEffect(() => {
        const timer = setTimeout(() => {
            onRemove(toast.id);
        }, toast.duration || 4000);

        return () => clearTimeout(timer);
    }, [toast, onRemove]);

    return (
        <motion.div
            layout
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
            className="pointer-events-auto w-full max-w-sm overflow-hidden rounded-lg bg-white dark:bg-slate-800 shadow-xl border border-gray-100 dark:border-slate-700 ring-1 ring-black/5"
        >
            <div className="p-4">
                <div className="flex items-start">
                    <div className="shrink-0">
                        {toast.type === 'success' && <CheckCircleIcon className="h-6 w-6 text-green-400" aria-hidden="true" />}
                        {toast.type === 'error' && <XCircleIcon className="h-6 w-6 text-red-400" aria-hidden="true" />}
                        {toast.type === 'info' && <InformationCircleIcon className="h-6 w-6 text-blue-400" aria-hidden="true" />}
                    </div>
                    <div className="ml-3 w-0 flex-1 pt-0.5">
                        <p className="text-sm font-bold text-gray-900 dark:text-white">{toast.title}</p>
                        {toast.message && (
                            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{toast.message}</p>
                        )}
                    </div>
                    <div className="ml-4 flex shrink-0">
                        <button
                            type="button"
                            className="inline-flex rounded-md bg-white dark:bg-slate-800 text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                            onClick={() => onRemove(toast.id)}
                        >
                            <span className="sr-only">Close</span>
                            <XCircleIcon className="h-5 w-5" aria-hidden="true" />
                        </button>
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

/**
 * TOAST PROVIDER & CONTAINER
 */
export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [toasts, setToasts] = useState<ToastMessage[]>([]);

    const showToast = useCallback((type: ToastType, title: string, message?: string, duration = 4000) => {
        const id = Math.random().toString(36).substring(2, 9);
        setToasts((prev) => [...prev, { id, type, title, message, duration }]);
    }, []);

    const removeToast = useCallback((id: string) => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
    }, []);

    return (
        <ToastContext.Provider value={{ showToast }}>
            {children}
            {/* Toast Container - Fixed Position */}
            <div aria-live="assertive" className="pointer-events-none fixed inset-0 z-100 flex flex-col items-center justify-end gap-2 px-4 py-6 sm:items-end sm:p-6">
                <AnimatePresence mode="popLayout">
                    {toasts.map((toast) => (
                        <ToastItem key={toast.id} toast={toast} onRemove={removeToast} />
                    ))}
                </AnimatePresence>
            </div>
        </ToastContext.Provider>
    );
};
