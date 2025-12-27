import TeamManagement from '../../../components/admin/TeamManagement';
import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Team Management | Belmobile Admin',
    description: 'Manage administrator and staff roles',
};

export default function TeamPage() {
    return <TeamManagement />;
}
