
import { google } from 'googleapis';
import fs from 'fs';

async function submitSitemap() {
    const auth = new google.auth.GoogleAuth({
        keyFile: process.env.GOOGLE_APPLICATION_CREDENTIALS || 'C:/Users/omero/Downloads/belmobile-firebase-d2b49fe21b90.json',
        scopes: ['https://www.googleapis.com/auth/webmasters'],
    });

    const searchConsole = google.webmasters({ version: 'v3', auth });

    const siteUrl = 'sc-domain:belmobile.be';
    const sitemapUrl = 'https://belmobile.be/sitemap.xml';

    try {
        console.log(`🚀 Submitting sitemap ${sitemapUrl} for ${siteUrl}...`);
        await searchConsole.sitemaps.submit({
            siteUrl,
            feedpath: sitemapUrl,
        });
        console.log('✅ Sitemap submitted successfully!');
    } catch (error) {
        console.error('❌ Error submitting sitemap:', error.message);
        if (error.message.includes('not have sufficient permission')) {
            console.log('👉 Make sure the service account email is added as an OWNER in GSC.');
        }
    }
}

submitSitemap();
