import ProductManagement from '../../../components/admin/ProductManagement';
import { Metadata } from 'next';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
    title: 'Products | Belmobile Admin',
    description: 'Manage shop products and stock',
};

export default function AdminProductsPage() {
    return <ProductManagement />;
}
