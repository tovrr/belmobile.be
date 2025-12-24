import AdminLogin from '../../../components/admin/AdminLogin';
import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Admin Login | Belmobile',
    description: 'Secure access to Belmobile Admin Portal',
};

export default function LoginPage() {
    return <AdminLogin />;
}
