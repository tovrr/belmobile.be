import Reporting from '../../../components/admin/Reporting';
import { Metadata } from 'next';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
    title: 'Reporting | Belmobile Admin',
    description: 'Business analytics and reports',
};

export default function AdminReportingPage() {
    return <Reporting />;
}
