'use client';

import React from 'react';
import * as Sentry from '@sentry/nextjs';

export default function MonitoringPage() {
    return (
        <div className="min-h-screen pt-32 px-4 max-w-2xl mx-auto">
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-8 shadow-sm border border-gray-100 dark:border-slate-800">
                <div className="flex items-center justify-between mb-8">
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                        System Monitoring
                    </h1>
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
                        <span className="w-2 h-2 rounded-full bg-green-500 mr-2 animate-pulse"></span>
                        Operational
                    </span>
                </div>

                <div className="space-y-6">
                    <div className="prose dark:prose-invert">
                        <p className="text-gray-600 dark:text-gray-300">
                            This page is used to verify the connection between the application and Sentry.io.
                            Clicking the button below will intentionally throw an error.
                        </p>
                    </div>

                    <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-900/50 rounded-lg">
                        <h3 className="text-sm font-semibold text-yellow-800 dark:text-yellow-200 mb-2">
                            Verification Steps
                        </h3>
                        <ol className="list-decimal list-inside text-sm text-yellow-700 dark:text-yellow-300 space-y-1">
                            <li>Open your Sentry Dashboard</li>
                            <li>Click the button below</li>
                            <li>Wait 1-2 minutes</li>
                            <li>Verify the error "Sentry Verification Error" appears in Issues</li>
                        </ol>
                    </div>

                    <div className="grid sm:grid-cols-2 gap-4">
                        <button
                            onClick={() => {
                                try {
                                    throw new Error("Sentry Soft Test: UI did not crash!");
                                } catch (e) {
                                    Sentry.captureException(e);
                                    alert("Soft Error sent to Sentry! Check your dashboard.");
                                }
                            }}
                            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold transition-colors flex items-center justify-center gap-2"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                            </svg>
                            Trigger Soft Error
                        </button>

                        <button
                            onClick={() => {
                                throw new Error("Sentry Hard Crash: Manual Trigger from /monitoring");
                            }}
                            className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl font-semibold transition-colors flex items-center justify-center gap-2"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                            </svg>
                            Trigger Hard Crash
                        </button>
                    </div>
                    <p className="text-xs text-gray-400 text-center">
                        Note: "Hard Crash" will show a red Next.js error screen in development. <br />
                        This is normal! Refresh the page to return.
                    </p>
                </div>
            </div>
        </div>
    );
}
