import LegalPage from '../../../../components/LegalPage';
import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Privacy Policy | Belmobile',
    description: 'Belmobile Privacy Policy.',
};

export function generateStaticParams() {
    return [];
}

export default function PrivacyPage() {
    return <LegalPage type="privacy" />;
}
