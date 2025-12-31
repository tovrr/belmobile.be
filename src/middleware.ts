import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { i18n } from './i18n-config';

const PUBLIC_FILE = /\.(.*)$/;

export function middleware(req: NextRequest) {
    const { pathname } = req.nextUrl;

    // 1. Skip if it's an internal Next.js request, API, or static file
    if (
        pathname.startsWith('/_next') ||
        pathname.startsWith('/api') ||
        pathname.startsWith('/monitoring') || // Sentry tunnel handled by Next.js rewrites
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

    if (pathnameHasLocale) return;

    // 3. PROXY/REWRITE STRATEGY:
    // Instead of redirecting (changing the URL in the browser), 
    // we internally REWRITE to the default locale. 
    // This acts as a transparent proxy.
    const locale = i18n.defaultLocale;
    const url = req.nextUrl.clone();
    url.pathname = `/${locale}${pathname}`;

    return NextResponse.rewrite(url);
}

export const config = {
    matcher: [
        // Optimized matcher: Skip all dot-files (images, etc) and internal routes
        '/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)',
    ],
};
