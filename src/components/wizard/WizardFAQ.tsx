'use client';

import React, { useState, useMemo } from 'react';
import { useLanguage } from '../../hooks/useLanguage';
import { ChevronDownIcon, QuestionMarkCircleIcon } from '@heroicons/react/24/outline';
import { AnimatePresence, motion } from 'framer-motion';

interface FAQ {
    q: string;
    a: string;
    steps: number[];
    flows?: ('buyback' | 'repair')[];
}

export const WizardFAQ: React.FC<{ currentStep: number; flow: 'buyback' | 'repair' }> = ({ currentStep, flow }) => {
    const { t } = useLanguage();
    const [openIndex, setOpenIndex] = useState<number | null>(null);

    const faqs: FAQ[] = useMemo(() => [
        {
            q: t('faq_condition_q'),
            a: t('faq_condition_a'),
            steps: [3, 4], // Expanded for both flows logic if needed
            flows: ['buyback']
        },
        {
            q: t('faq_payment_q'),
            a: t('faq_payment_a'), // "When will I be paid?" - Buyback only
            steps: [4, 5],
            flows: ['buyback']
        },
        {
            q: t('faq_privacy_q'),
            a: t('faq_privacy_a'),
            steps: [5, 4], // Step 5 in buyback, Step 4 in repair
            flows: ['buyback', 'repair']
        },
        {
            q: t('faq_repair_time_q'), // "How long does repair take?" - Repair only
            a: t('faq_repair_time_a'),
            steps: [2, 3],
            flows: ['repair']
        }
    ], [t]);

    const activeFaqs = faqs.filter(f =>
        f.steps.includes(currentStep) &&
        (!f.flows || f.flows.includes(flow))
    );

    if (activeFaqs.length === 0) return null;

    return (
        <div className="mt-8 space-y-4 animate-fade-in border-t border-gray-100 dark:border-slate-800 pt-8">
            <h4 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-widest flex items-center gap-2 mb-4">
                <QuestionMarkCircleIcon className="h-4 w-4 text-bel-blue" />
                {t('need_help_title')}
            </h4>

            <div className="space-y-3">
                {activeFaqs.map((faq, idx) => (
                    <div
                        key={idx}
                        className="bg-white dark:bg-slate-900/50 rounded-2xl border border-gray-100 dark:border-slate-800 overflow-hidden shadow-sm hover:shadow-md transition-all"
                    >
                        <button
                            onClick={() => setOpenIndex(openIndex === idx ? null : idx)}
                            className="w-full flex justify-between items-center text-left p-4 focus:outline-none"
                            aria-expanded={openIndex === idx}
                        >
                            <span className="text-sm font-bold text-slate-800 dark:text-slate-200 pr-4">{faq.q}</span>
                            <ChevronDownIcon
                                className={`h-4 w-4 text-gray-500 transition-transform duration-300 ${openIndex === idx ? 'rotate-180' : ''}`}
                            />
                        </button>

                        <AnimatePresence>
                            {openIndex === idx && (
                                <motion.div
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: 'auto', opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    className="px-4 pb-4 overflow-hidden"
                                >
                                    <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-medium">
                                        {faq.a}
                                    </p>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                ))}
            </div>
        </div>
    );
};
