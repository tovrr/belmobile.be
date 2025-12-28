import { IntegrationsManager } from '../../../components/admin/IntegrationsManager';
import { Metadata } from 'next';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
    title: 'Integrations | Belmobile Admin',
    description: 'Manage external data feeds and CSV exports',
};

export default function AdminIntegrationsPage() {
    return <IntegrationsManager />;
}
