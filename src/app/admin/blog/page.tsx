import BlogManagement from '../../../components/admin/BlogManagement';
import { Metadata } from 'next';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
    title: 'Blog Management | Belmobile Admin',
    description: 'Create and edit blog posts',
};

export default function AdminBlogPage() {
    return <BlogManagement />;
}
