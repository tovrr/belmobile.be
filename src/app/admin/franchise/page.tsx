import FranchiseManagement from '../../../components/admin/FranchiseManagement';
import { Metadata } from 'next';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
    title: 'Franchise Applications | Belmobile Admin',
    description: 'Review and manage franchise requests',
};

export default function AdminFranchisePage() {
    return <FranchiseManagement />;
}
