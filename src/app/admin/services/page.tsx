import ServiceManagement from '../../../components/admin/ServiceManagement';
import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Services | Belmobile Admin',
    description: 'Manage repair and buyback services',
};

export default function ServicesPage() {
    return <ServiceManagement />;
}
