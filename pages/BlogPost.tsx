
import React from 'react';
import { useParams, Link, Navigate } from 'react-router-dom';
import { useData } from '../hooks/useData';
import { useLanguage } from '../hooks/useLanguage';
import { ArrowLeftIcon, CalendarDaysIcon, UserIcon } from '@heroicons/react/24/outline';
import MetaTags from '../components/MetaTags';

const BlogPost: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const { language, t } = useLanguage();
    const { blogPosts } = useData();
    
    const post = blogPosts.find(p => p.id === Number(id));

    if (!post) {
        return <Navigate to={`/${language}/blog`} replace />;
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
        <div className="min-h-screen bg-gray-50 dark:bg-slate-900 py-12 transition-colors duration-300">
            {/* SEO Meta Tags dynamically injected from CMS Data */}
            <MetaTags title={`${localizedTitle} | Belmobile Blog`} description={localizedExcerpt} imageUrl={post.imageUrl} />

            <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl">
                <Link 
                    to={`/${language}/blog`} 
                    className="inline-flex items-center text-bel-blue dark:text-blue-400 font-bold mb-8 hover:underline"
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
                            {/* In a real app, you might use a markdown renderer or dangerouslySetInnerHTML here */}
                            {localizedContent}
                        </div>
                    </div>
                </article>
            </div>
        </div>
    );
};

export default BlogPost;
