import Dashboard from '../../../components/admin/Dashboard';
import { Metadata } from 'next';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
    title: 'Dashboard | Belmobile Admin',
    description: 'Overview of business performance',
};

export default function AdminDashboardPage() {
    return <Dashboard />;
}
