'use client';

import React from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useData } from '../hooks/useData';
import { useLanguage } from '../hooks/useLanguage';
import { ArrowLeftIcon, CalendarDaysIcon, UserIcon } from '@heroicons/react/24/outline';
import SchemaMarkup from '../components/SchemaMarkup';

import { BlogPost as BlogPostType } from '../types';

interface BlogPostProps {
    initialPost?: BlogPostType;
}

const BlogPost: React.FC<BlogPostProps> = ({ initialPost }) => {
    const params = useParams();
    const id = params?.id;
    const { language, t } = useLanguage();
    const { blogPosts } = useData();
    const router = useRouter();

    const post = initialPost || blogPosts.find(p => p.id === Number(id));

    if (!post) {
        return (
            <div className="min-h-screen pt-32 pb-12 px-4 flex flex-col items-center justify-center text-center bg-gray-50 dark:bg-slate-950 relative overflow-hidden">
                {/* Background Gradients */}
                <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                    <div className="absolute top-[-20%] left-[-20%] w-[50%] h-[50%] bg-primary/20 rounded-full blur-[120px]" />
                </div>

                <h1 className="text-3xl font-black text-gray-900 dark:text-white mb-6 relative z-10">{t('Article not found')}</h1>
                <Link
                    href={`/${language}/blog`}
                    className="bg-primary hover:bg-primary-hover text-white px-8 py-3 rounded-xl font-bold transition-all shadow-lg hover:shadow-primary/30 relative z-10"
                >
                    {t('Back to Blog')}
                </Link>
            </div>
        );
    }

    // Attempt to fetch translated content if available (for mock posts)
    const titleKey = `blog_title_${post.id}`;
    const excerptKey = `blog_excerpt_${post.id}`;
    const contentKey = `blog_content_${post.id}`;
    const categoryKey = `blog_category_${post.id}`;

    const titleTrans = t(titleKey);
    const excerptTrans = t(excerptKey);
    const contentTrans = t(contentKey);
    const categoryTrans = t(categoryKey);

    // Fallback to post content if translation key is returned (meaning no translation found)
    const localizedTitle = titleTrans !== titleKey ? titleTrans : post.title;
    const localizedExcerpt = excerptTrans !== excerptKey ? excerptTrans : post.excerpt;
    const localizedContent = contentTrans !== contentKey ? contentTrans : post.content;
    const localizedCategory = categoryTrans !== categoryKey ? categoryTrans : post.category;

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-slate-950 pt-32 pb-20 relative overflow-hidden">
            {/* Background Gradients */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                <div className="absolute top-0 left-[-20%] w-[50%] h-[50%] bg-primary/20 rounded-full blur-[120px] mix-blend-screen dark:mix-blend-overlay" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-bel-yellow/10 rounded-full blur-[120px] mix-blend-screen dark:mix-blend-overlay" />
            </div>

            <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl relative z-10">
                <SchemaMarkup
                    type="article"
                    product={{
                        id: post.id,
                        name: localizedTitle,
                        description: localizedExcerpt,
                        imageUrl: post.imageUrl,
                        price: 0,
                        slug: post.slug,
                        availability: {},
                        author: post.author,
                        date: post.date
                    } as any}
                />

                <Link
                    href={`/${language}/blog`}
                    className="inline-flex items-center text-gray-500 hover:text-primary dark:text-gray-400 dark:hover:text-white mb-8 transition-colors group"
                >
                    <ArrowLeftIcon className="h-4 w-4 mr-2 group-hover:-translate-x-1 transition-transform" /> {t('Back')}
                </Link>

                import Image from 'next/image';

                // ... (other imports)

                // Inside component:
                <article className="glass-panel dark:bg-slate-900/40 rounded-3xl overflow-hidden border border-white/20 dark:border-white/5 shadow-xl">
                    <div className="h-64 sm:h-96 overflow-hidden relative bg-slate-900">
                        <Image
                            src={post.imageUrl}
                            alt={localizedTitle}
                            fill
                            className="object-cover"
                            priority
                            sizes="100vw"
                        />
                        <div className="absolute inset-0 bg-linear-to-t from-slate-900 via-slate-900/40 to-transparent" />

                        <div className="absolute bottom-0 left-0 w-full p-8 sm:p-12">
                            <span className="inline-block bg-primary/90 text-white text-xs font-bold px-3 py-1 rounded-full mb-4 shadow-lg backdrop-blur-md">
                                {localizedCategory}
                            </span>
                            <h1 className="text-3xl sm:text-5xl font-black text-white leading-tight drop-shadow-lg">
                                {localizedTitle}
                            </h1>
                        </div>
                    </div>

                    <div className="p-8 sm:p-12">
                        <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 mb-8 border-b border-gray-100 dark:border-white/10 pb-6">
                            <span className="flex items-center mr-8">
                                <UserIcon className="h-5 w-5 mr-2 text-primary dark:text-bel-blue" />
                                <span className="mr-1">{t('By')}</span>
                                <span className="font-bold text-gray-900 dark:text-white">{post.author}</span>
                            </span>
                            <span className="flex items-center">
                                <CalendarDaysIcon className="h-5 w-5 mr-2 text-primary dark:text-bel-blue" />
                                {t('Posted on')} {post.date}
                            </span>
                        </div>

                        <div className="prose prose-lg dark:prose-invert max-w-none text-gray-700 dark:text-gray-300">
                            <div className="whitespace-pre-wrap leading-relaxed">
                                {localizedContent}
                            </div>
                        </div>
                    </div>
                </article>
            </div>
        </div>
    );
};

export default BlogPost;
