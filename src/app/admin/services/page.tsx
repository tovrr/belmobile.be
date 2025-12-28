import ServiceManagement from '../../../components/admin/ServiceManagement';
import { Metadata } from 'next';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
    title: 'Services | Belmobile Admin',
    description: 'Manage repair services and issues',
};

export default function AdminServicesPage() {
    return <ServiceManagement />;
}
