import React, { cache } from 'react';
import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import BlogPost from '../../../../components/BlogPost';
import { MOCK_BLOG_POSTS } from '../../../../constants';
import { db } from '../../../../firebase';
import { collection, getDocs } from 'firebase/firestore';
import { BlogPost as BlogPostType } from '../../../../types';

interface PageProps {
    params: Promise<{
        lang: string;
        id: string;
    }>;
}

// Cached helper to fetch all posts (Firestore + Mock)
const getAllPosts = cache(async (): Promise<BlogPostType[]> => {
    // try {
    //     const snapshot = await getDocs(collection(db, 'blog_posts'));
    //     const firestorePosts = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as unknown as BlogPostType));

    //     // Merge Mock and Firestore posts (deduplicating by ID)
    //     const allPosts = [
    //         ...MOCK_BLOG_POSTS,
    //         ...firestorePosts.filter(fp => !MOCK_BLOG_POSTS.some(mp => mp.id === fp.id))
    //     ];
    //     return allPosts;
    // } catch (error) {
    //     console.error("Error fetching blog posts for SSG:", error);
    return MOCK_BLOG_POSTS;
    // }
});

async function getPost(id: string): Promise<BlogPostType | undefined> {
    const posts = await getAllPosts();
    return posts.find(p => p.id === Number(id));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
    const { id, lang } = await params;
    const post = await getPost(id);

    if (!post) {
        return {
            title: 'Article Not Found | Belmobile',
        };
    }

    return {
        title: `${post.title} | Belmobile Blog`,
        description: post.excerpt,
        openGraph: {
            images: [post.imageUrl],
        },
    };
}

export async function generateStaticParams() {
    const posts = await getAllPosts();
    const languages = ['en', 'fr', 'nl'];
    const params: { lang: string; id: string }[] = [];

    posts.forEach(post => {
        languages.forEach(lang => {
            params.push({ lang, id: String(post.id) });
        });
    });

    return params;
}

export default async function BlogPostPage({ params }: PageProps) {
    const { id } = await params;
    const post = await getPost(id);

    if (!post) {
        return notFound();
    }

    // Pass the server-fetched post as initialData to the CLIENT component
    return <BlogPost initialPost={post} />;
}
