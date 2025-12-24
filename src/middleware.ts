import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
    const { pathname, searchParams } = request.nextUrl;
    const hostname = request.headers.get('host') || '';

    // Only target the staging domain (dev.belmobile.be)
    const isStaging = hostname.includes('dev.') || hostname.includes('vercel.app');

    if (!isStaging) {
        return NextResponse.next();
    }

    // Paths to exclude from protection
    const isProtectedPath = !pathname.includes('/_next') &&
        !pathname.includes('/api/') &&
        !pathname.includes('/favicon.ico') &&
        !pathname.startsWith('/protected');

    if (!isProtectedPath) {
        return NextResponse.next();
    }

    // Check for the staging access cookie
    const hasAccess = request.cookies.has('staging_access_granted');
    const pinParam = searchParams.get('pin');

    // SECRET PIN (User requested random/simple with hint)
    // [HINT]: Middle row down
    const STAGING_PIN = '2580';

    // If user provides the correct PIN via URL
    if (pinParam === STAGING_PIN) {
        const response = NextResponse.next();
        response.cookies.set('staging_access_granted', 'true', {
            maxAge: 60 * 60 * 24 * 7, // 1 week
            path: '/',
        });
        return response;
    }

    // If already has access cookie
    if (hasAccess) {
        return NextResponse.next();
    }

    // Otherwise, redirect to the custom protected landing page
    // We pass the original URL to return to after PIN entry
    const url = request.nextUrl.clone();
    url.pathname = '/fr/protected'; // Default to FR for protection page
    return NextResponse.redirect(url);
}

export const config = {
    matcher: [
        // Match all request paths except for the ones starting with:
        // - api (API routes)
        // - _next/static (static files)
        // - _next/image (image optimization files)
        // - favicon.ico (favicon file)
        '/((?!api|_next/static|_next/image|favicon.ico).*)',
    ],
};
