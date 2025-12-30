'use client';

import React, { useEffect } from 'react';

export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        // Log the error to an error reporting service
        console.error('Global Error Boundary caught:', error);
    }, [error]);

    return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] px-4 text-center space-y-6">
            <div className="p-6 rounded-3xl bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/30 shadow-sm max-w-md">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                    Something went wrong!
                </h2>
                <p className="text-gray-600 dark:text-gray-300 mb-6 text-sm">
                    We apologize for the inconvenience. An unexpected error occurred while loading this page.
                </p>
                <div className="flex gap-4 justify-center">
                    <button
                        onClick={
                            // Attempt to recover by trying to re-render the segment
                            () => reset()
                        }
                        className="px-6 py-2.5 rounded-full bg-electric-indigo text-white font-bold text-sm shadow-lg shadow-indigo-500/30 hover:shadow-indigo-500/50 hover:scale-105 transition-all"
                    >
                        Try again
                    </button>
                    <a
                        href="/"
                        className="px-6 py-2.5 rounded-full bg-white dark:bg-slate-800 text-slate-700 dark:text-gray-200 font-bold text-sm border border-gray-200 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-700 transition-all"
                    >
                        Go Home
                    </a>
                </div>
                {process.env.NODE_ENV === 'development' && (
                    <div className="mt-8 text-left text-xs bg-black/5 p-4 rounded-xl overflow-auto border border-black/5 dark:bg-black/50 mx-auto w-full max-h-48">
                        <p className="font-mono text-red-600 dark:text-red-400 font-bold mb-1">{error.message}</p>
                        <pre className="font-mono text-gray-500">{error.digest}</pre>
                    </div>
                )}
            </div>
        </div>
    );
}
