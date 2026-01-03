'use client';

import React, { useState } from 'react';
import { useLanguage } from '../../hooks/useLanguage';
import { PlusIcon, MinusIcon } from '../ui/BrandIcons';

interface FAQItemProps {
    question: string;
    answer: string;
    variant?: 'aegis' | 'apollo';
}

const FAQItem: React.FC<FAQItemProps> = ({ question, answer, variant = 'aegis' }) => {
    const [isOpen, setIsOpen] = useState(false);
    return (
        <div className="border-b border-gray-200 dark:border-slate-700">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full flex justify-between items-center text-left py-4 hover:bg-gray-50 dark:hover:bg-slate-800/50 transition-colors px-2 rounded-lg group"
            >
                <span className={`text-lg font-medium text-gray-900 dark:text-white transition-colors ${variant === 'apollo' ? 'group-hover:text-cyber-citron' : 'group-hover:text-electric-indigo'}`}>{question}</span>
                {isOpen ? (
                    <MinusIcon className={`h-6 w-6 ${variant === 'apollo' ? 'text-cyber-citron' : 'text-electric-indigo'}`} />
                ) : (
                    <PlusIcon className="h-6 w-6 text-gray-500 dark:text-gray-400" />
                )}
            </button>
            {isOpen && (
                <div className="pb-4 px-2 text-gray-600 dark:text-gray-300 leading-relaxed">
                    <p>{answer}</p>
                </div>
            )}
        </div>
    );
};

interface FAQProps {
    variant?: 'aegis' | 'apollo';
}

const FAQ: React.FC<FAQProps> = ({ variant = 'aegis' }) => {
    const { t } = useLanguage();

    const faqs = [
        { q: t('faq_contact_how_q'), a: t('faq_contact_how_a') },
        { q: t('faq_question_repair_time') || "How long does a repair take?", a: t('faq_answer_repair_time') || "Most repairs, like screen or battery replacements for iPhone and Samsung, are done in 30 minutes in our Schaerbeek and Anderlecht labs." },
        { q: t('faq_question_warranty') || "Do you offer a warranty?", a: t('faq_answer_warranty') || "Yes, we offer a 1-year warranty on all our repairs and parts." },
        { q: t('faq_question_location') || "Where is the nearest Belmobile shop?", a: t('faq_answer_location') || "We have stores in Schaerbeek (Rue Gallait 4) and Anderlecht (Wayez). You can come without an appointment." },
        { q: t('faq_contact_response_q'), a: t('faq_contact_response_a') },
        { q: t('faq_contact_support_q'), a: t('faq_contact_support_a') },
        { q: t('faq_contact_tracking_q'), a: t('faq_contact_tracking_a') },
    ];

    const faqSchema = {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        "mainEntity": faqs.map(faq => ({
            "@type": "Question",
            "name": faq.q,
            "acceptedAnswer": {
                "@type": "Answer",
                "text": faq.a
            }
        }))
    };

    return (
        <div className="mt-20 mb-20">
            <div className="text-center mb-12">
                <span className={`${variant === 'apollo' ? 'text-cyber-citron' : 'text-electric-indigo'} font-bold tracking-widest text-xs uppercase mb-2 block`}>{t('Knowledge Hub')}</span>
                <h2 className="text-4xl font-black text-slate-900 dark:text-white tracking-tighter">{t('faq_title')}</h2>
            </div>
            <div className="mt-8 max-w-3xl mx-auto">
                {faqs.map((faq, index) => (
                    <FAQItem key={index} question={faq.q} answer={faq.a} variant={variant} />
                ))}
            </div>
            <script type="application/ld+json">
                {JSON.stringify(faqSchema)}
            </script>
        </div>
    );
};

export default FAQ;

