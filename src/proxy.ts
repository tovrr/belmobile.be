import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { i18n } from './i18n-config';
import { LEGACY_URL_MAP } from './utils/legacyUrlMap';

const LOCALES = i18n.locales;
const DEFAULT_LOCALE = i18n.defaultLocale;

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

export function proxy(request: NextRequest) {
    const { pathname, searchParams } = request.nextUrl;
    const hostname = request.headers.get('host') || '';

    // --- 1. STAGING PROTECTION (PIN GATE) ---
    const isStaging = hostname.includes('dev.') || hostname.includes('vercel.app');

    if (isStaging) {
        // Paths to exclude from protection
        const isProtectedPath = !pathname.includes('/_next') &&
            !pathname.includes('/api/') &&
            !pathname.includes('/favicon.ico') &&
            !pathname.startsWith('/protected') &&
            !pathname.includes('/images/');

        if (isProtectedPath) {
            const hasAccess = request.cookies.has('staging_access_granted');
            const pinParam = searchParams.get('pin');
            const STAGING_PIN = '2580';

            if (pinParam === STAGING_PIN) {
                const url = request.nextUrl.clone();
                url.searchParams.delete('pin');
                const response = NextResponse.redirect(url);
                response.cookies.set('staging_access_granted', 'true', {
                    maxAge: 60 * 60 * 24 * 7, // 1 week
                    path: '/',
                });
                return response;
            }

            if (!hasAccess) {
                const url = request.nextUrl.clone();
                url.pathname = '/fr/protected';
                return NextResponse.redirect(url);
            }
        }
    }

    // --- 2. PROXY LOGIC (I18N & REDIRECTS) ---

    // SEO Legacy Redirects
    const normalizedPath = pathname.endsWith('/') && pathname.length > 1 ? pathname.slice(0, -1) : pathname;
    if (LEGACY_URL_MAP[normalizedPath]) {
        const target = LEGACY_URL_MAP[normalizedPath];
        return NextResponse.redirect(new URL(target, request.url), 308);
    }

    // Check if path starts with a locale
    const pathnameIsMissingLocale = LOCALES.every(
        (locale) => !pathname.startsWith(`/${locale}/`) && pathname !== `/${locale}`
    );

    // Redirect if no locale (except for static files, api, etc.)
    if (pathnameIsMissingLocale) {
        if (
            pathname.startsWith('/_next') ||
            pathname.startsWith('/api') ||
            pathname.startsWith('/admin') ||
            pathname.startsWith('/migrate') ||
            pathname.startsWith('/protected') ||
            pathname.includes('.')
        ) {
            return NextResponse.next();
        }

        const locale = DEFAULT_LOCALE;
        return NextResponse.redirect(
            new URL(`/${locale}${pathname.startsWith('/') ? '' : '/'}${pathname}`, request.url)
        );
    }

    // Handle Localized Path Rewrites
    const segments = pathname.split('/').filter(Boolean);
    const locale = segments[0];
    const pathSegment = segments[1];

    if (locale && pathSegment && PATH_TRANSLATIONS[locale]) {
        const canonical = PATH_TRANSLATIONS[locale][pathSegment];
        if (canonical) {
            segments[1] = canonical;
            const newPath = `/${segments.join('/')}`;
            return NextResponse.rewrite(new URL(newPath, request.url));
        }
    }

    return NextResponse.next();
}

export const config = {
    matcher: [
        '/((?!api|_next/static|_next/image|favicon.ico).*)',
    ],
};

export default proxy;
