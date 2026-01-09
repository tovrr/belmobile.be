import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { i18n } from './i18n-config';

const PUBLIC_FILE = /\.(.*)$/;

export function proxy(req: NextRequest) {
    const { pathname } = req.nextUrl;

    // Critical: Explicitly skip Sitemap and Robots to prevent localization loops or rewrites
    const isMetadataFile = pathname.endsWith('/sitemap.xml') || pathname.endsWith('/robots.txt') || pathname.includes('/sitemap/');

    if (isMetadataFile) {
        const parts = pathname.split('/');
        const fileName = parts[parts.length - 1];

        if (parts.length > 2 && !pathname.startsWith('/sitemap/')) {
            console.log(`[Proxy] Redirecting localized metadata: ${pathname} -> /${fileName}`);
            return NextResponse.redirect(new URL(`/${fileName}`, req.url));
        }

        console.log(`[Proxy] Metadata File Access: ${pathname}`);
        return NextResponse.next();
    }

    // 1. Skip if it's an internal Next.js request, API, static file, or Admin panel
    if (
        pathname.startsWith('/_next') ||
        pathname.startsWith('/api') ||
        pathname.startsWith('/admin') ||
        pathname.startsWith('/widget') ||
        pathname.startsWith('/monitoring') ||
        pathname.startsWith('/images') ||
        pathname.startsWith('/favicon.ico') ||
        PUBLIC_FILE.test(pathname)
    ) {
        return NextResponse.next();
    }

    // 2. STAGING PROTECTION (PIN GATE)
    const hostname = req.headers.get('host') || '';
    const isStaging = hostname.includes('dev.') || hostname.includes('vercel.app');

    if (isStaging) {
        const isProtectedPath = !pathname.includes('/protected');

        if (isProtectedPath) {
            const hasAccess = req.cookies.has('staging_access_granted');
            const pinParam = req.nextUrl.searchParams.get('pin');
            const STAGING_PIN = '2580';

            if (pinParam === STAGING_PIN) {
                const url = req.nextUrl.clone();
                url.searchParams.delete('pin');
                const response = NextResponse.redirect(url);
                response.cookies.set('staging_access_granted', 'true', {
                    maxAge: 60 * 60 * 24 * 7, // 1 week
                    path: '/',
                });
                return response;
            }

            if (!hasAccess) {
                const url = req.nextUrl.clone();
                url.pathname = '/fr/protected';
                return NextResponse.redirect(url);
            }
        }
    }

    // 3. Check if the pathname already has a supported locale
    const pathnameHasLocale = i18n.locales.some(
        (locale) => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`
    );

    // 3. REWRITE STRATEGY (Localization Fixes):
    // Map localized paths (e.g. /tr/magazalar) to internal folder structures (e.g. /tr/stores)

    // TURKISH REWRITES
    if (pathname.startsWith('/tr/')) {
        const trRewrites: Record<string, string> = {
            '/tr/magazalar': '/tr/stores',
            '/tr/hakkimizda': '/tr/about',
            '/tr/iletisim': '/tr/contact',
            '/tr/hizmetler': '/tr/services',
            '/tr/urunler': '/tr/products',
            '/tr/kariyer': '/tr/careers',
            '/tr/gizlilik-politikasi': '/tr/privacy',
            '/tr/kullanim-sartlari': '/tr/terms',
            '/tr/cerez-politikasi': '/tr/cookies',
            '/tr/garanti': '/tr/warranty',
            '/tr/destek': '/tr/support',
            '/tr/sss': '/tr/faq',
            '/tr/siparis-takip': '/tr/track-order',
            '/tr/bayilik': '/tr/franchise',
            '/tr/kurumsal': '/tr/business',
            '/tr/is-ortakligi': '/tr/business',
            '/tr/geri-alim': '/tr/buyback',
            '/tr/onarim': '/tr/repair',
            '/tr/egitim': '/tr/training',
            '/tr/surdurulebilirlik': '/tr/sustainability',
        };

        if (trRewrites[pathname]) {
            const url = req.nextUrl.clone();
            url.pathname = trRewrites[pathname];
            return NextResponse.rewrite(url);
        }

        for (const [trPath, enPath] of Object.entries(trRewrites)) {
            if (pathname.startsWith(`${trPath}/`)) {
                const url = req.nextUrl.clone();
                url.pathname = pathname.replace(trPath, enPath);
                return NextResponse.rewrite(url);
            }
        }
    }

    // DUTCH REWRITES
    if (pathname.startsWith('/nl/')) {
        const nlRewrites: Record<string, string> = {
            '/nl/winkels': '/nl/stores',
            '/nl/over-ons': '/nl/about',
            '/nl/contact': '/nl/contact',
            '/nl/diensten': '/nl/services',
            '/nl/producten': '/nl/products',
            '/nl/vacatures': '/nl/careers',
            '/nl/privacybeleid': '/nl/privacy',
            '/nl/algemene-voorwaarden': '/nl/terms',
            '/nl/cookiebeleid': '/nl/cookies',
            '/nl/garantie': '/nl/warranty',
            '/nl/ondersteuning': '/nl/support',
            '/nl/veelgestelde-vragen': '/nl/faq',
            '/nl/volg-bestelling': '/nl/track-order',
            '/nl/franchise': '/nl/franchise',
            '/nl/zakelijk': '/nl/business',
            '/nl/inkoop': '/nl/buyback',
            '/nl/reparatie': '/nl/repair',
            '/nl/opleiding': '/nl/training',
            '/nl/duurzaamheid': '/nl/sustainability',
        };

        if (nlRewrites[pathname]) {
            const url = req.nextUrl.clone();
            url.pathname = nlRewrites[pathname];
            return NextResponse.rewrite(url);
        }

        for (const [nlPath, enPath] of Object.entries(nlRewrites)) {
            if (pathname.startsWith(`${nlPath}/`)) {
                const url = req.nextUrl.clone();
                url.pathname = pathname.replace(nlPath, enPath);
                return NextResponse.rewrite(url);
            }
        }
    }

    // FRENCH REWRITES
    if (pathname.startsWith('/fr/')) {
        const frRewrites: Record<string, string> = {
            '/fr/magasins': '/fr/stores',
            '/fr/a-propos': '/fr/about',
            '/fr/contact': '/fr/contact',
            '/fr/services': '/fr/services',
            '/fr/produits': '/fr/products',
            '/fr/carrieres': '/fr/careers',
            '/fr/politique-de-confidentialite': '/fr/privacy',
            '/fr/conditions-generales': '/fr/terms',
            '/fr/politique-cookies': '/fr/cookies',
            '/fr/garantie': '/fr/warranty',
            '/fr/support': '/fr/support',
            '/fr/faq': '/fr/faq',
            '/fr/suivre-commande': '/fr/track-order',
            '/fr/franchise': '/fr/franchise',
            '/fr/business': '/fr/business',
            '/fr/rachat': '/fr/buyback',
            '/fr/reparation': '/fr/repair',
            '/fr/formation': '/fr/training',
            '/fr/durabilite': '/fr/sustainability',
        };

        if (frRewrites[pathname]) {
            const url = req.nextUrl.clone();
            url.pathname = frRewrites[pathname];
            return NextResponse.rewrite(url);
        }

        for (const [frPath, enPath] of Object.entries(frRewrites)) {
            if (pathname.startsWith(`${frPath}/`)) {
                const url = req.nextUrl.clone();
                url.pathname = pathname.replace(frPath, enPath);
                return NextResponse.rewrite(url);
            }
        }
    }

    if (pathnameHasLocale) return NextResponse.next();

    // 4. REDIRECT STRATEGY:
    const locale = i18n.defaultLocale;
    const url = req.nextUrl.clone();
    url.pathname = `/${locale}${pathname}`;

    return NextResponse.redirect(url);
}

export default proxy;

export const config = {
    matcher: [
        '/((?!api|_next/static|_next/image|favicon.ico|sitemap\\.xml|sitemap/|robots.txt|google).*)',
    ],
};
