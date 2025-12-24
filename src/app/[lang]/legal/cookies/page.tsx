import LegalPage from '../../../../components/LegalPage';
import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Cookie Policy | Belmobile',
    description: 'Belmobile Cookie Policy.',
};

export function generateStaticParams() {
    return [];
}

export default function CookiesPage() {
    return <LegalPage type="cookies" />;
}
