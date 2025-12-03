import FranchiseManagement from '../../../components/admin/FranchiseManagement';
import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Franchise Pipeline | Belmobile Admin',
    description: 'Manage franchise applications',
};

export default function FranchisePage() {
    return <FranchiseManagement />;
}
