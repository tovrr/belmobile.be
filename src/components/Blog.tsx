'use client';

import React from 'react';
import Link from 'next/link';
import { useData } from '../hooks/useData';
import { useLanguage } from '../hooks/useLanguage';
import { CalendarDaysIcon, UserIcon } from '@heroicons/react/24/outline';
import { MOCK_BLOG_POSTS } from '../constants';

const Blog: React.FC = () => {
    const { language, t } = useLanguage();
    const { blogPosts } = useData();

    // Merge mock posts with Firestore posts, prioritizing mock posts (new content)
    // and removing duplicates based on ID or Slug if possible, but for now just simple concatenation
    // filtering out any Firestore posts that might match the Mock IDs to avoid exact duplicates
    const displayPosts = [
        ...MOCK_BLOG_POSTS,
        ...blogPosts.filter(bp => !MOCK_BLOG_POSTS.some(mp => mp.id === bp.id || mp.slug === bp.slug))
    ];

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-slate-900 py-12 transition-colors duration-300">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-12">
                    <h1 className="text-4xl font-bold text-bel-dark dark:text-white mb-4">{t('Blog')}</h1>
                    <p className="text-lg text-gray-600 dark:text-gray-400">{t('Recent News & Tips')}</p>
                </div>

                {displayPosts.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {displayPosts.map((post) => {
                            // Attempt to fetch translated content if available (for mock posts)
                            const titleKey = `blog_title_${post.id}`;
                            const excerptKey = `blog_excerpt_${post.id}`;
                            const categoryKey = `blog_category_${post.id}`;

                            const titleTrans = t(titleKey);
                            const excerptTrans = t(excerptKey);
                            const categoryTrans = t(categoryKey);

                            // Fallback to post content if translation key is returned (meaning no translation found)
                            const localizedTitle = titleTrans !== titleKey ? titleTrans : post.title;
                            const localizedExcerpt = excerptTrans !== excerptKey ? excerptTrans : post.excerpt;
                            const localizedCategory = categoryTrans !== categoryKey ? categoryTrans : post.category;

                            return (
                                <article key={post.id} className="bg-white dark:bg-slate-800 rounded-2xl shadow-md overflow-hidden hover:shadow-xl transition-shadow duration-300 border border-gray-100 dark:border-slate-700 flex flex-col">
                                    <div className="h-48 overflow-hidden bg-gray-100 dark:bg-slate-700">
                                        <img
                                            src={post.imageUrl}
                                            alt={localizedTitle}
                                            className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                                        />
                                    </div>
                                    <div className="p-6 flex-1 flex flex-col">
                                        <div className="flex items-center text-xs text-gray-500 dark:text-gray-400 mb-3 space-x-4">
                                            <span className="flex items-center">
                                                <CalendarDaysIcon className="h-4 w-4 mr-1" />
                                                {post.date}
                                            </span>
                                            <span className="flex items-center">
                                                <UserIcon className="h-4 w-4 mr-1" />
                                                {post.author}
                                            </span>
                                        </div>
                                        <span className="inline-block bg-blue-50 dark:bg-blue-900/30 text-bel-blue dark:text-blue-300 text-xs font-bold px-2 py-1 rounded-md mb-3 w-fit">
                                            {localizedCategory}
                                        </span>
                                        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-3 line-clamp-2">
                                            <Link href={`/${language}/blog/${post.id}`} className="hover:text-bel-blue dark:hover:text-blue-400 transition-colors">
                                                {localizedTitle}
                                            </Link>
                                        </h2>
                                        <p className="text-gray-600 dark:text-gray-300 text-sm mb-4 line-clamp-3 flex-grow">
                                            {localizedExcerpt}
                                        </p>
                                        <Link
                                            href={`/${language}/blog/${post.id}`}
                                            className="inline-block text-bel-blue dark:text-blue-400 font-bold hover:underline mt-auto"
                                        >
                                            {t('Read More')} &rarr;
                                        </Link>
                                    </div>
                                </article>
                            );
                        })}
                    </div>
                ) : (
                    <div className="text-center py-20 text-gray-500">
                        {t('No articles found.')}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Blog;
