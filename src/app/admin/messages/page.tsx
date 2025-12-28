import MessageManagement from '../../../components/admin/MessageManagement';
import { Metadata } from 'next';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
    title: 'Messages | Belmobile Admin',
    description: 'Manage customer contact messages',
};

export default function AdminMessagesPage() {
    return <MessageManagement />;
}
