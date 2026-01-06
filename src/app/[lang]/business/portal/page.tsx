import { redirect } from 'next/navigation';

export default async function PortalIndex({ params }: { params: Promise<{ lang: string }> }) {
    const { lang } = await params;
    // Simple redirect to login for now
    redirect(`/${lang}/business/portal/login`);
}
