'use client';

import React, { useState } from 'react';
import { useLanguage } from '../hooks/useLanguage';
import { PlusIcon, MinusIcon } from '@heroicons/react/24/outline';

interface FAQItemProps {
    question: string;
    answer: string;
}

const FAQItem: React.FC<FAQItemProps> = ({ question, answer }) => {
    const [isOpen, setIsOpen] = useState(false);
    return (
        <div className="border-b border-gray-200 dark:border-slate-700">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full flex justify-between items-center text-left py-4 hover:bg-gray-50 dark:hover:bg-slate-800/50 transition-colors px-2 rounded-lg"
            >
                <span className="text-lg font-medium text-gray-900 dark:text-white">{question}</span>
                {isOpen ? <MinusIcon className="h-6 w-6 text-bel-blue dark:text-blue-400" /> : <PlusIcon className="h-6 w-6 text-gray-500 dark:text-gray-400" />}
            </button>
            {isOpen && (
                <div className="pb-4 px-2 text-gray-600 dark:text-gray-300 leading-relaxed">
                    <p>{answer}</p>
                </div>
            )}
        </div>
    );
};

const FAQ: React.FC = () => {
    const { t } = useLanguage();
    
    const faqs = [
        { q: t('faq_q1'), a: t('faq_a1') },
        { q: t('faq_q2'), a: t('faq_a2') },
        { q: t('faq_q3'), a: t('faq_a3') },
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
        <div className="mt-12">
            <h2 className="text-3xl font-bold text-center text-bel-dark dark:text-white">{t('Frequently Asked Questions')}</h2>
             <div className="mt-8 max-w-3xl mx-auto">
                {faqs.map((faq, index) => (
                    <FAQItem key={index} question={faq.q} answer={faq.a} />
                ))}
            </div>
            <script type="application/ld+json">
                {JSON.stringify(faqSchema)}
            </script>
        </div>
    );
};

export default FAQ;

