import LegalPage from '../../../../components/pages/LegalPage';
import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Warranty Policy | Belmobile',
    description: 'Belmobile Warranty Policy.',
};

export function generateStaticParams() {
    return [];
}

export default function WarrantyPage() {
    return <LegalPage type="warranty" />;
}
