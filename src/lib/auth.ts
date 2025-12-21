import { NextRequest } from 'next/server';

/**
 * Basic security check for admin API routes.
 * Checks for the presence and validity of the X-Admin-Token header.
 */
export function verifyAdminToken(request: NextRequest): boolean {
    const adminToken = process.env.ADMIN_API_KEY;

    // If no key is configured, block all requests for safety
    if (!adminToken) {
        console.error('[AUTH] ADMIN_API_KEY is not configured in environment variables.');
        return false;
    }

    const token = request.headers.get('X-Admin-Token');
    return token === adminToken;
}
