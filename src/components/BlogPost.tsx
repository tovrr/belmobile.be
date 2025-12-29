'use client';

import React, { useMemo } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useData } from '../hooks/useData';
import { useLanguage } from '../hooks/useLanguage';
import { ArrowLeftIcon, CalendarDaysIcon, UserIcon, ClockIcon, WrenchScrewdriverIcon } from '@heroicons/react/24/outline';
import Image from 'next/image';
import SchemaMarkup from '../components/SchemaMarkup';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

import { BlogPost as BlogPostType, Product } from '../types';

interface BlogPostProps {
    initialPost?: BlogPostType;
}

const BlogPost: React.FC<BlogPostProps> = ({ initialPost }) => {
    const params = useParams();
    const id = params?.id;
    const { language, t } = useLanguage();
    const { blogPosts } = useData();


    const post = initialPost || blogPosts.find(p => String(p.id) === String(id));
    const localizedSlug = post?.slugs?.[language] || post?.slug;

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

    // Fallback logic: if t(key) returns the key itself, use the original post content
    const localizedTitle = titleTrans !== titleKey ? titleTrans : post.title;
    const localizedExcerpt = excerptTrans !== excerptKey ? excerptTrans : post.excerpt;
    const localizedContent = contentTrans !== contentKey ? contentTrans : post.content;
    const localizedCategory = categoryTrans !== categoryKey ? categoryTrans : post.category;

    const readingTime = useMemo(() => {
        const wordsPerMinute = 200;
        const noOfWords = localizedContent.split(/\s+/g).length;
        const minutes = noOfWords / wordsPerMinute;
        return Math.ceil(minutes);
    }, [localizedContent]);

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
                    article={{
                        headline: localizedTitle,
                        image: post.imageUrl,
                        author: post.author,
                        datePublished: post.date,
                        description: localizedExcerpt,
                        slug: post.slug
                    }}
                    breadcrumbs={[
                        { name: t('Home'), item: `https://belmobile.be/${language}` },
                        { name: 'Blog', item: `https://belmobile.be/${language}/blog` },
                        { name: localizedTitle, item: `https://belmobile.be/${language}/blog/${localizedSlug}` }
                    ]}
                />

                <Link
                    href={`/${language}/blog`}
                    className="inline-flex items-center text-gray-500 hover:text-primary dark:text-gray-400 dark:hover:text-white mb-8 transition-colors group"
                >
                    <ArrowLeftIcon className="h-4 w-4 mr-2 group-hover:-translate-x-1 transition-transform" /> {t('Back')}
                </Link>


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
                            <span className="flex items-center mr-8">
                                <CalendarDaysIcon className="h-5 w-5 mr-2 text-primary dark:text-bel-blue" />
                                {t('Posted on')} {post.date}
                            </span>
                            <span className="flex items-center">
                                <ClockIcon className="h-5 w-5 mr-2 text-primary dark:text-bel-blue" />
                                {readingTime} {t('min read')}
                            </span>
                        </div>



                        <div className="prose prose-lg dark:prose-invert max-w-none text-gray-700 dark:text-gray-300 leading-relaxed 
                                      prose-headings:text-gray-900 dark:prose-headings:text-white 
                                      prose-a:text-primary dark:prose-a:text-bel-blue prose-strong:text-gray-900 dark:prose-strong:text-white
                                      prose-table:border prose-table:border-gray-200 dark:prose-table:border-white/10
                                      prose-th:bg-gray-50 dark:prose-th:bg-white/5 prose-th:px-4 prose-th:py-3
                                      prose-td:px-4 prose-td:py-3 overflow-hidden">
                            <div className="overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0 scrollbar-thin scrollbar-thumb-gray-200 dark:scrollbar-thumb-white/10">
                                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                    {localizedContent}
                                </ReactMarkdown>
                            </div>
                        </div>

                        {/* Sticky CTA / Action Plan Footer */}
                        <div className="mt-16 p-8 rounded-3xl bg-linear-to-br from-primary to-bel-blue text-white shadow-2xl relative overflow-hidden group">
                            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-32 -mt-32 group-hover:scale-110 transition-transform duration-700" />
                            <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
                                <div className="max-w-xl">
                                    <h3 className="text-2xl font-black mb-2 flex items-center">
                                        <WrenchScrewdriverIcon className="h-6 w-6 mr-3" />
                                        {t('Ready to restore your device?')}
                                    </h3>
                                    <p className="text-white/80 font-medium">
                                        {t('Belmobile is the premier choice for expert electronics repair in Brussels. Fast, reliable, and data-secure.')}
                                    </p>
                                </div>
                                <Link
                                    href={`/${language}/#wizard`}
                                    className="whitespace-nowrap bg-bel-yellow hover:bg-yellow-400 text-black px-8 py-4 rounded-2xl font-black transition-all shadow-lg hover:shadow-bel-yellow/30 hover:-translate-y-1"
                                >
                                    {t('Get a Free Quote')}
                                </Link>
                            </div>
                        </div>
                    </div>
                </article>
            </div>
        </div>
    );
};

export default BlogPost;
