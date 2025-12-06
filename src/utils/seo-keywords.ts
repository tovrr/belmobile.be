// Keywords Helpers
export const getKeywordsForPage = (
    lang: string,
    serviceId?: string,
    brand?: string,
    model?: string,
    category?: string
): string[] => {
    const keywords: string[] = [];
    const location = lang === 'fr' ? 'Bruxelles' : lang === 'nl' ? 'Brussel' : 'Brussels';

    // 1. Core Service Keywords (from CSV analysis)
    if (serviceId === 'repair') {
        if (lang === 'fr') keywords.push('réparation', 'réparer', 'écran', 'brisé', 'cassé', 'batterie', 'remplacement', 'prix', 'pas cher');
        if (lang === 'nl') keywords.push('reparatie', 'repareren', 'scherm', 'vervangen', 'glas', 'batterij', 'kosten', 'goedkoop');
        if (lang === 'en') keywords.push('repair', 'fix', 'screen', 'broken', 'replacement', 'battery', 'cost', 'cheap');
    } else if (serviceId === 'buyback') {
        if (lang === 'fr') keywords.push('rachat', 'vendre', 'revendre', 'reprise', 'recyclage', 'estimation', 'cash');
        if (lang === 'nl') keywords.push('inkoop', 'verkopen', 'inruilen', 'recycling', 'waarde', 'contant');
        if (lang === 'en') keywords.push('buyback', 'sell', 'trade-in', 'recycle', 'value', 'cash');
    }

    // 2. Multimedia Boxes (Boitier Android) - Explicit Niche
    if (category === 'multimedia-box' || (!category && !serviceId)) { // Homepage or specific category
        if (lang === 'fr') keywords.push('boitier android', 'smart tv box', 'multimédia', 'streaming box', '4k');
        if (lang === 'nl') keywords.push('android box', 'smart tv', 'mediaspeler', 'streaming');
        if (lang === 'en') keywords.push('android box', 'smart tv box', 'streaming player', 'media center');
    }

    // 3. Device Specifics
    if (brand) keywords.push(brand);
    if (model) {
        keywords.push(model);
        // "iPhone 11" specific combos (High Volume)
        if (model.toLowerCase().includes('iphone 11')) {
            if (lang === 'fr') keywords.push('écran iphone 11', 'batterie iphone 11', 'réparation iphone 11');
            if (lang === 'nl') keywords.push('iphone 11 scherm', 'iphone 11 batterij');
        }
    }

    // 4. Location Combinations
    keywords.push(location);
    if (lang === 'fr') {
        keywords.push(`réparation ${brand || 'téléphone'} ${location}`);
        keywords.push('magasin gsm bruxelles');
    }

    return [...new Set(keywords)]; // Remove duplicates
};

export const generateMetaKeywords = (tags: string[]): string => {
    return tags.join(', ');
};
