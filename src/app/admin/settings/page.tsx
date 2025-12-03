import Settings from '../../../components/admin/Settings';
import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Settings | Belmobile Admin',
    description: 'Manage admin settings',
};

export default function SettingsPage() {
    return <Settings />;
}
