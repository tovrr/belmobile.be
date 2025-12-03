'use client';

import React from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useData } from '../hooks/useData';
import { useLanguage } from '../hooks/useLanguage';
import { ArrowLeftIcon, CalendarDaysIcon, UserIcon } from '@heroicons/react/24/outline';
import SchemaMarkup from '../components/SchemaMarkup';

const BlogPost: React.FC = () => {
    const params = useParams();
    const id = params?.id;
    const { language, t } = useLanguage();
    const { blogPosts } = useData();
    const router = useRouter();

    const post = blogPosts.find(p => p.id === Number(id));

    if (!post) {
        // In Next.js, we can't easily "return <Navigate />" in the same way, 
        // but we can render a not found message or redirect.
        // For better UX, let's show a not found state or redirect.
        // Since this is client side, we can use router.replace.
        // But doing it in render is bad practice.
        // Better to show "Post not found" UI.
        return (
            <div className="min-h-screen pt-24 pb-12 px-4 flex flex-col items-center justify-center text-center">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">{t('Article not found')}</h1>
                <Link
                    href={`/${language}/blog`}
                    className="bg-bel-blue text-white px-6 py-3 rounded-xl font-bold hover:bg-blue-700 transition"
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
        <div className="min-h-screen pt-24 pb-12 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
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
                    // Extra props for Article schema
                    author: post.author,
                    date: post.date
                } as any}
            />
            <Link
                href={`/${language}/blog`}
                className="flex items-center text-gray-500 hover:text-bel-blue mb-8 transition"
            >
                <ArrowLeftIcon className="h-4 w-4 mr-2" /> {t('Back')}
            </Link>

            <article className="bg-white dark:bg-slate-800 rounded-3xl shadow-lg overflow-hidden border border-gray-100 dark:border-slate-700">
                <div className="h-64 sm:h-96 overflow-hidden relative bg-gray-200">
                    <img
                        src={post.imageUrl}
                        alt={localizedTitle}
                        className="w-full h-full object-cover"
                    />
                    <div className="absolute bottom-0 left-0 w-full bg-gradient-to-t from-black/70 to-transparent p-8">
                        <span className="inline-block bg-bel-blue text-white text-xs font-bold px-3 py-1 rounded-full mb-3">
                            {localizedCategory}
                        </span>
                        <h1 className="text-3xl sm:text-4xl font-extrabold text-white leading-tight">
                            {localizedTitle}
                        </h1>
                    </div>
                </div>

                <div className="p-8 sm:p-12">
                    <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 mb-8 border-b border-gray-100 dark:border-slate-700 pb-6">
                        <span className="flex items-center mr-6">
                            <UserIcon className="h-5 w-5 mr-2" />
                            {t('By')} <span className="font-bold text-gray-900 dark:text-white ml-1">{post.author}</span>
                        </span>
                        <span className="flex items-center">
                            <CalendarDaysIcon className="h-5 w-5 mr-2" />
                            {t('Posted on')} {post.date}
                        </span>
                    </div>

                    <div className="prose prose-lg dark:prose-invert max-w-none text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                        {localizedContent}
                    </div>
                </div>
            </article>
        </div>
    );
};

export default BlogPost;
