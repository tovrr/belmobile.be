'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import { StarIcon } from '@heroicons/react/24/solid';
import { useLanguage } from '../hooks/useLanguage';
import FadeIn from './ui/FadeIn';

import { FormattedReview as Review } from '../services/reviewService';

interface ReviewsSectionProps {
    initialReviews?: Review[];
}

const MOCK_REVIEWS: Review[] = [
    { id: '1', author: 'Jean Dupont', rating: 5, text: 'Service rapide et impeccable ! Mon iPhone est comme neuf.', date: '2 days ago', publishTime: Date.now() - 172800000, shopName: 'Schaerbeek' },
    { id: '2', author: 'Marie Peeters', rating: 5, text: 'Très bon accueil à Schaerbeek. Je recommande.', date: '1 week ago', publishTime: Date.now() - 604800000, shopName: 'Schaerbeek' },
    { id: '3', author: 'Ahmed Benali', rating: 4, text: 'Bon prix pour le rachat de mon Samsung.', date: '2 weeks ago', publishTime: Date.now() - 1209600000, shopName: 'Molenbeek' },
];

const ReviewsSection: React.FC<ReviewsSectionProps> = ({ initialReviews = [] }) => {
    const { t, language } = useLanguage();
    // Use initialReviews if provided, otherwise empty array but we'll show skeleton/mocks if still loading
    const [reviews, setReviews] = useState<Review[]>(initialReviews.length > 0 ? initialReviews : []);
    const [isLoading, setIsLoading] = useState(initialReviews.length === 0);
    const [showAll, setShowAll] = useState(false);

    useEffect(() => {
        const fetchReviews = async () => {
            setIsLoading(true);
            try {
                const response = await fetch(`/api/reviews?lang=${language}`);
                if (response.ok) {
                    const data = await response.json();
                    if (Array.isArray(data) && data.length > 0) {
                        setReviews(data);
                    } else {
                        setReviews(MOCK_REVIEWS);
                    }
                } else {
                    setReviews(MOCK_REVIEWS);
                }
            } catch (error) {
                console.error('Error fetching reviews:', error);
                setReviews(MOCK_REVIEWS);
            } finally {
                setIsLoading(false);
            }
        };

        fetchReviews();
    }, [language]);

    // On mobile (< 768px), we show 3 reviews initially unless "showAll" is true
    // On desktop, we always show all reviews (up to 9)
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        const checkMobile = () => setIsMobile(window.innerWidth < 768);
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    const displayReviews = isLoading ? [] : (isMobile && !showAll ? reviews.slice(0, 3) : reviews);

    return (
        <section className="py-20 relative">
            <div className="container mx-auto px-4 relative z-10">
                <FadeIn>
                    <div className="text-center mb-16">
                        <span className="text-electric-indigo font-bold tracking-widest text-xs uppercase mb-2 block">
                            {t('Testimonials')}
                        </span>
                        <h2 className="text-4xl font-black text-slate-900 dark:text-white mb-4 flex items-center justify-center gap-3">
                            {t('Customer Reviews')}
                        </h2>
                        <div className="flex items-center justify-center gap-1 mb-2">
                            {[...Array(5)].map((_, i) => (
                                <StarIcon key={i} className="h-6 w-6 text-yellow-400" />
                            ))}
                        </div>
                        <p className="text-lg text-slate-500 dark:text-slate-400">4.9/5 {t('Average Rating')}</p>
                    </div>
                </FadeIn>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
                    {isLoading ? (
                        // Skeleton Loaders
                        [...Array(3)].map((_, i) => (
                            <div key={i} className="h-64 bg-white dark:bg-slate-900/60 animate-pulse rounded-3xl border border-gray-100 dark:border-white/10 shadow-lg p-8" />
                        ))
                    ) : (
                        displayReviews.map((review: Review, i: number) => (
                            <FadeIn key={review.id} delay={i * 0.1}>
                                <div className="h-full bg-white dark:bg-slate-900/60 backdrop-blur-xl p-8 rounded-3xl border border-gray-100 dark:border-white/10 shadow-lg hover:shadow-xl transition-all duration-300">
                                    <div className="flex items-center mb-6">
                                        {review.photoUrl ? (
                                            <div className="relative w-12 h-12 rounded-full mr-4 border border-gray-100 dark:border-white/10 overflow-hidden">
                                                <Image
                                                    src={review.photoUrl}
                                                    alt={review.author}
                                                    width={48}
                                                    height={48}
                                                    className="object-cover"
                                                />
                                            </div>
                                        ) : (
                                            <div className="w-12 h-12 bg-electric-indigo/10 rounded-full flex items-center justify-center text-electric-indigo font-bold text-xl mr-4 border border-electric-indigo/20">
                                                {review.author.charAt(0)}
                                            </div>
                                        )}
                                        <div>
                                            <div className="font-bold text-lg text-slate-900 dark:text-white">{review.author}</div>
                                            <div className="text-sm text-slate-500">
                                                {review.date}
                                                {review.shopName && (
                                                    <span className="text-xs opacity-55 ml-1 italic font-medium">
                                                        ({t('at_shop').replace('{0}', review.shopName.replace('Belmobile ', ''))})
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex mb-4">
                                        {[...Array(5)].map((_, i) => (
                                            <StarIcon key={i} className={`h-5 w-5 ${i < review.rating ? 'text-yellow-400' : 'text-gray-300 dark:text-slate-700'}`} />
                                        ))}
                                    </div>
                                    <p className="text-slate-600 dark:text-slate-300 leading-relaxed italic line-clamp-4">&quot;{review.text}&quot;</p>
                                </div>
                            </FadeIn>
                        ))
                    )}
                </div>

                {isMobile && reviews.length > 3 && (
                    <div className="mt-8 text-center">
                        <button
                            onClick={() => setShowAll(!showAll)}
                            className="px-6 py-2 rounded-full bg-electric-indigo/10 text-electric-indigo font-bold text-sm hover:bg-electric-indigo/20 transition-all"
                        >
                            {showAll ? t('Show Less') : t('Show More')}
                        </button>
                    </div>
                )}

                {!isLoading && (
                    <div className="mt-12 text-center animate-fade-in">
                        <a
                            href="https://www.google.com/maps/search/Belmobile"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 text-sm font-bold text-electric-indigo hover:text-indigo-600 transition-colors"
                        >
                            <span>{t('View all reviews on Google')}</span>
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                            </svg>
                        </a>
                    </div>
                )}
            </div>
        </section>
    );
};

export default ReviewsSection;
