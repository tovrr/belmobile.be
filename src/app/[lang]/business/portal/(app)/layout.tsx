import { Metadata } from 'next';
import B2BAppLayoutClient from './B2BAppLayoutClient';

export const metadata: Metadata = {
    robots: {
        index: false,
        follow: false,
    },
};

export default function B2BAppLayout({ children }: { children: React.ReactNode }) {
    return <B2BAppLayoutClient>{children}</B2BAppLayoutClient>;
}
