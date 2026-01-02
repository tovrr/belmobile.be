import { permanentRedirect } from 'next/navigation';

interface PageProps {
    params: Promise<{ lang: string; slug: string[] }>;
}

/**
 * BLOG REDIRECTOR
 * Shopify URLs: /blogs/news/post-title
 * New URLs: /fr/blog/post-title
 */
export default async function BlogRedirectPage({ params }: PageProps) {
    const { lang, slug } = await params;
    const postSlug = slug[slug.length - 1]; // Take the last segment which is the actual post slug

    // Redirect to the new blog structure
    permanentRedirect(`/${lang}/blog/${postSlug}`);
}
