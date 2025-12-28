import QuoteManagement from '../../../components/admin/QuoteManagement';
import { Metadata } from 'next';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
    title: 'Orders & Quotes | Belmobile Admin',
    description: 'Manage buyback and repair orders',
};

export default function OrdersPage() {
    return <QuoteManagement />;
}
