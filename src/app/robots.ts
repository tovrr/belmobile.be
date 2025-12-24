import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://belmobile.be';

    return {
        rules: {
            userAgent: '*',
            allow: '/',
            disallow: [
                '/admin/',
                '/api/',
                '/_next/',
                '/server-sitemap.xml', // If we have one
            ],
        },
        sitemap: `${baseUrl}/sitemap.xml`,
    };
}
