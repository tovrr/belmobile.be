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
        if (lang === 'fr') keywords.push('réparation', 'réparer', 'écran', 'brisé', 'cassé', 'batterie', 'remplacement', 'prix', 'pas cher', 'gsm', 'téléphone', 'mobile');
        if (lang === 'nl') keywords.push('reparatie', 'repareren', 'scherm', 'vervangen', 'glas', 'batterij', 'kosten', 'goedkoop', 'gsm', 'telefoon', 'mobiel');
        if (lang === 'en') keywords.push('repair', 'fix', 'screen', 'broken', 'replacement', 'battery', 'cost', 'cheap', 'mobile', 'cell phone');
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
    // Console Home (PS5, Xbox)
    if (category === 'console_home') {
        keywords.push('console', 'gaming', 'ps5', 'xbox', 'playstation');
        if (lang === 'fr') keywords.push('hdmi', 'port hdmi', 'surchauffe', 'nettoyage console', 'réparation console salon');
        if (lang === 'nl') keywords.push('hdmi poort', 'oververhitting', 'console reiniging', 'spelconsole herstellen');
        if (lang === 'en') keywords.push('hdmi port', 'overheating', 'console cleaning', 'home console repair');

        if (serviceId === 'buyback') {
            if (lang === 'fr') keywords.push('rachat console', 'vendre ps5', 'reprise xbox');
            if (lang === 'nl') keywords.push('console verkopen', 'ps5 inkoop', 'xbox inruilen');
            if (lang === 'en') keywords.push('sell console', 'sell ps5', 'trade-in xbox');
        }
    }

    // Console Portable (Switch, 3DS)
    if (category === 'console_portable') {
        keywords.push('switch', 'nintendo switch', 'switch lite', 'switch oled', 'nintendo 3ds');
        if (lang === 'fr') keywords.push('joystick', 'écran switch', 'connecteur charge', 'réparation nintendo', 'console portable');
        if (lang === 'nl') keywords.push('joystick', 'scherm switch', 'laadconnector', 'nintendo herstellen', 'handheld console');
        if (lang === 'en') keywords.push('joystick', 'switch screen', 'charging port', 'nintendo repair', 'handheld console');

        if (serviceId === 'buyback') {
            if (lang === 'fr') keywords.push('rachat switch', 'vendre nintendo', 'reprise 3ds');
            if (lang === 'nl') keywords.push('switch verkopen', 'nintendo inkoop', '3ds verkoop');
            if (lang === 'en') keywords.push('sell switch', 'sell nintendo', 'trade-in 3ds');
        }
    }

    // Tablet Keywords
    if (category === 'tablet') {
        if (lang === 'fr') keywords.push('tablette', 'ipad', 'vitre tablette');
        if (lang === 'nl') keywords.push('tablet', 'ipad', 'scherm tablet');
        if (lang === 'en') keywords.push('tablet', 'ipad');

        if (serviceId === 'buyback') {
            if (lang === 'fr') keywords.push('rachat tablette', 'vendre ipad', 'reprise tablette');
            if (lang === 'nl') keywords.push('tablet verkopen', 'ipad inkoop', 'oude tablet inruilen');
            if (lang === 'en') keywords.push('sell tablet', 'sell ipad', 'trade-in tablet');
        }
    }

    // Laptop Keywords
    if (category === 'laptop') {
        keywords.push('macbook', 'macbook pro', 'macbook air', 'galaxy book', 'samsung laptop');
        if (lang === 'fr') keywords.push('ordinateur portable', 'réparation mac', 'écran macbook', 'clavier', 'batterie mac');
        if (lang === 'nl') keywords.push('laptop', 'macbook herstellen', 'scherm macbook', 'toetsenbord', 'batterij mac');
        if (lang === 'en') keywords.push('laptop', 'mac repair', 'macbook screen', 'keyboard', 'mac battery');

        if (serviceId === 'buyback') {
            if (lang === 'fr') keywords.push('rachat macbook', 'vendre mac', 'reprise galaxy book');
            if (lang === 'nl') keywords.push('macbook verkopen', 'mac inkoop', 'galaxy book inruilen');
            if (lang === 'en') keywords.push('sell macbook', 'sell mac', 'trade-in galaxy book');
        }
    }

    // Smartwatch Keywords
    if (category === 'smartwatch') {
        if (lang === 'fr') keywords.push('montre connectée', 'apple watch');
        if (lang === 'nl') keywords.push('smartwatch', 'apple watch', 'slimme horloge');
        if (lang === 'en') keywords.push('smartwatch', 'apple watch');

        if (serviceId === 'buyback') {
            if (lang === 'fr') keywords.push('rachat apple watch', 'vendre montre', 'reprise smartwatch');
            if (lang === 'nl') keywords.push('apple watch verkopen', 'smartwatch inkoop');
            if (lang === 'en') keywords.push('sell apple watch', 'trade-in smartwatch');
        }
    }

    // 4. Location Combinations
    // 4. Location Combinations
    keywords.push(location);

    const isPhoneContext = !category || category === 'smartphone';

    if (lang === 'fr') {
        if (isPhoneContext) keywords.push('magasin gsm bruxelles');
        const entity = brand || (category === 'tablet' ? 'tablette' : category === 'laptop' ? 'ordinateur' : category === 'console_home' ? 'console salon' : category === 'console_portable' ? 'console portable' : 'appareil');

        if (serviceId === 'buyback' || !serviceId) {
            if (isPhoneContext) keywords.push('rachat gsm bruxelles', 'vendre gsm bruxelles', 'reprise mobile bruxelles', 'vendre iphone bruxelles');
            keywords.push(`rachat ${entity} ${location}`);
        }

        if (serviceId === 'repair' || !serviceId) {
            keywords.push(`réparation ${entity} ${location}`);
            if (isPhoneContext) keywords.push('réparation iphone bruxelles', 'réparation écran bruxelles');
        }
    }

    if (lang === 'nl') {
        if (isPhoneContext) keywords.push('gsm winkel brussel');
        const entity = brand || (category === 'tablet' ? 'tablet' : category === 'laptop' ? 'laptop' : category === 'console_home' ? 'spelconsole' : category === 'console_portable' ? 'handheld console' : 'toestel');

        if (serviceId === 'buyback' || !serviceId) {
            if (isPhoneContext) keywords.push('gsm inkoop brussel', 'gsm verkopen brussel', 'iphone verkopen brussel');
            keywords.push(`inkoop ${entity} ${location}`);
        }

        if (serviceId === 'repair' || !serviceId) {
            keywords.push(`reparatie ${entity} ${location}`);
            if (isPhoneContext) keywords.push('gsm winkel brussel', 'iphone reparatie brussel', 'scherm reparatie brussel');
        }
    }

    return [...new Set(keywords)]; // Remove duplicates
};

export const generateMetaKeywords = (tags: string[]): string => {
    return tags.join(', ');
};
