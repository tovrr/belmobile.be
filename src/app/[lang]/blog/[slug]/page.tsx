import React, { cache } from 'react';
import { notFound, redirect } from 'next/navigation';
import { Metadata } from 'next';
import BlogPost from '../../../../components/BlogPost';
import { MOCK_BLOG_POSTS } from '../../../../constants';
import { db } from '../../../../firebase';
import { collection, getDocs } from 'firebase/firestore';
import { BlogPost as BlogPostType } from '../../../../types';
import { TranslationDict } from '../../../../utils/translations';

interface PageProps {
    params: Promise<{
        lang: string;
        slug: string;
    }>;
}

// Cached helper to fetch all posts (Firestore + Mock)
const getAllPosts = cache(async (): Promise<BlogPostType[]> => {
    try {
        const snapshot = await getDocs(collection(db, 'blog_posts'));
        const firestorePosts = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as unknown as BlogPostType));

        // Merge Mock and Firestore posts (deduplicating by ID or slug)
        const allPosts = [
            ...MOCK_BLOG_POSTS,
            ...firestorePosts.filter(fp => !MOCK_BLOG_POSTS.some(mp => mp.id === fp.id || mp.slug === fp.slug))
        ];
        return allPosts;
    } catch (error) {
        console.error("Error fetching blog posts for SSG:", error);
        return MOCK_BLOG_POSTS;
    }
});

async function getPost(slugOrId: string): Promise<BlogPostType | undefined> {
    const posts = await getAllPosts();
    // 1. Try to find by Slug (Primary or Localized)
    const bySlug = posts.find(p =>
        p.slug === slugOrId ||
        (p.slugs && Object.values(p.slugs).includes(slugOrId))
    );
    if (bySlug) return bySlug;

    // 2. Fallback: Try to find by ID (Backward Compatibility)
    return posts.find(p => String(p.id) === slugOrId);
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
    const { lang, slug } = await params;
    const post = await getPost(slug);

    if (!post) {
        return {
            title: 'Article Not Found | Belmobile',
        };
    }

    // Dynamic translation lookup (if available)
    // Keys follow the pattern: blog_title_1, blog_excerpt_1, etc.
    const translationsDict: TranslationDict = (await import(`../../../../data/i18n/${lang}.json`)).default;
    const translatedTitle = translationsDict[`blog_title_${post.id}`] || post.title;
    const translatedExcerpt = translationsDict[`blog_excerpt_${post.id}`] || post.excerpt;

    return {
        title: `${translatedTitle} | Belmobile Blog`,
        description: translatedExcerpt,
        openGraph: {
            images: [post.imageUrl],
        },
    };
}

export async function generateStaticParams() {
    const posts = await getAllPosts();
    const languages = ['en', 'fr', 'nl'];
    const params: { lang: string; slug: string }[] = [];

    posts.forEach(post => {
        languages.forEach(lang => {
            // Use localized slug if available, otherwise fallback to default slug
            const slug = post.slugs?.[lang] || post.slug;
            if (slug) {
                params.push({ lang, slug });
            }
        });
    });

    return params;
}

export default async function BlogPostPage({ params }: PageProps) {
    const { slug, lang } = await params;
    const post = await getPost(slug);

    if (!post) {
        return notFound();
    }

    // SEO: Redirect to localized slug if the current one doesn't match the language preference
    const expectedSlug = (post.slugs as any)?.[lang] || post.slug;
    if (slug !== expectedSlug) {
        redirect(`/${lang}/blog/${expectedSlug}`);
    }

    // Pass the server-fetched post as initialData to the CLIENT component
    return <BlogPost initialPost={post} />;
}
