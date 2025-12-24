'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useData } from '../hooks/useData';
import { useLanguage } from '../hooks/useLanguage';
import { CalendarDaysIcon, UserIcon } from '@heroicons/react/24/outline';
import { MOCK_BLOG_POSTS } from '../constants';

const Blog: React.FC = () => {
    const { language, t } = useLanguage();
    const { blogPosts } = useData();

    // Merge mock posts with Firestore posts
    const displayPosts = [
        ...MOCK_BLOG_POSTS,
        ...blogPosts.filter(bp => !MOCK_BLOG_POSTS.some(mp => mp.id === bp.id || mp.slug === bp.slug))
    ];

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-slate-950 pt-32 pb-20 relative overflow-hidden">
            {/* Background Gradients */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                <div className="absolute top-0 left-[-20%] w-[50%] h-[50%] bg-primary/20 rounded-full blur-[120px] mix-blend-screen dark:mix-blend-overlay" />
                <div className="absolute bottom-0 right-[-20%] w-[50%] h-[50%] bg-bel-yellow/10 rounded-full blur-[120px] mix-blend-screen dark:mix-blend-overlay" />
            </div>

            <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                <div className="text-center mb-16">
                    <h1 className="text-5xl md:text-6xl font-black text-transparent bg-clip-text bg-linear-to-r from-primary to-bel-blue mb-6">
                        {t('Blog')}
                    </h1>
                    <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto leading-relaxed">
                        {t('Recent News & Tips')}
                    </p>
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
                                <Link
                                    href={`/${language}/blog/${post.slugs?.[language as string] || post.slug || post.id}`}
                                    key={post.id}
                                    className="group"
                                >
                                    <article className="h-full glass-panel dark:bg-slate-900/40 rounded-3xl overflow-hidden hover:scale-[1.02] transition-all duration-300 border border-white/20 dark:border-white/5 hover:border-primary/50 dark:hover:border-primary/50 shadow-lg hover:shadow-primary/10 flex flex-col">
                                        <div className="h-56 overflow-hidden relative">
                                            <div className="absolute inset-0 bg-linear-to-t from-slate-900/60 to-transparent z-10" />
                                            {post.imageUrl && (
                                                <Image
                                                    src={post.imageUrl}
                                                    alt={localizedTitle}
                                                    fill
                                                    className="object-cover transition-transform duration-700 group-hover:scale-110"
                                                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                                                />
                                            )}
                                            <div className="absolute top-4 left-4 z-20">
                                                <span className="inline-block bg-white/90 dark:bg-slate-900/90 backdrop-blur-md text-primary dark:text-cyber-citron text-xs font-bold px-3 py-1.5 rounded-full shadow-sm">
                                                    {localizedCategory}
                                                </span>
                                            </div>
                                        </div>

                                        <div className="p-8 flex flex-col grow">
                                            <div className="flex items-center text-xs font-medium text-gray-500 dark:text-gray-400 mb-4 space-x-4">
                                                <span className="flex items-center">
                                                    <CalendarDaysIcon className="h-4 w-4 mr-1.5 text-primary dark:text-bel-blue" />
                                                    {post.date}
                                                </span>
                                                <span className="flex items-center">
                                                    <UserIcon className="h-4 w-4 mr-1.5 text-primary dark:text-bel-blue" />
                                                    {post.author}
                                                </span>
                                            </div>

                                            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-3 line-clamp-2 group-hover:text-primary dark:group-hover:text-cyber-citron transition-colors">
                                                {localizedTitle}
                                            </h2>

                                            <p className="text-gray-600 dark:text-gray-400 text-sm mb-6 line-clamp-3 leading-relaxed grow">
                                                {localizedExcerpt}
                                            </p>

                                            <div className="flex items-center text-primary dark:text-cyber-citron font-bold text-sm mt-auto group-hover:translate-x-2 transition-transform duration-300">
                                                {t('Read More')}
                                                <span className="ml-2">→</span>
                                            </div>
                                        </div>
                                    </article>
                                </Link>
                            );
                        })}
                    </div>
                ) : (
                    <div className="glass-panel p-12 rounded-3xl text-center">
                        <p className="text-gray-500 dark:text-gray-400 text-lg">{t('No articles found.')}</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Blog;
