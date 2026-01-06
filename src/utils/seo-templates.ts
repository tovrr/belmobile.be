
import { slugToDisplayName } from './slugs';

interface SeoContext {
    lang: 'fr' | 'nl' | 'en' | 'tr';
    serviceId: 'repair' | 'buyback';
    deviceValue?: string;
    deviceModel?: string;
    deviceCategory?: string; // e.g. 'smartphone', 'tablet', 'console'
    locationName?: string; // "Schaerbeek", "Brussels"
    isHomeConsole?: boolean;
    isPortableConsole?: boolean;
    price?: number;
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
    const { lang, isHomeConsole, isPortableConsole, price } = ctx;

    // If we have a valid price, prioritize it (High CTR)
    if (price && price > 0) {
        if (lang === 'fr') return `: Dès ${price}€`;
        if (lang === 'nl') return `: Vanaf ${price}€`;
        if (lang === 'tr') return `: ${price}€'den başlayan fiyatlarla`;
        return `: From ${price}€`;
    }

    if (isHomeConsole) {
        if (lang === 'fr') return ': Prix HDMI & Nettoyage';
        if (lang === 'nl') return ': Prijs HDMI & Reiniging';
        if (lang === 'tr') return ': HDMI ve Temizlik Fiyatları';
        return ': HDMI & Cleaning Price';
    }
    if (isPortableConsole) {
        if (lang === 'fr') return ': Prix Écran & Joystick';
        if (lang === 'nl') return ': Prijs Scherm & Joystick';
        if (lang === 'tr') return ': Ekran ve Joystick Fiyatları';
        return ': Screen & Joystick Price';
    }
    // Mobile/Tablet/Laptop default
    if (lang === 'fr') return ': Prix Écran & Batterie';
    if (lang === 'nl') return ': Prijs Scherm & Batterij';
    if (lang === 'tr') return ': Ekran ve Batarya Fiyatları';
    return ': Screen & Battery Price';
};

const getBuybackSuffix = (ctx: SeoContext): string => {
    const { lang, price } = ctx;

    // If we have a valid price, prioritize it (High CTR)
    if (price && price > 0) {
        if (lang === 'fr') return `: ${price}€ Cash`;
        if (lang === 'nl') return `: ${price}€ Cash`;
        if (lang === 'tr') return `: ${price}€ Nakit`;
        return `: ${price}€ Cash`;
    }

    if (lang === 'fr') return ': Meilleur Prix Reprise';
    if (lang === 'nl') return ': Beste Inruilprijs';
    if (lang === 'tr') return ': En İyi Takas Fiyatı';
    return ': Best Trade-in Price';
};

// --- Templates ---

export const generateSeoMetadata = (ctx: SeoContext) => {
    const { lang, serviceId, deviceValue, deviceModel, deviceCategory, locationName, price } = ctx;

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
                    : lang === 'tr' ? (deviceCategory === 'smartphone' ? 'Akıllı Telefon' : deviceCategory === 'tablet' ? 'Tablet' : deviceCategory === 'laptop' ? 'Dizüstü Bilgisayar' : deviceCategory === 'smartwatch' ? 'Akıllı Saat' : deviceCategory === 'console_home' ? 'Oyun Konsolu' : deviceCategory === 'console_portable' ? 'El Konsolu' : 'Cihaz')
                        : (deviceCategory === 'smartphone' ? 'Smartphone' : deviceCategory === 'tablet' ? 'Tablet' : deviceCategory === 'laptop' ? 'Laptop' : deviceCategory === 'smartwatch' ? 'Smartwatch' : deviceCategory === 'console_home' ? 'Home Console' : deviceCategory === 'console_portable' ? 'Handheld Console' : 'Device'))
            : (lang === 'fr' ? (deviceCategory === 'smartphone' ? 'Smartphone' : deviceCategory === 'tablet' ? 'Tablette' : deviceCategory === 'laptop' ? 'Ordinateur' : deviceCategory === 'smartwatch' ? 'Montre Connectée' : deviceCategory === 'console_home' ? 'Console de Salon' : deviceCategory === 'console_portable' ? 'Console Portable' : 'Appareil')
                : lang === 'nl' ? (deviceCategory === 'smartphone' ? 'Smartphone' : deviceCategory === 'tablet' ? 'Tablet' : deviceCategory === 'laptop' ? 'Laptop' : deviceCategory === 'smartwatch' ? 'Smartwatch' : deviceCategory === 'console_home' ? 'Spelconsole' : deviceCategory === 'console_portable' ? 'Handheld Console' : 'Toestel')
                    : lang === 'tr' ? (deviceCategory === 'smartphone' ? 'Akıllı Telefon' : deviceCategory === 'tablet' ? 'Tablet' : deviceCategory === 'laptop' ? 'Dizüstü Bilgisayar' : deviceCategory === 'smartwatch' ? 'Akıllı Saat' : deviceCategory === 'console_home' ? 'Oyun Konsolu' : deviceCategory === 'console_portable' ? 'El Konsolu' : 'Cihaz')
                        : (deviceCategory === 'smartphone' ? 'Smartphone' : deviceCategory === 'tablet' ? 'Tablet' : deviceCategory === 'laptop' ? 'Laptop' : deviceCategory === 'smartwatch' ? 'Smartwatch' : deviceCategory === 'console_home' ? 'Home Console' : deviceCategory === 'console_portable' ? 'Handheld Console' : 'Device'));
        deviceName = brand || generic;
    }

    const fullDeviceName = (brand && model && !model.toLowerCase().startsWith(brand.toLowerCase()))
        ? `${brand} ${model}`
        : (model || brand || deviceName);

    const loc = locationName || (lang === 'fr' ? 'Bruxelles' : lang === 'nl' ? 'Brussel' : lang === 'tr' ? 'Brüksel' : 'Brussels');

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
        const suffix = getRepairSuffix(ctx);

        if (lang === 'fr') {
            const templates = [
                `Réparation ${deviceName} ${loc} ${suffix}`,
                `${deviceName} cassé ? Réparation à ${loc} - Belmobile`,
                `Réparation ${fullDeviceName} en 30 min à ${loc}`,
                `Spécialiste de votre ${deviceNameLC} à ${loc} : Devis Gratuit`
            ];
            const isPhoneContext = deviceCategory === 'smartphone';
            if (isPhoneContext) {
                templates.push(`Réparation GSM & Téléphone à ${loc} - Belmobile`, `Magasin de Réparation GSM ${loc} : ${deviceName}`, `Expert Réparation iPhone & Smartphone ${loc}`);
            } else if (!deviceCategory) {
                templates.push(`Réparation Multimédia & Électronique à ${loc}`, `Atelier de Réparation ${loc} : Smartphone, PC, Console`, `Belmobile ${loc} : Magasin de Réparation High-Tech`);
            } else if (deviceCategory === 'tablet') {
                templates.push(`Réparation Tablette & iPad à ${loc} - Belmobile`, `Remplacement Vitre Tablette ${loc} : ${deviceName}`);
            } else if (deviceCategory === 'laptop') {
                templates.push(`Réparation Ordinateur Portable à ${loc} - PC & Mac`);
            }
            const idx = getDeterministicIndex(seed, templates.length);
            title = templates[idx];
        } else if (lang === 'nl') {
            const templates = [
                `Reparatie ${deviceName} ${loc} ${suffix}`,
                `${deviceName} Herstellen in ${loc} - Klaar in 30 min`,
                `Uw experts for ${fullDeviceName} in ${loc}`,
                `${deviceName} scherm vervangen ${loc}? Belmobile`
            ];
            const isPhoneContext = deviceCategory === 'smartphone';
            if (isPhoneContext) {
                templates.push(`GSM Reparatie ${loc} - Klaar terwijl u wacht`, `Telefoon Winkel ${loc} : Reparatie & Onderhoud`);
            } else if (deviceCategory === 'tablet') {
                templates.push(`Tablet & iPad Reparatie ${loc} - Belmobile`, `Scherm Vervangen Tablet ${loc} : ${deviceName}`);
            }
            const idx = getDeterministicIndex(seed, templates.length);
            title = templates[idx];
        } else if (lang === 'tr') {
            const templates = [
                `${deviceName} Onarımı ${loc} ${suffix}`,
                `${deviceName} mi bozuldu? ${loc}'de Hızlı Onarım - Belmobile`,
                `${fullDeviceName} 30 dakikada onarım ${loc}`,
                `${loc}'deki ${deviceName} uzmanınız: Ücretsiz Fiyat Teklifi`
            ];
            const isPhoneContext = deviceCategory === 'smartphone';
            if (isPhoneContext) {
                templates.push(`${loc}'de Cep Telefonu Tamiri - Beklerken Onarım`, `${loc} Telefon Hastanesi: ${deviceName} Servisi`);
            } else if (deviceCategory === 'tablet') {
                templates.push(`${loc} Tablet ve iPad Onarımı - Belmobile`, `${loc}'de Tablet Cam Değişimi: ${deviceName}`);
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
                templates.push(`Phone Repair ${loc} - Fast Service`, `Smartphone Fix ${loc} : ${deviceName}`);
            } else if (deviceCategory === 'tablet') {
                templates.push(`Tablet & iPad Repair ${loc} - Belmobile`, `Broken Tablet Screen? Fix in ${loc}`);
            }
            const idx = getDeterministicIndex(seed, templates.length);
            title = templates[idx];
        }
    } else { // Buyback
        const suffix = getBuybackSuffix(ctx);

        if (lang === 'fr') {
            const templates = [
                `Rachat ${deviceName} ${loc} ${suffix}`,
                `Vendez votre ${fullDeviceNameLC} au meilleur prix à ${loc}`,
                `Reprise ${deviceName} : Estimation immédiate à ${loc}`,
                `Recyclage de votre ${deviceNameLC} à ${loc} - Payé Cash`
            ];
            const isPhoneContext = !deviceCategory || deviceCategory === 'smartphone';
            if (isPhoneContext) {
                templates.push(`Rachat GSM & Smartphone à ${loc} - Cash Direct`, `Vendre mon iPhone/Samsung à ${loc}`);
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
            const idx = getDeterministicIndex(seed, templates.length);
            title = templates[idx];
        } else if (lang === 'tr') {
            const templates = [
                `${deviceName} Geri Alım ${loc} ${suffix}`,
                `${fullDeviceName}'inizi ${loc}'de en iyi fiyata satın`,
                `${deviceName} Takas: ${loc}'de anında nakit`,
                `${deviceName} Geri Dönüşüm ${loc} - Hemen Ödeme`
            ];
            const idx = getDeterministicIndex(seed, templates.length);
            title = templates[idx];
        } else { // EN
            const templates = [
                `Sell ${deviceName} ${loc} ${suffix}`,
                `Sell your ${fullDeviceName} in ${loc} - Best Price`,
                `Trade-in ${deviceName} ${loc} - Instant Cash`,
                `Recycle ${deviceName} in ${loc} - Get Paid Today`
            ];
            const idx = getDeterministicIndex(seed, templates.length);
            title = templates[idx];
        }
    }

    // --- DESCRIPTIONS ---
    let description = '';

    if (serviceId === 'repair') {
        const services = ctx.isHomeConsole
            ? (lang === 'fr' ? 'HDMI et nettoyage' : lang === 'nl' ? 'HDMI en reiniging' : lang === 'tr' ? 'HDMI ve temizlik' : 'HDMI and cleaning')
            : (lang === 'fr' ? 'écran et batterie' : lang === 'nl' ? 'scherm en batterij' : lang === 'tr' ? 'ekran ve batarya' : 'screen and battery');
        const priceText = (price && price > 0) ? (lang === 'fr' ? `dès ${price}€` : lang === 'nl' ? `vanaf ${price}€` : lang === 'tr' ? `${price}€'den başlayan fiyatlarla` : `from ${price}€`) : '';

        if (lang === 'fr') {
            const templates = [
                `Confiez votre ${fullDeviceName} aux experts de Belmobile à ${loc}. Réparation ${services} en 30 minutes${priceText ? ' ' + priceText : ''}. Garantie 1 an.`,
                `Besoin d'une réparation pour ${deviceName} ? Nous réparons votre appareil sur place à ${loc}. Prix transparents${priceText ? ' ' + priceText : ''}.`,
                `Votre ${fullDeviceName} est cassé ? Pas de panique. Belmobile ${loc} le remet à neuf en moins d'une heure. Garantie pièces et main d'œuvre.`
            ];
            const idx = getDeterministicIndex(seed + '_desc', templates.length);
            description = templates[idx];
        } else if (lang === 'nl') {
            const templates = [
                `Laat uw ${fullDeviceName} herstellen door Belmobile in ${loc}. ${services} vervangen in 30 minuten${priceText ? ' ' + priceText : ''}. 1 jaar garantie.`,
                `${deviceName} reparatie nodig? Wij herstellen uw toestel direct in ${loc}. Bekijk onze prijzen voor ${services}.`,
                `Is uw ${fullDeviceName} stuk? Belmobile ${loc} fixt het binnen het uur. Garantie op onderdelen en werkuren.`
            ];
            const idx = getDeterministicIndex(seed + '_desc', templates.length);
            description = templates[idx];
        } else if (lang === 'tr') {
            const templates = [
                `${fullDeviceName}'inizi ${loc}'deki Belmobile uzmanlarına emanet edin. 30 dakikada ${services} değişimi${priceText ? ' ' + priceText : ''}. 1 yıl garanti.`,
                `${deviceName} onarımı mı lazım? Cihazınızı ${loc}'de hemen onarıyoruz. Şeffaf fiyatlar${priceText ? ' ' + priceText : ''}. Hızlı servis.`,
                `${fullDeviceName} mi bozuldu? Belmobile ${loc} bir saatten kısa sürede cihazınızı yeniler. Parça ve işçilik garantisi.`
            ];
            const idx = getDeterministicIndex(seed + '_desc', templates.length);
            description = templates[idx];
        } else {
            const templates = [
                `Trust your ${fullDeviceName} with Belmobile experts in ${loc}. Screen & battery repair in 30 minutes${priceText ? ' ' + priceText : ''}. 1 Year Warranty.`,
                `Need a ${deviceName} repair? We fix your device on-site in ${loc}. Transparent prices${priceText ? ' ' + priceText : ''}. Fast service.`,
                `Broken ${fullDeviceName}? Belmobile ${loc} restores it in under an hour. Parts and labor warranty included.`
            ];
            const idx = getDeterministicIndex(seed + '_desc', templates.length);
            description = templates[idx];
        }
    } else { // Buyback
        const priceText = (price && price > 0) ? (lang === 'fr' ? `jusqu'à ${price}€` : lang === 'nl' ? `tot ${price}€` : lang === 'tr' ? `${price}€'ya kadar` : `up to ${price}€`) : '';

        if (lang === 'fr') {
            const templates = [
                `Vendez votre ${fullDeviceName} au meilleur prix chez Belmobile à ${loc}. Estimation gratuite et paiement cash immédiat${priceText ? ' ' + priceText : ''}.`,
                `Transformez votre ${deviceName} en argent liquide. Reprise simple et rapide à ${loc}. Nous rachetons tous les modèles.`,
                `Offre de reprise pour ${fullDeviceName} : obtenez une estimation en ligne ou en magasin à ${loc}. Paiement direct.`
            ];
            const idx = getDeterministicIndex(seed + '_desc', templates.length);
            description = templates[idx];
        } else if (lang === 'nl') {
            const templates = [
                `Verkoop uw ${fullDeviceName} voor de beste prijs bij Belmobile in ${loc}. Gratis schatting en directe contante betaling${priceText ? ' ' + priceText : ''}.`,
                `Zet uw ${deviceName} om in cash. Eenvoudige en snelle inkoop in ${loc}. Wij kopen alle modellen.`,
                `Inruilactie voor ${fullDeviceName}: krijg direct bir schatting online of in onze winkel in ${loc}. Direct uitbetaald.`
            ];
            const idx = getDeterministicIndex(seed + '_desc', templates.length);
            description = templates[idx];
        } else if (lang === 'tr') {
            const templates = [
                `${fullDeviceName}'inizi ${loc}'deki Belmobile'de en iyi fiyata satın. Ücretsiz ekspertiz ve anında nakit ödeme${priceText ? ' ' + priceText : ''}.`,
                `${deviceName}'inizi nakite çevirin. ${loc}'de hızlı ve kolay geri alım. Tüm modelleri alıyoruz.`,
                `${fullDeviceName} için geri alım teklifi: ${loc}'deki mağazamızda veya online hemen fiyat alın. Anında ödeme.`
            ];
            const idx = getDeterministicIndex(seed + '_desc', templates.length);
            description = templates[idx];
        } else {
            const templates = [
                `Sell your ${fullDeviceName} for the best price at Belmobile in ${loc}. Free quote and instant cash payment${priceText ? ' ' + priceText : ''}.`,
                `Turn your ${deviceName} into cash. Simple and fast trade-in in ${loc}. We buy all models.`,
                `Trade-in offer for ${fullDeviceName}: get an instant quote online or at our store in ${loc}. Get paid today.`
            ];
            const idx = getDeterministicIndex(seed + '_desc', templates.length);
            description = templates[idx];
        }
    }

    if (!title) title = serviceId === 'repair' ? `${brand || 'Device'} Repair ${loc}` : `Sell ${brand || 'Device'} ${loc}`;
    if (!description) description = serviceId === 'repair' ? `Repair your ${fullDeviceName} at Belmobile ${loc}. Best price guaranteed.` : `Sell your ${fullDeviceName} at Belmobile ${loc}. Instant cash payment.`;

    // --- OG METADATA ---
    let ogTitle = '';
    const ogDeviceName = deviceModel ? slugToDisplayName(deviceModel) : (brand || (lang === 'fr' ? 'Appareil' : lang === 'nl' ? 'Toestel' : lang === 'tr' ? 'Cihaz' : 'Device'));

    if (lang === 'fr') ogTitle = serviceId === 'repair' ? `Réparation ${ogDeviceName}` : `Rachat ${ogDeviceName}`;
    else if (lang === 'nl') ogTitle = serviceId === 'repair' ? `Reparatie ${ogDeviceName}` : `Verkoop ${ogDeviceName}`;
    else if (lang === 'tr') ogTitle = serviceId === 'repair' ? `${ogDeviceName} Onarımı` : `${ogDeviceName} Geri Alım`;
    else ogTitle = serviceId === 'repair' ? `${ogDeviceName} Repair` : `Sell ${ogDeviceName}`;

    if (price && price > 0) ogTitle += ` - ${price}€`;

    let ogSubtitle = '';
    if (serviceId === 'repair') {
        if (lang === 'fr') ogSubtitle = 'En 30 minutes • Garantie 1 An';
        else if (lang === 'nl') ogSubtitle = 'In 30 minuten • 1 Jaar Garantie';
        else if (lang === 'tr') ogSubtitle = '30 Dakikada • 1 Yıl Garanti';
        else ogSubtitle = 'Done within 30 minutes • 1 Year Warranty';
    } else {
        if (lang === 'fr') ogSubtitle = 'Meilleur Prix Garanti • Paiement Cash';
        else if (lang === 'nl') ogSubtitle = 'Beste Prijs Garantie • Direct Cash';
        else if (lang === 'tr') ogSubtitle = 'En İyi Fiyat Garantisi • Nakit Ödeme';
        else ogSubtitle = 'Best Price Guaranteed • Instant Cash';
    }

    return { title, description, ogTitle, ogSubtitle };
};

export const getKeywordsForPage = (
    lang: string,
    serviceId: string,
    brand?: string,
    model?: string,
    category?: string
): string[] => {
    const keywords: string[] = [];
    const location = lang === 'fr' ? 'Bruxelles' : lang === 'nl' ? 'Brussel' : lang === 'tr' ? 'Brüksel' : 'Brussels';

    if (serviceId === 'repair') {
        if (lang === 'fr') keywords.push('réparation', 'réparer', 'écran', 'brisé', 'cassé', 'batterie', 'remplacement', 'prix', 'pas cher', 'gsm', 'téléphone', 'mobile');
        if (lang === 'nl') keywords.push('reparatie', 'repareren', 'scherm', 'vervangen', 'glas', 'batterij', 'kosten', 'goedkoop', 'gsm', 'telefoon', 'mobiel');
        if (lang === 'tr') keywords.push('onarım', 'tamir', 'ekran', 'kırık', 'batarya', 'değişim', 'fiyat', 'ucuz', 'gsm', 'telefon', 'mobil');
        if (lang === 'en') keywords.push('repair', 'fix', 'screen', 'broken', 'replacement', 'battery', 'cost', 'cheap', 'mobile', 'cell phone');
    } else if (serviceId === 'buyback') {
        if (lang === 'fr') keywords.push('rachat', 'vendre', 'revendre', 'reprise', 'recyclage', 'estimation', 'cash');
        if (lang === 'nl') keywords.push('inkoop', 'verkopen', 'inruilen', 'recycling', 'waarde', 'contant');
        if (lang === 'tr') keywords.push('alım', 'satım', 'takas', 'geri dönüşüm', 'fiyat', 'nakit');
        if (lang === 'en') keywords.push('buyback', 'sell', 'trade-in', 'recycle', 'value', 'cash');
    }

    if (brand) {
        keywords.push(brand);
        if (lang === 'fr') keywords.push(`réparation ${brand} bruxelles`);
        if (lang === 'nl') keywords.push(`reparatie ${brand} brussel`);
        if (lang === 'tr') keywords.push(`${brand} tamiri brüksel`);
    }

    if (model) {
        keywords.push(model);
    }

    if (location) keywords.push(location);
    return [...new Set(keywords)];
};

export const generateMetaKeywords = (tags: string[]): string => tags.join(', ');
