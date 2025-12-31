import { redirect } from 'next/navigation';
import RecoveryClient from './RecoveryClient';

export default async function RecoveryPage({ params }: { params: Promise<{ lang: string; token: string }> }) {
    const { lang, token } = await params;

    // We redirect to the home page (or could be any page) with the recovery token.
    // The BuybackRepair component or a global listener can then handle the hydration.
    // For Belmobile, the wizard is most likely to be needed on the main landing routes.
    // However, if we know the service type from the lead, we could redirect to the specific service page.

    // Since we don't know the service yet, we'll let a client-side component handle the initial load if we want to be specific,
    // or we just redirect to home and let the home page wizard handle it.

    // Better: a simple intermediate page that fetches and redirects specifically.
    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-slate-900">
            <div className="text-center space-y-4">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-bel-blue mx-auto"></div>
                <h1 className="text-xl font-bold text-gray-900 dark:text-white">Reprise de votre session...</h1>
                <p className="text-gray-500">Un instant, nous récupérons vos informations.</p>

                {/* Client-side logic to fetch lead and redirect */}
                <RecoveryClient token={token} lang={lang} />
            </div>
        </div>
    );
}

// Remove previously duplicated import line
