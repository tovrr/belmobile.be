import Terms from '../../../../components/Terms';
import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Terms & Conditions | Belmobile',
    description: 'Belmobile Terms and Conditions.',
};

export function generateStaticParams() {
    return [];
}

export default function TermsPage() {
    return <Terms />;
}
