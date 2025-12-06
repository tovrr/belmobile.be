'use client';

import React from 'react';
import { useLanguage } from '../hooks/useLanguage';

interface LegalPageLayoutProps {
    title: string;
    description?: string;
    icon: React.ElementType;
    lastUpdated?: string;
    children: React.ReactNode;
}

const LegalPageLayout: React.FC<LegalPageLayoutProps> = ({ title, description, icon: Icon, lastUpdated, children }) => {
    const { t } = useLanguage();

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-slate-950 pt-32 pb-20 relative overflow-hidden transition-colors duration-300">
            {/* Background Gradients */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/20 rounded-full blur-[120px] mix-blend-screen dark:mix-blend-overlay" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-bel-yellow/10 rounded-full blur-[120px] mix-blend-screen dark:mix-blend-overlay" />
            </div>

            <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl relative z-10">
                <div className="glass-panel dark:bg-slate-900/60 rounded-[2.5rem] shadow-2xl p-8 sm:p-12 border border-white/20 dark:border-white/5 animate-fade-in-up">
                    <div className="flex items-center justify-center mb-8">
                        <div className="w-20 h-20 bg-primary/10 rounded-3xl flex items-center justify-center text-primary shadow-inner">
                            <Icon className="h-10 w-10" />
                        </div>
                    </div>

                    <h1 className="text-3xl sm:text-5xl font-black text-center text-slate-900 dark:text-white mb-6">
                        {title}
                    </h1>
                    {description && (
                        <p className="text-center text-slate-600 dark:text-slate-400 mb-12 text-lg max-w-2xl mx-auto leading-relaxed">
                            {description}
                        </p>
                    )}

                    <div className="prose prose-lg dark:prose-invert max-w-none text-slate-700 dark:text-slate-300 leading-relaxed space-y-8">
                        {children}
                    </div>

                    <div className="mt-16 pt-8 border-t border-slate-200 dark:border-white/10 text-center text-sm text-slate-500 dark:text-slate-500 font-medium">
                        {t('Last Updated')}: {lastUpdated || new Date().toLocaleDateString()}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LegalPageLayout;
