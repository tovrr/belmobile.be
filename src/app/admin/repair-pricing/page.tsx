import RepairPricingManagement from '../../../components/admin/RepairPricingManagement';
import { Metadata } from 'next';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
    title: 'Repair Pricing | Belmobile Admin',
    description: 'Manage repair prices and variations',
};

export default function RepairPricingPage() {
    return <RepairPricingManagement />;
}
