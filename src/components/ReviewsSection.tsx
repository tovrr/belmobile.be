'use client';

import React from 'react';
import { StarIcon } from '@heroicons/react/24/solid';
import { MOCK_REVIEWS } from '../constants';
import { useLanguage } from '../hooks/useLanguage';

const ReviewsSection: React.FC = () => {
    const { t } = useLanguage();

    return (
        <section className="py-16 bg-white dark:bg-slate-900 transition-colors duration-300">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-12">
                    <h2 className="text-3xl sm:text-4xl font-extrabold text-bel-dark dark:text-white mb-4">{t('Customer Reviews')}</h2>
                    <p className="text-lg text-gray-500 dark:text-gray-400">{t('What our clients say')}</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {MOCK_REVIEWS.map((review) => (
                        <div key={review.id} className="bg-gray-50 dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700 flex flex-col h-full transition-transform hover:-translate-y-1">
                            <div className="flex mb-4">
                                {[...Array(5)].map((_, i) => (
                                    <StarIcon
                                        key={i}
                                        className={`h-5 w-5 ${i < review.rating ? 'text-bel-yellow' : 'text-gray-300 dark:text-gray-600'}`}
                                    />
                                ))}
                            </div>
                            <p className="text-gray-600 dark:text-gray-300 mb-6 flex-grow italic">"{t(`review_comment_${review.id}`, review.comment)}"</p>
                            <div className="mt-auto pt-4 border-t border-gray-200 dark:border-slate-700 flex justify-between items-center">
                                <div>
                                    <p className="font-bold text-gray-900 dark:text-white">{review.customerName}</p>
                                    <p className="text-xs text-gray-500 dark:text-gray-500">{review.date}</p>
                                </div>
                                <span className={`text-xs px-2 py-1 rounded-full ${review.platform === 'Google'
                                        ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300'
                                        : 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                                    }`}>
                                    {review.platform}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default ReviewsSection;

