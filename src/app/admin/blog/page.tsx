import BlogManagement from '../../../components/admin/BlogManagement';
import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Blog & SEO | Belmobile Admin',
    description: 'Manage blog posts and SEO content',
};

export default function BlogPage() {
    return <BlogManagement />;
}
