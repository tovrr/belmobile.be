import { MetadataRoute } from 'next';

/**
 * ROBOTS.TXT CONFIGURATION
 * Directs crawlers to the dynamic sitemap and protects private directories.
 */
export default function robots(): MetadataRoute.Robots {
    const getBaseUrl = () => {
        let url = process.env.NEXT_PUBLIC_BASE_URL || 'https://belmobile.be';
        if (!url.startsWith('http')) {
            url = `https://${url}`;
        }
        return url.replace(/\/$/, '');
    };
    const BASE_URL = getBaseUrl();

    return {
        rules: {
            userAgent: '*',
            allow: '/',
            disallow: [
                '/api/',
                '/admin/',
                '/_next/',
                '/static/',
                '/monitoring/',
                '/protected/',
                '/*?', // Disallow crawling search results/parameterized pages to save crawl budget
            ],
        },
        sitemap: `${BASE_URL}/sitemap.xml`,
    };
}
