import AdminLogin from '../../../components/admin/AdminLogin';
import { Metadata } from 'next';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
    title: 'Login | Belmobile Admin',
    description: 'Access the admin dashboard',
};

export default function AdminLoginPage() {
    return <AdminLogin />;
}
