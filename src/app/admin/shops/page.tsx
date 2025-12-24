import ShopManagement from '../../../components/admin/ShopManagement';
import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Shop Management | Belmobile Admin',
    description: 'Manage Belmobile shop locations',
};

export default function ShopsPage() {
    return <ShopManagement />;
}
