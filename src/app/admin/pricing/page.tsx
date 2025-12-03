import RepairPricingManagement from '../../../components/admin/RepairPricingManagement';
import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Repair Pricing | Belmobile Admin',
    description: 'Manage repair pricing',
};

export default function PricingPage() {
    return <RepairPricingManagement />;
}
