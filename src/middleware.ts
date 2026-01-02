import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { i18n } from './i18n-config';

const PUBLIC_FILE = /\.(.*)$/;

export function middleware(req: NextRequest) {
    const { pathname } = req.nextUrl;

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
        return;
    }

    // 2. Check if the pathname already has a supported locale
    const pathnameHasLocale = i18n.locales.some(
        (locale) => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`
    );

    // 3. REWRITE STRATEGY (Localization Fixes):
    // Map localized paths (e.g. /tr/magazalar) to internal folder structures (e.g. /tr/stores)
    if (pathname.startsWith('/tr/')) {
        const trRewrites: Record<string, string> = {
            '/tr/magazalar': '/tr/stores',
            '/tr/hakkimizda': '/tr/about',
            '/tr/iletisim': '/tr/contact',
            '/tr/blog': '/tr/blog', // No change needed but good for completeness
            '/tr/hizmetler': '/tr/services',
            '/tr/urunler': '/tr/products',
            '/tr/kariyer': '/tr/jobs', // 'careers' folder is 'jobs' or 'careers'? List says 'jobs' and 'careers' both exist in directory list. Footer uses #careers usually or /careers. Directory list has 'careers' AND 'jobs'.
            '/tr/gizlilik-politikasi': '/tr/privacy',
            '/tr/kullanim-sartlari': '/tr/terms',
            '/tr/cerez-politikasi': '/tr/cookies',
            '/tr/garanti': '/tr/warranty',
            '/tr/destek': '/tr/support',
            '/tr/sss': '/tr/faq',
            '/tr/siparis-takip': '/tr/track-order',
            '/tr/bayilik': '/tr/franchise',
            '/tr/kurumsal': '/tr/business',
            '/tr/geri-alim': '/tr/buyback',
            '/tr/onarim': '/tr/repair',
        };

        // Check for exact matches first
        if (trRewrites[pathname]) {
            const url = req.nextUrl.clone();
            url.pathname = trRewrites[pathname];
            return NextResponse.rewrite(url);
        }

        // Check for sub-path matches (e.g. /tr/magazalar/schaerbeek)
        for (const [trPath, enPath] of Object.entries(trRewrites)) {
            if (pathname.startsWith(`${trPath}/`)) {
                const url = req.nextUrl.clone();
                url.pathname = pathname.replace(trPath, enPath);
                return NextResponse.rewrite(url);
            }
        }
    }

    if (pathnameHasLocale) return;

    // 4. REDIRECT STRATEGY:
    // We explicitly redirect to the default locale to ensure SEO consistency
    // and avoid duplicate content issues at the root path.
    const locale = i18n.defaultLocale;
    const url = req.nextUrl.clone();
    url.pathname = `/${locale}${pathname}`;

    return NextResponse.redirect(url);
}

export const config = {
    matcher: [
        // Optimized matcher: Skip all dot-files (images, etc) and internal routes
        '/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)',
    ],
};
