'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { EnvelopeIcon, XMarkIcon, CheckCircleIcon, ArrowRightIcon } from '../ui/BrandIcons';
import { useLanguage } from '../../hooks/useLanguage';
import { useWizard } from '../../context/WizardContext';
import { saveQuote } from '../../app/_actions/save-quote';
import { useHaptic } from '../../hooks/useHaptic';

interface SaveQuoteModalProps {
    isOpen: boolean;
    onClose: () => void;
    type: 'buyback' | 'repair';
}

const SaveQuoteModal: React.FC<SaveQuoteModalProps> = ({ isOpen, onClose, type }) => {
    const { t, language } = useLanguage();
    const { state } = useWizard();
    const [email, setEmail] = useState('');
    const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
    const [errorMsg, setErrorMsg] = useState('');
    const haptic = useHaptic();

    const isBuyback = type === 'buyback';

    // Dynamic Colors
    const colors = {
        iconBg: isBuyback ? 'bg-yellow-100 dark:bg-yellow-900/30' : 'bg-indigo-100 dark:bg-indigo-900/30',
        iconText: isBuyback ? 'text-yellow-600 dark:text-yellow-400' : 'text-indigo-600 dark:text-indigo-400',
        focusRing: isBuyback ? 'focus:ring-yellow-400' : 'focus:ring-indigo-500',
        button: isBuyback
            ? 'bg-cyber-citron hover:bg-yellow-300 text-slate-900 shadow-cyber-citron/20'
            : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-500/20'
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setStatus('loading');

        try {
            const result = await saveQuote(email, state, language, type);
            if (result.success) {
                haptic.trigger('success');
                setStatus('success');
                // Auto close after 3s? Or let user close.
            } else {
                haptic.trigger('error');
                setStatus('error');
                setErrorMsg(result.error || 'Unknown error');
            }
        } catch (err) {
            setStatus('error');
            setErrorMsg('Network error');
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                onClick={onClose}
            />

            <motion.div
                initial={{ scale: 0.9, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.9, opacity: 0, y: 20 }}
                className="relative bg-white dark:bg-slate-900 rounded-2xl shadow-2xl max-w-md w-full p-6 border border-slate-200 dark:border-slate-800"
            >
                <button
                    onClick={() => {
                        haptic.trigger('light');
                        onClose();
                    }}
                    className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors active-press"
                >
                    <XMarkIcon className="w-6 h-6" />
                </button>

                {status === 'success' ? (
                    <div className="text-center py-8">
                        <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4"
                        >
                            <CheckCircleIcon className="w-8 h-8" />
                        </motion.div>
                        <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
                            {t('quote_saved_title', 'Quote Saved!')}
                        </h3>
                        <p className="text-slate-500 mb-6">
                            {t('quote_saved_desc', 'We have saved your estimate. You can resume anytime using your email.')}
                        </p>
                        <button
                            onClick={onClose}
                            className="bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-6 py-2 rounded-lg font-bold"
                        >
                            {t('Close')}
                        </button>
                    </div>
                ) : (
                    <>
                        <div className="flex items-center gap-3 mb-4">
                            <div className={`p-2 rounded-lg ${colors.iconBg} ${colors.iconText}`}>
                                <EnvelopeIcon className="w-6 h-6" />
                            </div>
                            <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                                {t('save_for_later', 'Save for Later')}
                            </h3>
                        </div>

                        <p className="text-slate-500 text-sm mb-6">
                            {t('save_quote_info', 'Not ready? Enter your email to save this quote and lock the price for 7 days.')}
                        </p>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold uppercase text-slate-400 mb-1">
                                    {t('Email Address')}
                                </label>
                                <input
                                    type="email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    inputMode="email"
                                    autoComplete="email"
                                    enterKeyHint="done"
                                    className={`w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 text-slate-900 dark:text-white focus:ring-2 ${colors.focusRing} outline-none transition-all`}
                                    placeholder="you@example.com"
                                />
                            </div>

                            {status === 'error' && (
                                <div className="text-red-500 text-sm font-medium bg-red-50 dark:bg-red-900/10 p-2 rounded-lg">
                                    {errorMsg}
                                </div>
                            )}

                            <button
                                type="submit"
                                disabled={status === 'loading'}
                                onClick={() => haptic.trigger('medium')}
                                className={`w-full rounded-xl py-3 font-bold flex items-center justify-center gap-2 transition-all disabled:opacity-50 shadow-lg active-press ${colors.button}`}
                            >
                                {status === 'loading' ? (
                                    <span className={`w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin`} />
                                ) : (
                                    <>
                                        {t('Save Price')} <ArrowRightIcon className="w-4 h-4" />
                                    </>
                                )}
                            </button>
                        </form>
                    </>
                )}
            </motion.div>
        </div>
    );
};

export default SaveQuoteModal;
