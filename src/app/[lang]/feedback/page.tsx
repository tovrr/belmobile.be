'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useLanguage } from '@/hooks/useLanguage';
import { SHOPS } from '@/constants';
import { StarIcon } from '@heroicons/react/24/solid';
import Image from 'next/image';
import { motion } from 'framer-motion';

function FeedbackContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const { t } = useLanguage();

    const stars = parseInt(searchParams.get('stars') || '0');
    const shopId = searchParams.get('shopId');
    const orderId = searchParams.get('orderId');

    const [comment, setComment] = useState('');
    const [submitted, setSubmitted] = useState(false);
    const [loading, setLoading] = useState(false);

    const shop = SHOPS.find(s => s.id === shopId);
    const isPositive = stars >= 4;

    useEffect(() => {
        if (isPositive && shop?.googleReviewUrl) {
            // Auto-redirect to Google after 3 seconds if positive
            const timer = setTimeout(() => {
                window.location.href = shop.googleReviewUrl!;
            }, 3000);
            return () => clearTimeout(timer);
        }
    }, [isPositive, shop]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const response = await fetch('/api/feedback', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    stars,
                    shopId,
                    orderId,
                    comment,
                    shopName: shop?.name
                })
            });

            if (response.ok) {
                setSubmitted(true);
            }
        } catch (error) {
            console.error('Error submitting feedback:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-deep-space flex flex-col items-center justify-center p-4 relative overflow-hidden">
            {/* Ambient Background Glows - Copied from Hero.tsx */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 1.5 }}
                className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-electric-indigo/20 dark:bg-electric-indigo/10 rounded-full blur-[120px] -z-10 pointer-events-none"
            />
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 1.5, delay: 0.5 }}
                className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-cyber-citron/10 dark:bg-cyber-citron/5 rounded-full blur-[100px] -z-10 pointer-events-none"
            />

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="max-w-md w-full bg-white dark:bg-slate-900/60 backdrop-blur-xl rounded-[2.5rem] shadow-2xl p-8 sm:p-10 text-center border border-slate-100 dark:border-white/10 relative z-10"
            >
                <div className="mb-8 flex justify-center">
                    <div className="relative w-24 h-24 sm:w-28 sm:h-28">
                        <Image
                            src="/images/hero_phone_bg.png"
                            alt="Belmobile"
                            fill
                            className="object-contain drop-shadow-2xl"
                        />
                    </div>
                </div>

                {isPositive ? (
                    <div className="space-y-6">
                        <h1 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
                            {t('Thank you for your feedback!')}
                        </h1>
                        <p className="text-lg text-slate-600 dark:text-slate-300 font-medium">
                            {t("We're glad you're happy with our service.")}
                        </p>
                        <div className="flex justify-center gap-2 my-8">
                            {[...Array(5)].map((_, i) => (
                                <motion.div
                                    key={i}
                                    initial={{ scale: 0, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    transition={{ delay: i * 0.1 }}
                                >
                                    <StarIcon className={`w-10 h-10 ${i < stars ? 'text-yellow-400 drop-shadow-md' : 'text-slate-200 dark:text-slate-700'}`} />
                                </motion.div>
                            ))}
                        </div>
                        <div className="py-4 px-6 bg-electric-indigo/10 dark:bg-electric-indigo/20 rounded-2xl text-electric-indigo font-bold animate-pulse border border-electric-indigo/20">
                            {t('Redirecting to Google Reviews...')}
                        </div>
                        <p className="text-sm text-slate-400 dark:text-slate-500 pt-4">
                            {t('Should the redirect fail, please click')}{' '}
                            <a href={shop?.googleReviewUrl} className="text-electric-indigo underline hover:text-indigo-400 transition-colors">here</a>
                        </p>
                    </div>
                ) : (
                    submitted ? (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="space-y-6"
                        >
                            <div className="w-20 h-20 bg-green-100 dark:bg-green-500/20 text-green-600 dark:text-green-400 rounded-full flex items-center justify-center mx-auto mb-6 shadow-glow">
                                <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                </svg>
                            </div>
                            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">
                                {t('Thank you for your honesty. We will look into this immediately.')}
                            </h1>
                            <button
                                onClick={() => router.push('/')}
                                className="w-full py-4 px-6 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-2xl font-bold hover:scale-[1.02] active:scale-[0.98] transition-all shadow-lg text-lg"
                            >
                                {t('Back to Home')}
                            </button>
                        </motion.div>
                    ) : (
                        <div className="space-y-6">
                            <h1 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
                                {t("We're sorry to hear that.")}
                            </h1>
                            <p className="text-slate-600 dark:text-slate-400 text-lg">
                                {t('How can we improve?')}
                            </p>

                            <form onSubmit={handleSubmit} className="text-left space-y-6 mt-8">
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2 uppercase tracking-wide">
                                        {t('Your comments (private)')}
                                    </label>
                                    <textarea
                                        rows={4}
                                        value={comment}
                                        onChange={(e) => setComment(e.target.value)}
                                        className="w-full px-5 py-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-electric-indigo focus:border-transparent transition-all outline-none resize-none text-slate-900 dark:text-white placeholder-slate-400"
                                        placeholder={t('Tell us what happened...')}
                                        required
                                    />
                                </div>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full py-4 bg-electric-indigo text-white rounded-2xl font-bold text-lg hover:shadow-glow hover:shadow-indigo-500/50 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:hover:scale-100 flex items-center justify-center gap-2 shadow-lg"
                                >
                                    {loading ? (
                                        <div className="w-6 h-6 border-3 border-white/30 border-t-white rounded-full animate-spin" />
                                    ) : (
                                        t('Submit Feedback')
                                    )}
                                </button>
                            </form>
                        </div>
                    )
                )}
            </motion.div>
        </div>
    );
}

export default function FeedbackPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-gray-50 dark:bg-deep-space flex items-center justify-center">
                <div className="w-16 h-16 border-4 border-electric-indigo/30 border-t-electric-indigo rounded-full animate-spin" />
            </div>
        }>
            <FeedbackContent />
        </Suspense>
    );
}
