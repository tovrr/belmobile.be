import React from 'react';

export default function Loading() {
    return (
        <div className="max-w-7xl mx-auto px-4 py-12 animate-pulse">
            <div className="flex items-center gap-2 mb-8">
                <div className="h-4 w-12 bg-gray-200 dark:bg-slate-800 rounded-md" />
                <div className="h-4 w-4 bg-gray-200 dark:bg-slate-800 rounded-full" />
                <div className="h-4 w-24 bg-gray-200 dark:bg-slate-800 rounded-md" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                <div className="aspect-square w-full bg-gray-200 dark:bg-slate-800 rounded-[2.5rem]" />
                <div className="space-y-6">
                    <div className="h-4 w-24 bg-gray-200 dark:bg-slate-800 rounded-md" />
                    <div className="h-10 w-3/4 bg-gray-200 dark:bg-slate-800 rounded-xl" />
                    <div className="h-8 w-1/4 bg-gray-200 dark:bg-slate-800 rounded-lg" />
                    <div className="h-32 w-full bg-gray-200 dark:bg-slate-800 rounded-2xl" />
                    <div className="h-14 w-full bg-gray-200 dark:bg-slate-800 rounded-2xl" />
                </div>
            </div>
        </div>
    );
}
