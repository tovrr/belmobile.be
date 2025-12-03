import ProductManagement from '../../../components/admin/ProductManagement';
import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Inventory & Products | Belmobile Admin',
    description: 'Manage global stock and products',
};

export default function ProductsPage() {
    return <ProductManagement />;
}
