'use client';

import React, { useState } from 'react';
import { PaperAirplaneIcon, SparklesIcon } from '@heroicons/react/24/outline';
import { useLanguage } from '../../hooks/useLanguage';
import Input from '../ui/Input';

const FooterNewsletter: React.FC = () => {
    const { t } = useLanguage();
    const [email, setEmail] = useState('');
    const [isSubscribed, setIsSubscribed] = useState(false);

    const handleSubscribe = (e: React.FormEvent) => {
        e.preventDefault();
        if (email) {
            setIsSubscribed(true);
            setEmail('');
            // Simulate backend call
            setTimeout(() => setIsSubscribed(false), 5000);
        }
    };

    return (
        <div className="relative max-w-sm mb-8">
            {isSubscribed ? (
                <div className="bg-green-500/20 border border-green-500/50 rounded-xl py-3 px-4 text-sm text-green-200 flex items-center">
                    <SparklesIcon className="h-5 w-5 mr-2 text-green-400" aria-hidden="true" />
                    {t('newsletter_success')}
                </div>
            ) : (
                <form onSubmit={handleSubscribe} className="relative">
                    <Input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder={t('newsletter_placeholder')}
                        required
                        className="bg-white/5 border-white/10 placeholder-slate-500 text-white backdrop-blur-sm focus:ring-electric-indigo"
                        rightElement={
                            <button
                                type="submit"
                                aria-label={t('Subscribe')}
                                className="p-1.5 bg-electric-indigo rounded-lg text-white hover:bg-indigo-500 transition-colors shadow-lg shadow-indigo-500/30"
                            >
                                <PaperAirplaneIcon className="h-4 w-4" />
                            </button>
                        }
                    />
                </form>
            )}
        </div>
    );
};

export default FooterNewsletter;
