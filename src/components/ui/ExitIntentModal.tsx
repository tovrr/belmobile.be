'use client';

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Mail, CheckCircle, Smartphone, AlertCircle } from 'lucide-react';
import { useWizard } from '@/context/WizardContext';
import { useLanguage } from '@/hooks/useLanguage';
import { saveLead } from '@/app/_actions/lead';

interface ExitIntentModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export const ExitIntentModal = ({ isOpen, onClose }: ExitIntentModalProps) => {
    const { state } = useWizard();
    const { language } = useLanguage();
    const [mounted, setMounted] = useState(false);
    const [email, setEmail] = useState('');
    const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
    const [errorMessage, setErrorMessage] = useState('');
    const [savedToken, setSavedToken] = useState('');

    useEffect(() => {
        setMounted(true);
        if (isOpen) {
            // Optional: Analytics event for 'Exit Intent Shown'
        }
    }, [isOpen]);

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setStatus('loading');
        setErrorMessage('');

        const result = await saveLead(email, state, language);

        if (result.success && result.token) {
            setStatus('success');
            setSavedToken(result.token);
            // Optional: Cookie to prevent showing again
            localStorage.setItem('belmobile_exit_intent_dismissed', 'true');
        } else {
            setStatus('error');
            setErrorMessage(result.error || 'Something went wrong.');
        }
    };

    const handleClose = () => {
        // Mark as dismissed so we don't spam
        localStorage.setItem('belmobile_exit_intent_dismissed', 'true');
        onClose();
    };

    const { t } = useLanguage();

    if (!mounted) return null;

    return createPortal(
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-100 flex items-center justify-center p-4">
                    {/* Dark Overlay */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={handleClose}
                        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                    />

                    {/* Modal Content */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="relative w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-2xl dark:bg-slate-900"
                    >
                        {/* Close Button */}
                        <button
                            onClick={handleClose}
                            className="absolute right-4 top-4 rounded-full p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800"
                        >
                            <X className="h-5 w-5" />
                        </button>

                        <div className="p-6 sm:p-8">
                            {status === 'success' ? (
                                <div className="text-center">
                                    <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
                                        <CheckCircle className="h-8 w-8 text-green-600 dark:text-green-400" />
                                    </div>
                                    <h3 className="mb-2 text-2xl font-bold text-slate-900 dark:text-white">
                                        {t('quote_saved_title')}
                                    </h3>
                                    <p className="mb-6 text-slate-600 dark:text-slate-400">
                                        {t('quote_saved_desc')}
                                    </p>
                                    <div className="mb-6 rounded-lg border border-indigo-100 bg-indigo-50 p-4 text-center dark:border-indigo-900/50 dark:bg-indigo-900/20">
                                        <code className="text-xl font-mono font-bold tracking-widest text-indigo-600 dark:text-indigo-400">
                                            {savedToken}
                                        </code>
                                    </div>
                                    <button
                                        onClick={handleClose}
                                        className="w-full rounded-xl bg-indigo-600 py-3 font-semibold text-white transition hover:bg-indigo-700"
                                    >
                                        {t('got_it_thanks')}
                                    </button>
                                </div>
                            ) : (
                                <>
                                    {/* Header Icon */}
                                    <div className="mb-6 flex justify-center">
                                        <div className="relative">
                                            <div className="absolute inset-0 animate-ping rounded-full bg-yellow-400 opacity-20"></div>
                                            <div className="relative flex h-16 w-16 items-center justify-center rounded-full bg-yellow-100 text-yellow-600 dark:bg-yellow-900/30 dark:text-yellow-400">
                                                <AlertCircle className="h-8 w-8" />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="text-center">
                                        <h2 className="mb-2 text-2xl font-bold text-slate-900 dark:text-white">
                                            {t('exit_intent_title') || "Wait! Don't lose this price."}
                                        </h2>
                                        <p className="mb-6 text-slate-600 dark:text-slate-400">
                                            {t('exit_intent_desc')} <strong>7 {t('days')}</strong>.
                                        </p>

                                        {state.currentEstimate > 0 && (
                                            <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-indigo-50 px-4 py-2 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400">
                                                <Smartphone className="h-4 w-4" />
                                                <span className="font-semibold">
                                                    {t('Current Offer')}: €{state.currentEstimate}
                                                </span>
                                            </div>
                                        )}

                                        <form onSubmit={handleSave} className="space-y-4">
                                            <div>
                                                <div className="relative">
                                                    <Mail className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                                                    <input
                                                        type="email"
                                                        required
                                                        placeholder={t('Enter your email')}
                                                        value={email}
                                                        onChange={(e) => setEmail(e.target.value)}
                                                        className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-10 pr-4 text-slate-900 placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                                                    />
                                                </div>
                                            </div>

                                            {errorMessage && (
                                                <p className="text-sm text-red-500 dark:text-red-400">
                                                    {errorMessage}
                                                </p>
                                            )}

                                            <button
                                                type="submit"
                                                disabled={status === 'loading'}
                                                className="w-full rounded-xl bg-indigo-600 py-3 font-bold text-white shadow-lg shadow-indigo-500/20 transition hover:bg-indigo-700 hover:shadow-indigo-500/30 disabled:opacity-70"
                                            >
                                                {status === 'loading' ? t('Processing...') : t('save_my_price')}
                                            </button>

                                            <button
                                                type="button"
                                                onClick={handleClose}
                                                className="text-sm font-medium text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                                            >
                                                {t('no_thanks_risk')}
                                            </button>
                                        </form>
                                    </div>
                                </>
                            )}
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>,
        document.body
    );
};
