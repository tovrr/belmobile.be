import ChatManagement from '../../../components/admin/ChatManagement';
import { Metadata } from 'next';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
    title: 'Chatbot | Belmobile Admin',
    description: 'Manage AI customer support training',
};

export default function AdminChatbotPage() {
    return (
        <div className="p-8">
            <h1 className="text-3xl font-black mb-4">Chatbot Management</h1>
            <ChatManagement />
        </div>
    );
}
