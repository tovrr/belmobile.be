import TeamManagement from '../../../components/admin/TeamManagement';
import { Metadata } from 'next';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
    title: 'Team | Belmobile Admin',
    description: 'Manage administrator accounts',
};

export default function AdminTeamPage() {
    return <TeamManagement />;
}
