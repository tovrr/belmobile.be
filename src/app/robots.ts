import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://belmobile.be';
    const isStaging = baseUrl.includes('dev.') || baseUrl.includes('vercel.app');

    if (isStaging) {
        return {
            rules: {
                userAgent: '*',
                disallow: '/',
            },
        };
    }

    return {
        rules: {
            userAgent: '*',
            allow: '/',
            disallow: [
                '/admin/',
                '/api/',
                '/_next/',
                '/server-sitemap.xml',
            ],
        },
        sitemap: `${baseUrl}/sitemap.xml`,
    };
}
