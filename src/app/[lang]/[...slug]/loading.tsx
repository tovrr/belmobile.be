import React from 'react';

export default function Loading() {
    return (
        <div className="min-h-screen bg-gray-50 dark:bg-slate-950">
            {/* Header Spacer (approx) */}
            <div className="h-16 w-full" />

            <div className="container mx-auto px-4 py-8">
                {/* Wizard Skeleton */}
                <div className="w-full max-w-4xl mx-auto space-y-8">
                    {/* Progress Bar Skeleton */}
                    <div className="w-full h-16 bg-white dark:bg-slate-900 rounded-2xl animate-pulse shadow-sm" />

                    {/* Main Wizard Card */}
                    <div className="w-full h-[600px] bg-white dark:bg-slate-900 rounded-3xl animate-pulse shadow-xl border border-gray-100 dark:border-white/5" />
                </div>

                {/* Bottom Content Skeleton (Pain Points & SEO) */}
                <div className="mt-12 space-y-12">
                    <div className="w-full h-80 bg-gray-200 dark:bg-slate-900/50 rounded-3xl animate-pulse" />
                    <div className="w-full h-96 bg-gray-200 dark:bg-slate-900/50 rounded-3xl animate-pulse" />
                </div>
            </div>
        </div>
    );
}
