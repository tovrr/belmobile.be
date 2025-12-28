import ShopManagement from '../../../components/admin/ShopManagement';
import { Metadata } from 'next';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
    title: 'Shops | Belmobile Admin',
    description: 'Manage shop locations and details',
};

export default function AdminShopsPage() {
    return <ShopManagement />;
}
