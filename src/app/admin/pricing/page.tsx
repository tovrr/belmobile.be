import { BatchPricingTools } from '../../../components/admin/BatchPricingTools';
import { Metadata } from 'next';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
    title: 'Pricing | Belmobile Admin',
    description: 'Manage buyback and retail prices',
};

export default function AdminPricingPage() {
    return <BatchPricingTools />;
}
