import BlogPost from '../../../../components/BlogPost';
import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Blog Post | Belmobile',
    description: 'Read our latest blog post.',
};

export function generateStaticParams() {
    return [];
}

export default function BlogPostPage() {
    return <BlogPost />;
}
