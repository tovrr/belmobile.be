import { redirect } from 'next/navigation';
import { retrieveQuote } from '@/app/_actions/retrieve-quote';

const PATHS = {
    repair: {
        fr: 'reparation',
        nl: 'reparatie',
        en: 'repair',
        tr: 'onarim'
    },
    buyback: {
        fr: 'rachat',
        nl: 'inkoop',
        en: 'buyback',
        tr: 'geri-alim'
    }
} as const;

export default async function ResumeQuotePage({ params }: { params: Promise<{ lang: string; id: string }> }) {
    const { id, lang } = await params;

    if (!id) {
        redirect(`/${lang}`);
    }

    const { success, type } = await retrieveQuote(id);

    if (!success || !type) {
        // Fallback to home with error if fetch failed
        redirect(`/${lang}?error=quote_not_found`);
    }

    const safeLang = (['fr', 'nl', 'en', 'tr'].includes(lang) ? lang : 'en') as 'fr' | 'nl' | 'en' | 'tr';
    const slug = PATHS[type][safeLang];

    // Redirect to the specific wizard page
    // This allows the page to hydrate the wizard with the ID
    redirect(`/${lang}/${slug}?resume=${id}`);
}
