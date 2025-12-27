import Reporting from '../../../components/admin/Reporting';
import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Financial Reporting | Belmobile Admin',
    description: 'Advanced business analytics and performance insights',
};

export default function ReportingPage() {
    return <Reporting />;
}
