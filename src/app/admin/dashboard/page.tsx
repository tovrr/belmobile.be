import Dashboard from '../../../components/admin/Dashboard';
import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Dashboard | Belmobile Admin',
    description: 'Belmobile Admin Dashboard',
};

export default function DashboardPage() {
    return <Dashboard />;
}
