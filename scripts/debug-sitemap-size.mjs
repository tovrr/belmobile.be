
import { getAllDevices } from './src/services/server/pricing.dal.js';
import { LOCATIONS } from './src/app/data/locations.js';

const LANGUAGES = ['fr', 'nl', 'en', 'tr'];

async function check() {
    try {
        const devices = await getAllDevices();
        console.log('Total Devices:', devices.length);

        let repairUrls = 0;
        for (const d of devices) {
            repairUrls += LANGUAGES.length; // Generic
            repairUrls += LANGUAGES.length * LOCATIONS.length; // Per location
        }

        console.log('Total Repair URLs in sitemap:', repairUrls);
        const estimatedSizeMB = (repairUrls * 1.5) / 1024; // 1.5KB per URL is a safe estimate for XML with 4 hreflangs
        console.log('Estimated Repair XML Size:', estimatedSizeMB.toFixed(2), 'MB');
    } catch (e) {
        console.error(e);
    }
}

check();
