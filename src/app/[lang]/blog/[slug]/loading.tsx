import React from 'react';

export default function Loading() {
    return (
        <div className="max-w-4xl mx-auto px-4 py-20 animate-pulse">
            <div className="h-4 w-24 bg-gray-200 dark:bg-slate-800 rounded-lg mb-8" />
            <div className="h-12 w-3/4 bg-gray-200 dark:bg-slate-800 rounded-2xl mb-6" />
            <div className="h-6 w-1/2 bg-gray-200 dark:bg-slate-800 rounded-lg mb-12" />
            <div className="aspect-video w-full bg-gray-200 dark:bg-slate-800 rounded-[2.5rem] mb-12" />
            <div className="space-y-4">
                <div className="h-4 w-full bg-gray-200 dark:bg-slate-800 rounded-lg" />
                <div className="h-4 w-full bg-gray-200 dark:bg-slate-800 rounded-lg" />
                <div className="h-4 w-2/3 bg-gray-200 dark:bg-slate-800 rounded-lg" />
            </div>
        </div>
    );
}
