import ReservationManagement from '../../../components/admin/ReservationManagement';
import { Metadata } from 'next';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
    title: 'Reservations | Belmobile Admin',
    description: 'Manage product reservations',
};

export default function ReservationsPage() {
    return <ReservationManagement />;
}
