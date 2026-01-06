
import { notFound } from 'next/navigation';
import { adminDb } from '@/lib/firebase-admin';
import { ResumeLoader } from '@/components/wizard/ResumeLoader';
import { unstable_noStore as noStore } from 'next/cache';

interface PageProps {
    params: {
        lang: string;
        token: string;
    };
}

// We do NOT use generateStaticParams here because this path is strictly dynamic
// and we want to opt-out of parent static generation attempts.

export const dynamic = 'force-dynamic';

export default async function ResumePage(props: any) { // Type 'any' for props due to Next.js type quirks
    noStore(); // Opt out of static data fetching completely

    // Await params for Next.js 15+
    const params = await props.params;
    const { lang, token } = params;

    let data = null;

    try {
        if (!adminDb) {
            console.warn("Admin DB not initialized (Build time or Missing Config)");
            // During build, this might be null. Return 404 behavior safely.
            if (process.env.NEXT_PHASE === 'phase-production-build') return null;
            return notFound();
        }

        // Fetch lead from Firestore
        const docRef = await adminDb.collection('leads').doc(token).get();

        if (docRef.exists) {
            data = docRef.data();
        }
    } catch (error) {
        console.error("Error fetching resume token:", error);
        // Fallthrough to 404
    }

    if (!data) {
        return (
            <div className="min-h-screen flex items-center justify-center p-4 bg-slate-50 dark:bg-slate-900">
                <div className="max-w-md w-full bg-white dark:bg-slate-800 p-8 rounded-2xl shadow-xl text-center">
                    <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </div>
                    <h1 className="text-2xl font-bold mb-2 text-slate-900 dark:text-white">Quote Not Found</h1>
                    <p className="text-slate-500 mb-6">This link may have expired or is invalid. Quotes are kept securely for 7 days.</p>
                    <a href={`/${lang}`} className="inline-block bg-indigo-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-indigo-700 transition">
                        Start New Quote
                    </a>
                </div>
            </div>
        );
    }

    // Check expiration
    if (data?.expiresAt && new Date(data.expiresAt) < new Date()) {
        return (
            <div className="min-h-screen flex items-center justify-center p-4 bg-slate-50 dark:bg-slate-900">
                <div className="max-w-md w-full bg-white dark:bg-slate-800 p-8 rounded-2xl shadow-xl text-center">
                    <div className="w-16 h-16 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </div>
                    <h1 className="text-2xl font-bold mb-2 text-slate-900 dark:text-white">Quote Expired</h1>
                    <p className="text-slate-500 mb-6">Sorry, this price estimate is no longer valid as market prices have updated.</p>
                    <a href={`/${lang}`} className="inline-block bg-indigo-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-indigo-700 transition">
                        Get Fresh Price
                    </a>
                </div>
            </div>
        );
    }

    // Pass raw JSON string to client loader
    return <ResumeLoader
        wizardStateStr={data?.wizardState}
        lang={lang}
        token={token}
    />;
}
