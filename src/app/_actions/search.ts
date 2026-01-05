'use server';

import { getAllDevices, getPriceQuote } from '../../services/server/pricing.dal';
import { slugToDisplayName } from '../../utils/slugs';

interface SearchResult {
    id: string;
    label: string;
    price: number;
    brand: string;
    model: string;
}

export async function searchDevices(query: string): Promise<SearchResult[]> {
    if (!query || query.length < 2) return [];

    // 1. Get All Devices (Cached)
    const allSlugs = await getAllDevices();
    const lowerQ = query.toLowerCase();

    // 2. Filter Client-Side (Fast enough for <1000 items)
    // We strip common prefixes to ensure good matching
    const matches = allSlugs.filter(slug => {
        // EXCLUDE internal component docs (e.g. "iphone-11_antenna_base")
        if (slug.includes('_')) return false;

        const clean = slug.replace('apple-', '').replace('samsung-', '');
        return clean.includes(lowerQ);
    }).slice(0, 50); // Limit to top 50 matches

    // 3. Hydrate with Real Prices (Parallel)
    const results = await Promise.all(matches.map(async (slug) => {
        const quote = await getPriceQuote(slug);
        const displayName = slugToDisplayName(slug);

        // Extract Brand/Model for UI
        const parts = slug.split('-');
        const brand = parts[0];
        const model = parts.slice(1).join(' '); // Rough approximation

        return {
            id: slug,
            label: displayName,
            price: quote?.buyback.maxPrice || 0,
            brand: brand.charAt(0).toUpperCase() + brand.slice(1),
            model: model
        };
    }));

    // 4. Sort by Price Descending (Popular/High-value items first usually)
    return results.sort((a, b) => b.price - a.price);
}
