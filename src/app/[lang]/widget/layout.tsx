import React from 'react';

export default function WidgetLayout({
    children
}: {
    children: React.ReactNode
}) {
    return (
        <div className="min-h-screen bg-linear-to-br from-blue-600 via-bel-blue to-indigo-900 flex items-start justify-center p-0 sm:p-6 lg:p-12">
            <div className="w-full max-w-5xl bg-white dark:bg-slate-940 shadow-xl rounded-none sm:rounded-4xl border-0 sm:border border-gray-100 dark:border-slate-800 overflow-hidden min-h-screen sm:min-h-0">
                <main className="p-4 sm:p-8">
                    {children}
                </main>
                <div className="bg-gray-50/50 dark:bg-slate-900/50 px-8 py-4 border-t border-gray-100 dark:border-slate-800 flex justify-between items-center text-[10px] uppercase tracking-widest font-black text-gray-400">
                    <span>Professional Device Solutions</span>
                    <span className="flex items-center gap-2">
                        Powered by
                        <span className="text-bel-blue">Belmobile</span>
                    </span>
                </div>
            </div>
        </div>
    );
}
