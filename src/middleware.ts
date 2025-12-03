import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const LOCALES = ['en', 'fr', 'nl'];
const DEFAULT_LOCALE = 'en';

// Path Translations Map (Localized -> Canonical)
const PATH_TRANSLATIONS: Record<string, Record<string, string>> = {
    fr: {
        'produits': 'products',
        'reparation': 'repair',
        'rachat': 'buyback',
        'acheter': 'buy',
        'magasins': 'stores',
        'contact': 'contact',
        'faq': 'faq',
        'blog': 'blog',
        'carrieres': 'jobs',
        'solutions-business': 'business',
        'franchise': 'franchise',
        'suivre-commande': 'track-order',
        'conditions': 'terms',
        'confidentialite': 'privacy',
        'garantie': 'warranty',
    },
    nl: {
        'producten': 'products',
        'reparatie': 'repair',
        'inkoop': 'buyback',
        'kopen': 'buy',
        'winkels': 'stores',
        'contact': 'contact',
        'faq': 'faq',
        'blog': 'blog',
        'vacatures': 'jobs',
        'zakelijk': 'business',
        'franchise': 'franchise',
        'volg-bestelling': 'track-order',
        'voorwaarden': 'terms',
        'privacy': 'privacy',
        'garantie': 'warranty',
    }
};

export function middleware(request: NextRequest) {
    const pathname = request.nextUrl.pathname;

    // 1. Check if path starts with a locale
    const pathnameIsMissingLocale = LOCALES.every(
        (locale) => !pathname.startsWith(`/${locale}/`) && pathname !== `/${locale}`
    );

    // Redirect if no locale (except for static files, api, etc.)
    if (pathnameIsMissingLocale) {
        // Exclude internal paths
        if (
            pathname.startsWith('/_next') ||
            pathname.startsWith('/api') ||
            pathname.startsWith('/admin') || // Exclude admin routes
            pathname.includes('.') // files like favicon.ico
        ) {
            return NextResponse.next();
        }

        const locale = DEFAULT_LOCALE;
        return NextResponse.redirect(
            new URL(`/${locale}${pathname.startsWith('/') ? '' : '/'}${pathname}`, request.url)
        );
    }

    // 2. Handle Localized Path Rewrites
    const segments = pathname.split('/').filter(Boolean);
    const locale = segments[0];
    const pathSegment = segments[1]; // The first segment after locale

    if (locale && pathSegment && PATH_TRANSLATIONS[locale]) {
        const canonical = PATH_TRANSLATIONS[locale][pathSegment];
        if (canonical) {
            // Replace the localized segment with the canonical one
            segments[1] = canonical;
            const newPath = `/${segments.join('/')}`;

            // Rewrite the URL (internal redirect, user sees original URL)
            return NextResponse.rewrite(new URL(newPath, request.url));
        }
    }

    return NextResponse.next();
}

export const config = {
    matcher: [
        // Skip all internal paths (_next)
        '/((?!_next|api|favicon.ico).*)',
    ],
};
