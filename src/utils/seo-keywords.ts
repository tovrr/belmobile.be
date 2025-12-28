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
    if (brand) {
        keywords.push(brand);
        if (lang === 'fr') keywords.push(`réparation ${brand} bruxelles`);
        if (lang === 'nl') keywords.push(`reparatie ${brand} brussel`);

        // Generic Apple -> iPhone association
        if (brand.toLowerCase() === 'apple') {
            keywords.push('iphone', 'ipad', 'macbook');
            if (lang === 'fr') keywords.push('réparation iphone bruxelles', 'réparation écran iphone');
            if (lang === 'nl') keywords.push('iphone reparatie brussel', 'iphone scherm repareren');
        }
    }

    if (model) {
        // Smart Model Name: Remove Brand if already in Model (e.g. "Sony Xperia" -> keep as is, "Xperia" -> check)
        // Actually, simple check: does model start with brand?
        let smartModel = model;
        // Logic handled better by just using the model as provided if it already contains the brand,
        // but often 'model' passed here is just the slug-converted name.
        // Let's rely on the passed 'model' usually being precise enough, EXCEPT if we prepend Brand to it manually.

        // Push the raw model
        keywords.push(model);

        // General iPhone Logic (High Volume)
        if (model.toLowerCase().includes('iphone')) {
            keywords.push('iphone', 'apple iphone');
            // 'model' here is likely 'iPhone 13', so 'réparation iPhone 13' is fine.
            if (lang === 'fr') keywords.push(`réparation ${model} bruxelles`, 'écran iphone', 'batterie iphone', 'face id');
            if (lang === 'nl') keywords.push(`reparatie ${model} brussel`, 'iphone scherm', 'iphone batterij');
        }

        // Smart Combination Logic for other brands
        // If brand=Samsung, model=Galaxy S23. "réparation Samsung Galaxy S23" is good.
        // If brand=Sony, model=Sony Xperia. "réparation Sony Sony Xperia" is BAD.
        else {
            let combinedName = `${brand} ${model}`;
            if (brand && model.toLowerCase().startsWith(brand.toLowerCase())) {
                combinedName = model;
            }

            if (lang === 'fr') keywords.push(`réparation ${combinedName} bruxelles`);
            if (lang === 'nl') keywords.push(`reparatie ${combinedName} brussel`);
        }

        // Console variations
        if (model.toLowerCase().includes('playstation 5')) keywords.push('ps5', 'sony ps5', 'playstation 5', 'dualsense');
        if (model.toLowerCase().includes('playstation 4')) keywords.push('ps4', 'sony ps4', 'dualshock 4');
        if (model.toLowerCase().includes('switch')) keywords.push('nintendo switch', 'joycon', 'joy-con', 'drift');
    }

    // Console Category Specific
    if (category && (category.includes('console') || category === 'game-console')) {
        keywords.push('console', 'gaming');
        if (lang === 'fr') keywords.push('hdmi', 'port hdmi', 'surchauffe', 'nettoyage console', 'manette', 'réparation console bruxelles');
        if (lang === 'nl') keywords.push('hdmi poort', 'oververhitting', 'console reiniging', 'controller', 'console reparatie brussel');
        if (lang === 'en') keywords.push('hdmi port', 'overheating', 'console cleaning', 'controller');
    }

    // 4. Location Combinations
    // 4. Location Combinations
    keywords.push(location);

    if (lang === 'fr') {
        keywords.push('magasin gsm bruxelles');

        if (serviceId === 'buyback' || !serviceId) {
            keywords.push('rachat gsm bruxelles', 'vendre gsm bruxelles', 'reprise mobile bruxelles', 'vendre iphone bruxelles');
            keywords.push(`rachat ${brand || 'smartphone'} ${location}`);
        }

        if (serviceId === 'repair' || !serviceId) {
            keywords.push(`réparation ${brand || 'smartphone'} ${location}`);
            keywords.push('réparation iphone bruxelles', 'réparation écran bruxelles');
        }
    }

    if (lang === 'nl') {
        keywords.push('gsm winkel brussel');

        if (serviceId === 'buyback' || !serviceId) {
            keywords.push('gsm inkoop brussel', 'gsm verkopen brussel', 'iphone verkopen brussel');
            keywords.push(`inkoop ${brand || 'smartphone'} ${location}`);
        }

        if (serviceId === 'repair' || !serviceId) {
            keywords.push(`reparatie ${brand || 'smartphone'} ${location}`);
            keywords.push('gsm winkel brussel', 'iphone reparatie brussel', 'scherm reparatie brussel');
        }
    }

    return [...new Set(keywords)]; // Remove duplicates
};

export const generateMetaKeywords = (tags: string[]): string => {
    return tags.join(', ');
};
