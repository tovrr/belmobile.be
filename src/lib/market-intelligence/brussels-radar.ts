import { db } from '../../firebase';
import { doc, getDoc, setDoc, collection, query, where, getDocs } from 'firebase/firestore';

export interface CompetitorPrice {
    competitor: string;
    product: string; // e.g. "iPhone 13 Screen"
    price: number;
    url: string;
    lastUpdated: string;
    type: 'screen_original' | 'screen_generic' | 'battery' | 'unknown';
}

export const BRUSSELS_COMPETITORS = [
    {
        id: 'fixnow',
        name: 'Fixnow',
        domain: 'fixnow.be',
        searchQuery: (device: string) => `site:fixnow.be "${device}" screen repair price`,
        // Mock regex for demonstration if we had raw HTML
        priceRegex: /€\s*(\d+)/
    },
    {
        id: 'repairclub',
        name: 'The Repair Club',
        domain: 'repairclub.be',
        searchQuery: (device: string) => `site:repairclub.be "${device}" herstelling prijs`
    },
    {
        id: 'mistergenius',
        name: 'Mister Genius',
        domain: 'mistergenius.be',
        searchQuery: (device: string) => `site:mistergenius.be "${device}" reparation`
    }
];

/**
 * Seeding Function to inject manual intelligence or scraped data
 */
export async function seedCompetitorData(prices: CompetitorPrice[]) {
    const batchPromises = prices.map(p => {
        // Create a unique ID for this price point
        const id = `${p.competitor}_${p.product.replace(/\s+/g, '_').toLowerCase()}`;
        return setDoc(doc(db, 'market_radar', id), p, { merge: true });
    });

    await Promise.all(batchPromises);
    console.log(`[BrusselsRadar] Seeded ${prices.length} prices.`);
}

/**
 * Fetch Radar Data for a specific device model
 */
export async function getCompetitorPrices(modelName: string) {
    // In a real automated system, this would query the 'market_radar' collection
    // where we store the results of our background scrapers.
    try {
        const pricesRef = collection(db, 'market_radar');
        // Simple client-side filtering or exact match if we standardise product names
        const q = query(pricesRef);
        const snap = await getDocs(q);

        const results: CompetitorPrice[] = [];
        snap.forEach(doc => {
            const data = doc.data() as CompetitorPrice;
            if (data.product.toLowerCase().includes(modelName.toLowerCase())) {
                results.push(data);
            }
        });
        if (results.length === 0 && modelName.toLowerCase().includes('iphone 13')) {
            // DEMO MODE: Start
            return [
                { competitor: 'Fixnow', product: 'iPhone 13 Glass', price: 159, url: 'https://fixnow.be', lastUpdated: new Date().toISOString(), type: 'screen_generic' },
                { competitor: 'Fixnow', product: 'iPhone 13 Original', price: 189, url: 'https://fixnow.be', lastUpdated: new Date().toISOString(), type: 'screen_original' },
                { competitor: 'Mister Genius', product: 'iPhone 13 Screen', price: 219, url: 'https://mistergenius.be', lastUpdated: new Date().toISOString(), type: 'screen_generic' }
            ];
            // DEMO MODE: End
        }
        return results;
    } catch (error) {
        console.error("Error fetching competitor prices:", error);
        return [];
    }
}
