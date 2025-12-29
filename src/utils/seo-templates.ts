
import { slugToDisplayName } from './slugs';

interface SeoContext {
    lang: 'fr' | 'nl' | 'en';
    serviceId: 'repair' | 'buyback';
    deviceValue?: string;
    deviceModel?: string;
    deviceCategory?: string; // e.g. 'smartphone', 'tablet', 'console'
    locationName?: string; // "Schaerbeek", "Brussels"
    isHomeConsole?: boolean;
    isPortableConsole?: boolean;
}

// Simple deterministic hash
const getDeterministicIndex = (str: string | undefined, max: number): number => {
    if (!str) return 0;
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        hash = ((hash << 5) - hash) + str.charCodeAt(i);
        hash |= 0; // Convert to 32bit integer
    }
    return Math.abs(hash) % max;
};

// --- Value Props & Suffixes ---

const getRepairSuffix = (ctx: SeoContext): string => {
    const { lang, isHomeConsole, isPortableConsole } = ctx;
    if (isHomeConsole) {
        if (lang === 'fr') return ': Prix HDMI & Nettoyage';
        if (lang === 'nl') return ': Prijs HDMI & Reiniging';
        return ': HDMI & Cleaning Price';
    }
    if (isPortableConsole) {
        if (lang === 'fr') return ': Prix Écran & Joystick';
        if (lang === 'nl') return ': Prijs Scherm & Joystick';
        return ': Screen & Joystick Price';
    }
    // Mobile/Tablet/Laptop default
    if (lang === 'fr') return ': Prix Écran & Batterie';
    if (lang === 'nl') return ': Prijs Scherm & Batterij';
    return ': Screen & Battery Price';
};

const getBuybackSuffix = (ctx: SeoContext): string => {
    const { lang } = ctx;
    if (lang === 'fr') return ': Meilleur Prix Reprise';
    if (lang === 'nl') return ': Beste Inruilprijs';
    return ': Best Trade-in Price';
};

// --- Templates ---

export const generateSeoMetadata = (ctx: SeoContext) => {
    const { lang, serviceId, deviceValue, deviceModel, deviceCategory, locationName } = ctx;

    // 1. Prepare Variables
    const brand = deviceValue ? deviceValue.charAt(0).toUpperCase() + deviceValue.slice(1) : '';
    const model = deviceModel ? slugToDisplayName(deviceModel) : '';

    // "Display Name" logic
    let deviceName = model;
    if (!deviceName) {
        // Fallback generic
        const generic = serviceId === 'repair'
            ? (lang === 'fr' ? (deviceCategory === 'smartphone' ? 'Smartphone' : deviceCategory === 'tablet' ? 'Tablette' : deviceCategory === 'laptop' ? 'Ordinateur' : deviceCategory === 'smartwatch' ? 'Montre Connectée' : deviceCategory === 'console_home' ? 'Console de Salon' : deviceCategory === 'console_portable' ? 'Console Portable' : 'Appareil')
                : lang === 'nl' ? (deviceCategory === 'smartphone' ? 'Smartphone' : deviceCategory === 'tablet' ? 'Tablet' : deviceCategory === 'laptop' ? 'Laptop' : deviceCategory === 'smartwatch' ? 'Smartwatch' : deviceCategory === 'console_home' ? 'Spelconsole' : deviceCategory === 'console_portable' ? 'Handheld Console' : 'Toestel')
                    : (deviceCategory === 'smartphone' ? 'Smartphone' : deviceCategory === 'tablet' ? 'Tablet' : deviceCategory === 'laptop' ? 'Laptop' : deviceCategory === 'smartwatch' ? 'Smartwatch' : deviceCategory === 'console_home' ? 'Home Console' : deviceCategory === 'console_portable' ? 'Handheld Console' : 'Device'))
            : (lang === 'fr' ? (deviceCategory === 'smartphone' ? 'Smartphone' : deviceCategory === 'tablet' ? 'Tablette' : deviceCategory === 'laptop' ? 'Ordinateur' : deviceCategory === 'smartwatch' ? 'Montre Connectée' : deviceCategory === 'console_home' ? 'Console de Salon' : deviceCategory === 'console_portable' ? 'Console Portable' : 'Appareil')
                : lang === 'nl' ? (deviceCategory === 'smartphone' ? 'Smartphone' : deviceCategory === 'tablet' ? 'Tablet' : deviceCategory === 'laptop' ? 'Laptop' : deviceCategory === 'smartwatch' ? 'Smartwatch' : deviceCategory === 'console_home' ? 'Spelconsole' : deviceCategory === 'console_portable' ? 'Handheld Console' : 'Toestel')
                    : (deviceCategory === 'smartphone' ? 'Smartphone' : deviceCategory === 'tablet' ? 'Tablet' : deviceCategory === 'laptop' ? 'Laptop' : deviceCategory === 'smartwatch' ? 'Smartwatch' : deviceCategory === 'console_home' ? 'Home Console' : deviceCategory === 'console_portable' ? 'Handheld Console' : 'Device'));
        deviceName = brand || generic;
    } else {
        // Optimization: If model doesn't start with Brand, prepend it if it feels "short" or generic, 
        // BUT for SEO matching "iPhone 13" is often better than "Apple iPhone 13". 
        // Let's stick to the model name if it exists, as it's the strongest keyword.
        // However, for Title variations, sometimes we WANT "Apple iPhone 13".
    }

    const fullDeviceName = (brand && model && !model.toLowerCase().startsWith(brand.toLowerCase()))
        ? `${brand} ${model}`
        : (model || brand || deviceName);

    const loc = locationName || (lang === 'fr' ? 'Bruxelles' : lang === 'nl' ? 'Brussel' : 'Brussels');

    // Deterministic Seed: Use Model if available (most specific), else Brand
    const seed = model || brand || 'default';

    // Helper for "votre" context (Common nouns lowercase in FR)
    const isCommonNoun = !brand && !model;
    const deviceNameLC = (lang === 'fr' && isCommonNoun) ? deviceName.toLowerCase() : deviceName;
    const fullDeviceNameLC = (lang === 'fr' && isCommonNoun) ? fullDeviceName.toLowerCase() : fullDeviceName;

    // --- TITLES ---
    let title = '';

    // Brand refinements: Enhance display name when only Brand is selected (Step 2)
    if (!model && brand) {
        const b = brand.toLowerCase();
        if (b === 'apple') deviceName = 'iPhone, iPad & Mac';
        else if (b === 'samsung') deviceName = 'Samsung Galaxy';
        else if (b === 'google') deviceName = 'Google Pixel';
        else if (b === 'sony') deviceName = 'Sony PlayStation / Xperia';
        else if (b === 'microsoft') deviceName = 'Microsoft Xbox / Surface';
        else if (b === 'nintendo') deviceName = 'Nintendo Switch';
        else if (b === 'oneplus') deviceName = 'OnePlus Smartphone';
        else if (b === 'huawei') deviceName = 'Huawei Smartphone';
        else if (b === 'xiaomi') deviceName = 'Xiaomi Smartphone';
        else if (b === 'oppo') deviceName = 'Oppo Smartphone';
    }



    if (serviceId === 'repair') {
        const suffix = getRepairSuffix(ctx); // e.g. ": Prix Écran & Batterie"

        if (lang === 'fr') {
            const templates = [
                // Var 1: High Intent (Classic)
                `Réparation ${deviceName} ${loc} ${suffix}`,
                // Var 2: Question/Problem (Excellent CTR)
                `${deviceName} cassé ? Réparation à ${loc} - Belmobile`,
                // Var 3: Speed/Trust
                `Réparation ${fullDeviceName} en 30 min à ${loc}`,
                // Var 4: Expert focus
                `Spécialiste de votre ${deviceNameLC} à ${loc} : Devis Gratuit`
            ];

            // Only add GSM/Telephone synonyms if category is smartphone or if it's the generic repair page
            const isPhoneContext = deviceCategory === 'smartphone';
            if (isPhoneContext) {
                templates.push(
                    `Réparation GSM & Téléphone à ${loc} - Belmobile`,
                    `Magasin de Réparation GSM ${loc} : ${deviceName}`
                );
            } else if (!deviceCategory) {
                // If it's pure root /repair, add broad electronic repair
                templates.push(
                    `Réparation Multimédia & Électronique à ${loc}`,
                    `Atelier de Réparation ${loc} : Smartphone, PC, Console`
                );
            } else if (deviceCategory === 'tablet') {
                templates.push(
                    `Réparation Tablette & iPad à ${loc} - Belmobile`,
                    `Remplacement Vitre Tablette ${loc} : ${deviceName}`,
                    `Dépannage iPad et Tablette à ${loc}`
                );
            } else if (deviceCategory === 'laptop') {
                templates.push(
                    `Réparation Ordinateur Portable à ${loc} - PC & Mac`,
                    `Dépannage Informatique ${loc} : ${deviceName}`,
                    `Remplacement Écran & Batterie Laptop à ${loc}`
                );
            } else if (deviceCategory === 'smartwatch') {
                templates.push(
                    `Réparation Apple Watch & Montre Connectée à ${loc}`,
                    `Changement Vitre Smartwatch ${loc} : ${deviceName}`
                );
            } else if (deviceCategory === 'console_home') {
                templates.push(
                    `Réparation Console de Salon à ${loc} - PS5, Xbox`,
                    `Atelier Console ${loc} : ${deviceName} HDMI & Surchauffe`
                );
            } else if (deviceCategory === 'console_portable') {
                templates.push(
                    `Réparation Console Portable à ${loc} - Switch, Steam Deck`,
                    `Réparation Écran & Joystick ${deviceName} à ${loc}`
                );
            }
            const idx = getDeterministicIndex(seed, templates.length);
            title = templates[idx];
        } else if (lang === 'nl') {
            const templates = [
                // Var 1: High Intent
                `Reparatie ${deviceName} ${loc} ${suffix}`,
                // Var 2: Speed
                `${deviceName} Herstellen in ${loc} - Klaar in 30 min`,
                // Var 3: Expert
                `Uw experts voor ${fullDeviceName} in ${loc}`,
                // Var 4: Problem
                `${deviceName} scherm vervangen ${loc}? Belmobile`
            ];

            const isPhoneContext = deviceCategory === 'smartphone';
            if (isPhoneContext) {
                templates.push(
                    `GSM Reparatie ${loc} - Klaar terwijl u wacht`,
                    `Telefoon Winkel ${loc} : Reparatie & Onderhoud`
                );
            } else if (!deviceCategory) {
                templates.push(
                    `Elektronica Reparatie ${loc} - Smartphone, PC, Console`,
                    `Hersteldienst ${loc} : Alle Apparaten`
                );
            } else if (deviceCategory === 'tablet') {
                templates.push(
                    `Tablet & iPad Reparatie ${loc} - Belmobile`,
                    `Scherm Vervangen Tablet ${loc} : ${deviceName}`,
                    `iPad Herstellingen in ${loc}`
                );
            } else if (deviceCategory === 'laptop') {
                templates.push(
                    `Laptop Reparatie ${loc} - PC & Mac`,
                    `Computer Herstel ${loc} : ${deviceName}`,
                    `Laptop Scherm & Batterij Vervangen in ${loc}`
                );
            } else if (deviceCategory === 'smartwatch') {
                templates.push(
                    `Apple Watch & Smartwatch Reparatie ${loc}`,
                    `Smartwatch Glas Vervangen ${loc} : ${deviceName}`
                );
            } else if (deviceCategory === 'console_home') {
                templates.push(
                    `Spelconsole Reparatie ${loc} - PS5, Xbox`,
                    `Console Expert ${loc} : ${deviceName} HDMI & Reiniging`
                );
            } else if (deviceCategory === 'console_portable') {
                templates.push(
                    `Handheld Console Reparatie ${loc} - Switch, Steam Deck`,
                    `Scherm & Joystick Vervangen ${deviceName} in ${loc}`
                );
            }
            const idx = getDeterministicIndex(seed, templates.length);
            title = templates[idx];
        } else { // EN
            const templates = [
                `${deviceName} Repair ${loc} ${suffix}`,
                `Broken ${deviceName}? Fast Repair in ${loc}`,
                `${fullDeviceName} Screen Replacement ${loc}`,
                `Expert ${deviceName} Repair Service ${loc}`
            ];

            const isPhoneContext = deviceCategory === 'smartphone';
            if (isPhoneContext) {
                templates.push(
                    `Phone Repair ${loc} - Fast Service`,
                    `Smartphone Fix ${loc} : ${deviceName}`
                );
            } else if (!deviceCategory) {
                templates.push(
                    `Electronic Repair ${loc} - Smartphone, PC, Console`,
                    `Device Repair Shop ${loc}`
                );
            } else if (deviceCategory === 'tablet') {
                templates.push(
                    `Tablet & iPad Repair ${loc} - Belmobile`,
                    `Broken Tablet Screen? Fix in ${loc}`,
                    `iPad Repair Service ${loc}`
                );
            } else if (deviceCategory === 'laptop') {
                templates.push(
                    `Laptop Repair ${loc} - PC & MacBook`,
                    `Computer Fix ${loc} : ${deviceName}`,
                    `Laptop Screen & Battery Replacement ${loc}`
                );
            } else if (deviceCategory === 'smartwatch') {
                templates.push(
                    `Apple Watch & Smartwatch Repair ${loc}`,
                    `Smartwatch Screen Replacement ${loc} : ${deviceName}`
                );
            } else if (deviceCategory === 'console_home') {
                templates.push(
                    `Home Console Repair ${loc} - PS5, Xbox`,
                    `Console Fix ${loc} : ${deviceName} HDMI & Overheating`
                );
            } else if (deviceCategory === 'console_portable') {
                templates.push(
                    `Handheld Console Repair ${loc} - Switch, Steam Deck`,
                    `Screen & Joystick Fix ${deviceName} in ${loc}`
                );
            }
            const idx = getDeterministicIndex(seed, templates.length);
            title = templates[idx];
        }
    } else { // Buyback
        const suffix = getBuybackSuffix(ctx);

        if (lang === 'fr') {
            const templates = [
                // Var 1: Classic
                `Rachat ${deviceName} ${loc} ${suffix}`,
                // Var 2: Action
                `Vendez votre ${fullDeviceNameLC} au meilleur prix à ${loc}`,
                // Var 3: Estimation
                `Reprise ${deviceName} : Estimation immédiate à ${loc}`,
                // Var 4: Cash
                `Recyclage de votre ${deviceNameLC} à ${loc} - Payé Cash`
            ];

            const isPhoneContext = !deviceCategory || deviceCategory === 'smartphone';
            if (isPhoneContext) {
                templates.push(
                    `Rachat GSM & Smartphone à ${loc} - Cash Direct`,
                    `Vendre mon iPhone/Samsung à ${loc}`
                );
            } else if (!deviceCategory) {
                templates.push(
                    `Rachat Appareils Électroniques à ${loc}`,
                    `Recyclage Mobile & Multimédia à ${loc}`
                );
            } else if (deviceCategory === 'tablet') {
                templates.push(
                    `Rachat Tablette & iPad à ${loc} - Cash`,
                    `Vendre mon iPad à ${loc} - Estimation Gratuite`
                );
            } else if (deviceCategory === 'laptop') {
                templates.push(
                    `Rachat Ordinateur Portable à ${loc} - PC & Mac`,
                    `Vendre mon MacBook à ${loc} - Meilleur Prix`
                );
            } else if (deviceCategory === 'smartwatch') {
                templates.push(
                    `Rachat Apple Watch & Montre à ${loc}`,
                    `Vendre ma Smartwatch à ${loc}`
                );
            } else if (deviceCategory && deviceCategory.includes('console')) {
                templates.push(
                    `Rachat Console de Jeux à ${loc} - PS5, Switch`,
                    `Vendre ma Console à ${loc} - Cash immédiat`
                );
            }

            const idx = getDeterministicIndex(seed, templates.length);
            title = templates[idx];
        } else if (lang === 'nl') {
            const templates = [
                `Verkoop uw ${deviceName} ${loc} ${suffix}`,
                `Uw ${fullDeviceName} verkopen in ${loc}? Hoogste Prijs`,
                `Inkoop ${deviceName} ${loc} - Direct Cash`,
                `Waarde van uw ${deviceName}? Gratis taxatie in ${loc}`
            ];

            const isPhoneContext = !deviceCategory || deviceCategory === 'smartphone';
            if (isPhoneContext) {
                templates.push(
                    `GSM Verkopen in ${loc} - Direct Cash`,
                    `Oude Smartphone Inruilen ${loc}`
                );
            } else if (!deviceCategory) {
                templates.push(
                    `Elektronica Verkopen ${loc} - Smartphone, PC, Console`,
                    `Opkoper Elektronica ${loc}`
                );
            } else if (deviceCategory === 'tablet') {
                templates.push(
                    `Tablet & iPad Verkopen in ${loc}`,
                    `Uw iPad Inruilen ${loc} - Beste Prijs`
                );
            } else if (deviceCategory === 'laptop') {
                templates.push(
                    `Laptop Verkopen ${loc} - PC & MacBook`,
                    `Tweedehands Laptop Inkoop ${loc}`
                );
            } else if (deviceCategory === 'smartwatch') {
                templates.push(
                    `Apple Watch Verkopen ${loc}`,
                    `Smartwatch Inruilen ${loc}`
                );
            } else if (deviceCategory && deviceCategory.includes('console')) {
                templates.push(
                    `Game Console Verkopen ${loc} - PS5, Switch`,
                    `Console Inkoop ${loc} - Direct Geld`
                );
            }

            const idx = getDeterministicIndex(seed, templates.length);
            title = templates[idx];
        } else { // EN
            const templates = [
                `Sell ${deviceName} ${loc} ${suffix}`,
                `Sell your ${fullDeviceName} in ${loc} - Best Price`,
                `Trade-in ${deviceName} ${loc} - Instant Cash`,
                `Recycle ${deviceName} in ${loc} - Get Paid Today`
            ];

            const isPhoneContext = !deviceCategory || deviceCategory === 'smartphone';
            if (isPhoneContext) {
                templates.push(
                    `Sell Phone in ${loc} - Instant Cash`,
                    `Sell iPhone/Android ${loc} - Best Rates`
                );
            } else if (!deviceCategory) {
                templates.push(
                    `Sell Electronics in ${loc} - Phone, PC, Console`,
                    `Buyback Store ${loc} - We Buy Devices`
                );
            } else if (deviceCategory === 'tablet') {
                templates.push(
                    `Sell Tablet & iPad in ${loc}`,
                    `Trade-in iPad ${loc} - Cash Payment`
                );
            } else if (deviceCategory === 'laptop') {
                templates.push(
                    `Sell Laptop in ${loc} - PC & MacBook`,
                    `Cash for Laptops ${loc}`
                );
            } else if (deviceCategory === 'smartwatch') {
                templates.push(
                    `Sell Apple Watch ${loc}`,
                    `Trade-in Smartwatch ${loc}`
                );
            } else if (deviceCategory && deviceCategory.includes('console')) {
                templates.push(
                    `Sell Game Console ${loc} - PS5, Switch`,
                    `Console Trade-in ${loc} - Instant Cash`
                );
            }

            const idx = getDeterministicIndex(seed, templates.length);
            title = templates[idx];
        }
    }

    // --- DESCRIPTIONS ---
    // Rotate 2-3 sturdy descriptions to avoid duplication penalty
    let description = '';

    if (serviceId === 'repair') {
        const services = ctx.isHomeConsole
            ? (lang === 'fr' ? 'HDMI et nettoyage' : 'HDMI en reiniging')
            : (lang === 'fr' ? 'écran et batterie' : 'scherm en batterij');

        if (lang === 'fr') {
            const templates = [
                `Confiez votre ${fullDeviceName} aux experts de Belmobile à ${loc}. Réparation ${services} en 30 minutes. Garantie 1 an. Sans rendez-vous.`,
                `Besoin d'une réparation pour ${deviceName} ? Nous réparons votre appareil sur place à ${loc}. Prix transparents pour ${services}.`,
                `Votre ${fullDeviceName} est cassé ? Pas de panique. Belmobile ${loc} le remet à neuf en moins d'une heure. Garantie pièces et main d'œuvre.`
            ];
            // Use a DIFFERENT offset/salt for description so it doesn't always lock to the title choice
            const idx = getDeterministicIndex(seed + '_desc', templates.length);
            description = templates[idx];
        } else if (lang === 'nl') {
            const templates = [
                `Laat uw ${fullDeviceName} herstellen door Belmobile in ${loc}. ${services} vervangen in 30 minuten. 1 jaar garantie. Zonder afspraak.`,
                `${deviceName} reparatie nodig? Wij herstellen uw toestel direct in ${loc}. Bekijk onze prijzen voor ${services}.`,
                `Is uw ${fullDeviceName} stuk? Belmobile ${loc} fixt het binnen het uur. Garantie op onderdelen en werkuren.`
            ];
            const idx = getDeterministicIndex(seed + '_desc', templates.length);
            description = templates[idx];
        } else {
            const templates = [
                `Trust your ${fullDeviceName} with Belmobile experts in ${loc}. Screen & battery repair in 30 minutes. 1 Year Warranty. No appointment needed.`,
                `Need a ${deviceName} repair? We fix your device on-site in ${loc}. Transparent prices. Fast service.`,
                `Broken ${fullDeviceName}? Belmobile ${loc} restores it in under an hour. Parts and labor warranty included.`
            ];
            const idx = getDeterministicIndex(seed + '_desc', templates.length);
            description = templates[idx];
        }

    } else { // Buyback
        if (lang === 'fr') {
            const templates = [
                `Vendez votre ${fullDeviceName} au meilleur prix chez Belmobile à ${loc}. Estimation gratuite et paiement cash immédiat.`,
                `Transformez votre ${deviceName} en argent liquide. Reprise simple et rapide à ${loc}. Nous rachetons tous les modèles.`,
                `Offre de reprise pour ${fullDeviceName} : obtenez une estimation en ligne ou en magasin à ${loc}. Paiement direct.`
            ];
            const idx = getDeterministicIndex(seed + '_desc', templates.length);
            description = templates[idx];
        } else if (lang === 'nl') {
            const templates = [
                `Verkoop uw ${fullDeviceName} voor de beste prijs bij Belmobile in ${loc}. Gratis schatting en directe contante betaling.`,
                `Zet uw ${deviceName} om in cash. Eenvoudige en snelle inkoop in ${loc}. Wij kopen alle modellen.`,
                `Inruilactie voor ${fullDeviceName}: krijg direct een schatting online of in onze winkel in ${loc}. Direct uitbetaald.`
            ];
            const idx = getDeterministicIndex(seed + '_desc', templates.length);
            description = templates[idx];
        } else {
            const templates = [
                `Sell your ${fullDeviceName} for the best price at Belmobile in ${loc}. Free quote and instant cash payment.`,
                `Turn your ${deviceName} into cash. Simple and fast trade-in in ${loc}. We buy all models.`,
                `Trade-in offer for ${fullDeviceName}: get an instant quote online or at our store in ${loc}. Get paid today.`
            ];
            const idx = getDeterministicIndex(seed + '_desc', templates.length);
            description = templates[idx];
        }
    }

    // Final Fallback to prevent empty metadata
    if (!title) {
        title = serviceId === 'repair'
            ? `${brand || 'Device'} Repair ${loc}`
            : `Sell ${brand || 'Device'} ${loc}`;
    }
    if (!description) {
        description = serviceId === 'repair'
            ? `Repair your ${fullDeviceName} at Belmobile ${loc}. Best price guaranteed.`
            : `Sell your ${fullDeviceName} at Belmobile ${loc}. Instant cash payment.`;
    }

    return { title, description };
};
