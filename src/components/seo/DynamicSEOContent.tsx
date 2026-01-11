import { Shop } from '../../types';
import { Location } from '../../data/locations';
import { Service } from '../../data/services';
import { slugToDisplayName, createSlug } from '../../utils/slugs';
import { findDefaultBrandCategory } from '../../utils/deviceLogic';
import { ShieldCheckIcon, ClockIcon, DevicePhoneMobileIcon, BoltIcon, BanknotesIcon, WrenchScrewdriverIcon, TvIcon, FireIcon } from '@heroicons/react/24/solid';

import { SHOPS } from '../../constants';
import { FAQS } from '../../data/faqs';

import { getSEOTitle, getSEODescription } from '../../utils/seoHelpers';
import { PricingQuote } from '../../services/server/pricing.dal';

interface DynamicSEOContentProps {
    type: 'store' | 'repair' | 'buyback';
    lang: 'fr' | 'nl' | 'en' | 'tr';
    shop?: Shop; // For specific store pages
    location?: Location; // For location-based pages (hub or shop)
    service?: Service;
    brand?: string;
    model?: string;
    deviceType?: string;
    priceQuote?: PricingQuote | null; // SSOT Injection
}

const DynamicSEOContent: React.FC<DynamicSEOContentProps> = ({
    type,
    lang,
    shop,
    location,
    service,
    brand,
    model,
    deviceType,
    priceQuote
}) => {
    // Helper to get location name
    const locationName = shop?.city || location?.city || (lang === 'fr' ? 'Bruxelles' : (lang === 'nl' ? 'Brussel' : (lang === 'tr' ? 'Brüksel' : 'Brussels')));

    // ... (keep helper methods like getInferredDeviceType until getDeviceName)

    const getInferredDeviceType = () => {
        if (deviceType) return deviceType;
        if (model) {
            const m = model.toLowerCase();
            if (m.includes('playstation') || m.includes('xbox') || m.includes('ps5') || m.includes('ps4')) return 'console_home';
            if (m.includes('switch') || m.includes('deck') || m.includes('gameboy') || m.includes('3ds')) return 'console_handheld';
        }
        if (brand) {
            const match = findDefaultBrandCategory(createSlug(brand));
            return match?.deviceType || 'smartphone';
        }
        return 'smartphone';
    };

    const effectiveDeviceType = getInferredDeviceType();

    // Helper to get device name
    const getDeviceName = () => {
        // Format names (convert slug to display name)
        const formattedModel = model ? slugToDisplayName(model) : '';
        const formattedBrand = brand ? slugToDisplayName(brand) : '';
        const formattedCategory = deviceType ? slugToDisplayName(deviceType) : '';

        if (formattedModel) {
            if (formattedBrand && formattedModel.toLowerCase().startsWith(formattedBrand.toLowerCase())) {
                return formattedModel;
            }
            return `${formattedBrand || ''} ${formattedModel}`.trim();
        }

        if (formattedBrand) {
            // French: Type Brand (e.g., Smartphone Apple)
            if (lang === 'fr') {
                if (formattedBrand.toLowerCase() === 'apple' && deviceType === 'smartphone') return 'iPhone';
                return `${deviceType === 'smartphone' ? 'Smartphone' : 'appareil'} ${formattedBrand}`;
            }
            // NL: Brand Type
            if (lang === 'nl') {
                return `${formattedBrand} ${formattedCategory || 'toestel'}`;
            }
            // TR: Brand Type
            if (lang === 'tr') {
                return `${formattedBrand} ${formattedCategory || 'cihazı'}`;
            }
            // EN: Brand Type (e.g., Apple Smartphone)
            return `${formattedBrand} ${formattedCategory || 'device'}`;
        }

        if (deviceType === 'smartphone') return lang === 'nl' ? 'GSM' : 'Smartphone'; // NL-BE uses GSM often, or Smartphone
        return lang === 'fr' ? 'appareil' : (lang === 'nl' ? 'toestel' : (lang === 'tr' ? 'cihazı' : 'device'));
    };

    const deviceName = getDeviceName();

    // Content Generation Logic
    const isRepair = type === 'repair';
    const isStore = type === 'store';
    const isHomeConsole = effectiveDeviceType === 'console_home';
    const isConsole = effectiveDeviceType === 'console_home' || effectiveDeviceType === 'console_handheld';
    const isHub = !!shop?.isHub || !!location?.isHub;

    const issuesText = isHomeConsole
        ? (lang === 'fr' ? 'port HDMI ou surchauffe' : (lang === 'nl' ? 'HDMI-poort of oververhitting' : (lang === 'tr' ? 'HDMI portu veya aşırı ısınma' : 'HDMI port or overheating')))
        : (lang === 'fr' ? 'écran ou batterie' : (lang === 'nl' ? 'scherm of batterij' : (lang === 'tr' ? 'ekran veya batarya' : 'screen or battery')));

    const durationText = isHomeConsole
        ? (lang === 'fr' ? '3h à 4h' : (lang === 'nl' ? '3u tot 4u' : (lang === 'tr' ? '3-4 saat' : '3h to 4h')))
        : (lang === 'fr' ? '30 minutes' : (lang === 'nl' ? '30 minuten' : (lang === 'tr' ? '30 dakika' : '30 minutes')));

    // Translations & Content Helpers
    // In SOTA, we use the DAL data for title/description if available
    const getTitle = () => {
        if (priceQuote && priceQuote.seo && priceQuote.seo[lang]) {
            return isRepair ? priceQuote.seo[lang].repair.title : priceQuote.seo[lang].buyback.title;
        }
        return getSEOTitle({ isStore, isRepair, lang, locationName, deviceName, durationText });
    };

    const getDescription = () => {
        if (priceQuote && priceQuote.seo && priceQuote.seo[lang]) {
            return isRepair ? priceQuote.seo[lang].repair.description : priceQuote.seo[lang].buyback.description;
        }
        return getSEODescription({
            isStore, isRepair, lang, locationName, deviceName, isHub, shop, brand, issuesText, durationText
        });
    };

    const getCard1 = () => {
        const title = lang === 'fr' ? 'Pourquoi choisir Belmobile ?' : (lang === 'nl' ? 'Waarom Belmobile kiezen?' : (lang === 'tr' ? 'Neden Belmobile?' : 'Why Choose Belmobile?'));
        const text = isRepair
            ? (lang === 'fr' ? `Service Premium pour Particuliers & Pros (B2B). Réparation en ${durationText} avec Facture TVA et Garantie 1 an. Plus de 50.000 appareils réparés dans nos laboratoires.` : (lang === 'nl' ? `Premium Service voor Particulieren & Bedrijven. Reparatie in ${durationText} met BTW-factuur en 1 jaar garantie. Meer dan 50.000 tevreden klanten.` : (lang === 'tr' ? `Bireysel ve Kurumsal (B2B) için Premium Hizmet. ${durationText} sürede onarım, KDV faturası ve 1 yıl garanti. 50.000'den fazla cihaz onarımı deneyimi.` : `Premium Service for B2C & B2B. ${durationText} repair with VAT Invoice and 1-year warranty. Trusted by 50k+ customers.`)))
            : (lang === 'fr' ? 'Leader du Rachat à Bruxelles. Nous offrons le meilleur prix garanti, avec paiement immédiat (Cash/Virement). Effacement complet de vos données (GDPR) certifié.' : (lang === 'nl' ? 'Marktleider in Inkoop. Beste prijsgarantie met directe betaling. Gecertificeerde dataverwijdering (GDPR) voor uw privacy.' : (lang === 'tr' ? 'Brüksel\'de Geri Alım Lideri. Anında nakit veya havale ile en iyi fiyat garantisi. Sertifikalı güvenli veri silme (GDPR).' : 'Brussels Buyback Leader. Best price guaranteed with instant payment. Certified GDPR data wipe for your security.')));
        return { title, text };
    };

    const getCard2 = () => {
        const title = lang === 'fr' ? 'Nos Centres d\'Expertise' : (lang === 'nl' ? 'Onze Expertisecentra' : (lang === 'tr' ? 'Uzmanlık Merkezlerimiz' : 'Our Expertise Centers'));

        // Generate dynamic address string from real shops
        const activeShops = SHOPS.filter(s => s.status === 'open');

        // Simplify to just City/Neighborhood names for cleaner UI
        const cityNames = activeShops.map(s => {
            // Capitalize first letter
            return String(s.id).charAt(0).toUpperCase() + String(s.id).slice(1);
        }).join(', ');

        const text = isRepair
            ? (lang === 'fr' ? `Nos laboratoires à ${cityNames} sont équipés pour tout type d'intervention (Microsoudure, FaceID, Data Recovery). Sans rendez-vous, 6j/7.` : (lang === 'nl' ? `Onze laboratoria in ${cityNames} zijn uitgerust voor elke interventie. Zonder afspraak, 6d/7.` : (lang === 'tr' ? `${cityNames}'deki laboratuvarlarımız her türlü müdahale için donatılmıştır. Randevusuz, haftada 6 gün.` : `Our labs in ${cityNames} serve the entire Brussels region. Open 6 days a week, no appointment needed.`)))
            : (lang === 'fr' ? `Passez dans nos centres à ${cityNames} pour une estimation gratuite. Nos experts évaluent votre appareil en 2 minutes.` : (lang === 'nl' ? `Bezoek onze centra in ${cityNames} voor een gratis schatting. Klaar in 2 minuten.` : (lang === 'tr' ? `Ücretsiz fiyat tahmini için ${cityNames}'deki merkezlerimize uğrayın. Uzmanlarımız cihazınızı 2 dakikada değerlendirir.` : `Visit our centers in ${cityNames} for a free 2-minute appraisal.`)));
        return { title, text };
    };

    const card1 = getCard1();
    const card2 = getCard2();

    // Generate JSON-LD Schema (FAQ + Product)
    const getJSONLDSchema = () => {
        let faqs = [];
        const langCode = (lang === 'fr' || lang === 'nl' || lang === 'tr') ? lang : 'en';

        // 1. Core FAQs based on Type
        // @ts-ignore
        const sourceFaqs = isRepair ? FAQS[langCode].repair : FAQS[langCode].buyback;

        // DYNAMIC INJECTION: Replace '30 min' with actual durationText
        faqs = sourceFaqs.map((faq: any) => ({
            ...faq,
            answer: faq.answer
                .replace('30 minutes', durationText)
                .replace('30 minuten', durationText)
                .replace('30 min', durationText)
                .replace('30 dakika', durationText)
                .replace('30 Dakika', durationText)
        }));

        // 2. Hub Specific FAQs (Brussels Authority)
        const isHub = !!location?.isHub || locationName.toLowerCase().includes('brussel');
        if (isHub) {
            // @ts-ignore
            faqs = [...faqs, ...FAQS[langCode].hub_brussels];
        }

        // 3. Dynamic Injection (Device Specifics) for better CTR
        if (isRepair) {
            const dynamicQ = lang === 'fr'
                ? { question: `Réparez-vous les ${deviceName} ?`, answer: `Oui, nous sommes spécialisés en réparation de ${deviceName}. Pièces en stock à ${locationName}.` }
                : (lang === 'nl'
                    ? { question: `Repareren jullie ${deviceName}?`, answer: `Ja, wij zijn gespecialiseerd in ${deviceName} reparaties. Onderdelen op voorraad in ${locationName}.` }
                    : (lang === 'tr'
                        ? { question: `${deviceName} onarımı yapıyor musunuz?`, answer: `Evet, ${deviceName} onarımı konusunda uzmanız. Parçalar ${locationName} mağazamızda stokta.` }
                        : { question: `Do you fix ${deviceName}?`, answer: `Yes, we specialize in ${deviceName} repair. Parts in stock at ${locationName}.` }));
            faqs.unshift(dynamicQ);
        }

        const schemas: any[] = [
            {
                "@context": "https://schema.org",
                "@type": "FAQPage",
                "mainEntity": faqs.map(faq => ({
                    "@type": "Question",
                    "name": faq.question,
                    "acceptedAnswer": {
                        "@type": "Answer",
                        "text": faq.answer
                    }
                }))
            }
        ];

        // 4. Product Schema (SSOT Driven)
        // If we have a price quote, we generate a high-quality Product/Offer schema
        if (priceQuote && isRepair) {
            const { repair } = priceQuote;
            const startPrice = repair.screen_generic || repair.screen_original || repair.screen_oled || repair.battery || 60;

            schemas.push({
                "@context": "https://schema.org",
                "@type": "Product",
                "name": `${lang === 'fr' ? 'Réparation' : (lang === 'nl' ? 'Reparatie' : 'Repair')} ${deviceName}`,
                "description": getDescription(),
                "image": priceQuote.deviceImage || undefined,
                "offers": {
                    "@type": "Offer",
                    "url": `https://belmobile.be/${lang}/${lang === 'fr' ? 'reparation' : (lang === 'nl' ? 'reparatie' : (lang === 'tr' ? 'onarim' : 'repair'))}/${createSlug(brand || '')}/${createSlug(model || '')}`,
                    "priceCurrency": "EUR",
                    "price": Number(startPrice),
                    "availability": "https://schema.org/InStock",
                    "priceValidUntil": new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString().split('T')[0],
                    "seller": {
                        "@type": "LocalBusiness",
                        "name": "Belmobile"
                    }
                }
            });
        } else if (priceQuote && !isRepair) {
            const { buyback } = priceQuote;
            schemas.push({
                "@context": "https://schema.org",
                "@type": "Product",
                "name": `${lang === 'fr' ? 'Rachat' : (lang === 'nl' ? 'Inkoop' : 'Buyback')} ${deviceName}`,
                "description": getDescription(),
                "image": priceQuote.deviceImage || undefined,
                "offers": {
                    "@type": "Offer",
                    "url": `https://belmobile.be/${lang}/${lang === 'fr' ? 'rachat' : (lang === 'nl' ? 'inkoop' : (lang === 'tr' ? 'geri-alim' : 'buyback'))}/${createSlug(brand || '')}/${createSlug(model || '')}`,
                    "priceCurrency": "EUR",
                    "price": Number(buyback.maxPrice),
                    "availability": "https://schema.org/InStock",
                    "priceValidUntil": new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString().split('T')[0],
                    "seller": {
                        "@type": "LocalBusiness",
                        "name": "Belmobile"
                    }
                }
            });
        }

        // Return multiple script tags or a graph? 
        // A list of scripts is cleaner for Next.js to handle hydration usually, but array of objects in one script is valid too if graph.
        // Let's output separate scripts or a graph. Using a fragment with multiple scripts.
        return (
            <>
                {schemas.map((s, i) => (
                    <script
                        key={i}
                        type="application/ld+json"
                        dangerouslySetInnerHTML={{ __html: JSON.stringify(s) }}
                    />
                ))}
            </>
        );
    };

    // Helper to render H3 service blocks
    const renderServiceBlocks = () => {
        const services = [];
        if (isRepair) {
            // Common repairs based on device type
            if (isHomeConsole) {
                services.push(
                    {
                        id: 'hdmi',
                        icon: TvIcon,
                        title: lang === 'fr' ? `Réparation Port HDMI ${deviceName}` : lang === 'nl' ? `HDMI-poort Reparatie ${deviceName}` : `HDMI Port Repair ${deviceName}`,
                        text: lang === 'fr'
                            ? `Votre ${deviceName} ne s'affiche plus ? Nos experts remplacent le port HDMI pour restaurer l'image en 4K.`
                            : lang === 'nl'
                                ? `Geen beeld op uw ${deviceName}? Onze experts vervangen de HDMI-poort om het 4K-beeld te herstellen.`
                                : `No signal on your ${deviceName}? Our experts replace the HDMI port to restore 4K image quality.`
                    },
                    {
                        id: 'cleaning',
                        icon: FireIcon,
                        title: lang === 'fr' ? `Nettoyage et Pâte Thermique ${deviceName}` : lang === 'nl' ? `Reiniging en Thermische Pasta ${deviceName}` : `Cleaning & Thermal Paste ${deviceName}`,
                        text: lang === 'fr'
                            ? `Bruit de ventilateur ou surchauffe ? Un nettoyage complet et le remplacement de la pâte thermique prolongent la vie de votre ${deviceName}.`
                            : lang === 'nl'
                                ? `Lawaaiige ventilator of oververhitting? Een volledige reiniging en vervanging van de koelpasta verlengt de levensduur van uw ${deviceName}.`
                                : `Loud fan or overheating? A deep clean and thermal paste replacement extends the life of your ${deviceName}.`
                    }
                );
            } else {
                services.push(
                    {
                        id: 'screen',
                        icon: DevicePhoneMobileIcon,
                        title: lang === 'fr' ? `Changement d'Écran ${deviceName}` : (lang === 'nl' ? `Schermvervanging ${deviceName}` : (lang === 'tr' ? `${deviceName} Ekran Değişimi` : `Screen Replacement ${deviceName}`)),
                        text: lang === 'fr'
                            ? `Écran cassé ou tactile défaillant ? Nous remplaçons votre dalle par des pièces d'origine ou premium en ${durationText}.`
                            : (lang === 'nl'
                                ? `Gebroken scherm of defecte touch? Wij vervangen uw scherm door originele of premium onderdelen in ${durationText}.`
                                : (lang === 'tr'
                                    ? `Ekran mı kırıldı? Orijinal veya premium parçalarla cihazınızın ekranını ${durationText} içinde değiştiriyoruz.`
                                    : `Broken screen or touch failure? We replace your display with original or premium parts in ${durationText}.`))
                    },
                    {
                        id: 'battery',
                        icon: BoltIcon,
                        title: lang === 'fr' ? `Remplacement de Batterie ${deviceName}` : (lang === 'nl' ? `Batterij Vervangen ${deviceName}` : (lang === 'tr' ? `${deviceName} Batarya Değişimi` : `Battery Replacement ${deviceName}`)),
                        text: lang === 'fr'
                            ? `Votre ${deviceName} se décharge trop vite ? Retrouvez une autonomie optimale avec une batterie neuve certifiée.`
                            : (lang === 'nl'
                                ? `Loopt uw ${deviceName} te snel leeg? Krijg de optimale batterijduur terug met een nieuwe gecertificeerde batterij.`
                                : (lang === 'tr'
                                    ? `${deviceName} cihazınızın şarjı çabuk mu bitiyor? Yeni sertifikalı bataryalarla tam performans geri kazanın.`
                                    : `Is your ${deviceName} draining too fast? Get back optimal battery life with a new certified battery.`))
                    }
                );
            }
        } else {
            // Buyback benefits
            services.push(
                {
                    id: 'cash',
                    icon: BanknotesIcon,
                    title: lang === 'fr' ? `Paiement Cash pour votre ${deviceName}` : (lang === 'nl' ? `Contante betaling voor uw ${deviceName}` : (lang === 'tr' ? `${deviceName} için Nakit Ödeme` : `Cash Payment for your ${deviceName}`)),
                    text: lang === 'fr'
                        ? `Obtenez le meilleur prix du marché à Bruxelles. Estimation gratuite et paiement immédiat en espèces ou virement.`
                        : (lang === 'nl'
                            ? `Krijg de beste marktprijs in Brussel. Gratis schatting en onmiddellijke betaling in contanten of via overschrijving.`
                            : (lang === 'tr'
                                ? `Brüksel'deki en iyi piyasa fiyatını alın. Ücretsiz fiyat tahmini ve anında nakit veya havale ile ödeme.`
                                : `Get the best market price in Brussels. Free estimate and immediate payment in cash or bank transfer.`))
                },
                {
                    id: 'broken',
                    icon: WrenchScrewdriverIcon,
                    title: lang === 'fr' ? `Rachat ${deviceName} même cassé` : (lang === 'nl' ? `Inkoop ${deviceName} zelfs defect` : (lang === 'tr' ? `Kırık ${deviceName} Cihazları Alıyoruz` : `Buyback ${deviceName} even broken`)),
                    text: lang === 'fr'
                        ? `Ne jetez pas votre appareil abîmé ! Nous rachetons les ${deviceName} même avec ${issuesText} pour pièces.`
                        : (lang === 'nl'
                            ? `Gooi uw beschadigde apparaat niet weg! Wij kopen ${deviceName} toestellen zelfs met ${isHomeConsole ? 'HDMI-defecten' : 'gebarsten schermen'} voor onderdelen.`
                            : (lang === 'tr'
                                ? `Hasarlı cihazınızı atmayın! ${issuesText} olan ${deviceName} cihazlarını parça amaçlı alıyoruz.`
                                : `Don't throw away your damaged device! We buy back ${deviceName} units even with ${issuesText} for parts.`))
                }
            );
        }

        return (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
                {services.map(s => (
                    <div key={s.id}>
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3 flex items-center">
                            <s.icon className="w-5 h-5 mr-2 text-bel-blue" aria-hidden="true" />
                            {s.title}
                        </h3>
                        <p className="text-gray-600 dark:text-gray-400">
                            {s.text}
                        </p>
                    </div>
                ))}
            </div>
        );
    };

    // Helper to render price table for repair
    const renderPriceTable = () => {
        // PER USER REQUEST (2026-01-08): Hidden visible price table to avoid clutter under wizard.
        return null;

        /* 
        if (!isRepair || !priceQuote) return null;

        const { repair } = priceQuote;

        const tableRows = [
            { id: 'screen', label: lang === 'fr' ? 'Écran' : (lang === 'nl' ? 'Scherm' : (lang === 'tr' ? 'Ekran' : 'Screen')), price: repair.screen_original || repair.screen_generic || repair.screen_oled },
            { id: 'battery', label: lang === 'fr' ? 'Batterie' : (lang === 'nl' ? 'Batterij' : (lang === 'tr' ? 'Batarya' : 'Battery')), price: repair.battery },
            { id: 'charging', label: lang === 'fr' ? 'Connecteur de Charge' : (lang === 'nl' ? 'Oplaadpoort' : (lang === 'tr' ? 'Şarj Soketi' : 'Charging')), price: repair.charging },
            { id: 'camera', label: lang === 'fr' ? 'Caméra Arrière' : (lang === 'nl' ? 'Achtercamera' : (lang === 'tr' ? 'Arka Kamera' : 'Rear Camera')), price: repair.camera },
        ].filter(r => typeof r.price === 'number' && r.price > 0);

        if (tableRows.length === 0) return null;

        return (
            <div className="mb-12 overflow-hidden rounded-2xl border border-gray-200 dark:border-slate-800">
                <table className="w-full text-left">
                    <caption className="sr-only">{lang === 'fr' ? `Tarifs de réparation pour ${deviceName}` : lang === 'nl' ? `Reparatieprijzen voor ${deviceName}` : `Repair pricing for ${deviceName}`}</caption>
                    <thead className="bg-gray-50 dark:bg-slate-800">
                        <tr>
                            <th className="px-6 py-4 text-sm font-bold text-gray-500 uppercase tracking-wider">{lang === 'fr' ? 'Service de Réparation' : (lang === 'nl' ? 'Reparatiedienst' : (lang === 'tr' ? 'Onarım Hizmeti' : 'Repair Service'))}</th>
                            <th className="px-6 py-4 text-sm font-bold text-gray-500 uppercase tracking-wider text-right">{lang === 'fr' ? 'Prix Estimation' : (lang === 'nl' ? 'Schatting Prijs' : (lang === 'tr' ? 'Tahmini Fiyat' : 'Estimated Price'))}</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-slate-800">
                        {tableRows.map(row => (
                            <tr key={row.id} className="bg-white dark:bg-slate-900/50">
                                <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">
                                    {row.label} {deviceName}
                                </td>
                                <td className="px-6 py-4 text-right font-bold text-bel-blue">
                                    &euro;{row.price}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        );
        */
    };

    return (
        <section className="w-full bg-transparent py-16 lg:py-24 transition-colors duration-300">
            {getJSONLDSchema()}
            <div className="container mx-auto px-4 max-w-6xl">
                <div className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl rounded-3xl p-6 lg:p-12 shadow-2xl border border-white/20 dark:border-white/10">
                    <h2 className="text-3xl lg:text-4xl font-extrabold text-gray-900 dark:text-white mb-6 tracking-tight">
                        {getTitle()}
                    </h2>
                    <p className="text-lg lg:text-xl text-gray-600 dark:text-gray-300 mb-12 max-w-4xl leading-relaxed">
                        {getDescription()}
                    </p>

                    {/* Pain Points Generator SEO Block */}
                    {(() => {
                        const deviceCode = effectiveDeviceType; // 'smartphone', 'tablet', 'smartwatch', 'laptop', 'console_home'

                        const getPainPoints = () => {
                            if (!isRepair) {
                                // BUYBACK PAIN POINTS (Universal + Type Specific)
                                const typeEmoji = isConsole ? '🎮' : (deviceCode === 'smartwatch' ? '⌚' : (deviceCode === 'laptop' ? '💻' : '📱'));
                                const typeLabel = isConsole ? (lang === 'fr' ? 'Nouvelle Console ?' : 'New Console?') : (lang === 'fr' ? 'Nouveau Modèle ?' : 'New Model?');

                                if (lang === 'fr') return [
                                    { emoji: '💶', q: 'Besoin de Cash ?', a: 'Recevez de l\'argent immédiatement.' },
                                    { emoji: typeEmoji, q: typeLabel, a: 'Financez votre nouvel appareil.' },
                                    { emoji: '♻️', q: 'Ecolo ?', a: 'Donnez une seconde vie à votre appareil.' }
                                ];
                                if (lang === 'nl') return [
                                    { emoji: '💶', q: 'Geld Nodig?', a: 'Ontvang direct contant geld.' },
                                    { emoji: typeEmoji, q: typeLabel, a: 'Financier uw nieuwe toestel.' },
                                    { emoji: '♻️', q: 'Ecologisch?', a: 'Geef uw apparaat een tweede leven.' }
                                ];
                                if (lang === 'tr') return [
                                    { emoji: '💶', q: 'Nakde mi İhtiyacınız Var?', a: 'Anında nakit ödeme alın.' },
                                    { emoji: typeEmoji, q: typeLabel, a: 'Yeni cihazınızı finanse edin.' },
                                    { emoji: '♻️', q: 'Çevre Dostu mu?', a: 'Cihazınıza ikinci bir hayat verin.' }
                                ];
                                return [ // EN
                                    { emoji: '💶', q: 'Need Cash?', a: 'Get money immediately.' },
                                    { emoji: typeEmoji, q: typeLabel, a: 'Fund your new device.' },
                                    { emoji: '♻️', q: 'Eco-friendly?', a: 'Give your device a second life.' }
                                ];
                            }

                            // REPAIR PAIN POINTS
                            // 1. CONSOLES
                            if (deviceCode === 'console_home' || deviceCode === 'console_portable') {
                                if (lang === 'fr') return [
                                    { emoji: '🔌', q: 'Port HDMI ?', a: 'Pas de signal ou image qui saute.' },
                                    { emoji: '🔥', q: 'Surchauffe ?', a: 'Bruit de ventilation excessif.' },
                                    { emoji: '💿', q: 'Lecteur ?', a: 'Disque non reconnu ou bloqué.' }
                                ];
                                if (lang === 'nl') return [
                                    { emoji: '🔌', q: 'HDMI Poort?', a: 'Geen signaal of flikkerend beeld.' },
                                    { emoji: '🔥', q: 'Oververhitting?', a: 'Lawaaiige ventilator of valt uit.' },
                                    { emoji: '💿', q: 'Lezer?', a: 'Schijf wordt niet herkend.' }
                                ];
                                return [
                                    { emoji: '🔌', q: 'HDMI Port?', a: 'No signal or flickering image.' },
                                    { emoji: '🔥', q: 'Overheating?', a: 'Loud fan noise or shutdowns.' },
                                    { emoji: '💿', q: 'Disc Drive?', a: 'Not reading discs or stuck.' }
                                ];
                            }

                            // 2. LAPTOPS / MACBOOKS
                            if (deviceCode === 'laptop' || (model && model.includes('macbook'))) {
                                if (lang === 'fr') return [
                                    { emoji: '🔋', q: 'Batterie HS ?', a: 'Ne tient plus la charge ?' },
                                    { emoji: '⌨️', q: 'Clavier/Trackpad ?', a: 'Touches bloquées ou curseur fou.' },
                                    { emoji: '🖥️', q: 'Écran Cassé ?', a: 'Lignes, taches ou écran noir.' }
                                ];
                                if (lang === 'nl') return [
                                    { emoji: '🔋', q: 'Batterij Defect?', a: 'Laadt niet meer op?' },
                                    { emoji: '⌨️', q: 'Toetsenbord?', a: 'Toetsen werken niet goed.' },
                                    { emoji: '🖥️', q: 'Scherm Kapot?', a: 'Barsten of zwart scherm.' }
                                ];
                                return [
                                    { emoji: '🔋', q: 'Dead Battery?', a: 'Not holding charge anymore?' },
                                    { emoji: '⌨️', q: 'Keyboard/Trackpad?', a: 'Sticky keys or erratic cursor.' },
                                    { emoji: '🖥️', q: 'Broken Screen?', a: 'Cracks, lines or black screen.' }
                                ];
                            }

                            // 3. SMARTWATCHES
                            if (deviceCode === 'smartwatch') {
                                if (lang === 'fr') return [
                                    { emoji: '🔨', q: 'Verre Cassé ?', a: 'Vitre tactile fissurée.' },
                                    { emoji: '🔋', q: 'Batterie ?', a: 'Ne tient pas la journée.' },
                                    { emoji: '💧', q: 'Étanchéité ?', a: 'Condensation sous l\'écran.' }
                                ];
                                if (lang === 'nl') return [
                                    { emoji: '🔨', q: 'Glas Gebroken?', a: 'Barsten in het glas.' },
                                    { emoji: '🔋', q: 'Batterij?', a: 'Gaat snel leeg.' },
                                    { emoji: '💧', q: 'Waterdicht?', a: 'Condensatie onder scherm.' }
                                ];
                                return [
                                    { emoji: '🔨', q: 'Broken Glass?', a: 'Cracked touch screen.' },
                                    { emoji: '🔋', q: 'Battery?', a: 'Drains in less than a day.' },
                                    { emoji: '💧', q: 'Waterproof?', a: 'Condensation under screen.' }
                                ];
                            }

                            // 4. SMARTPHONES & TABLETS (Default)
                            if (lang === 'fr') return [
                                { emoji: '💥', q: 'Écran Cassé ?', a: 'Fissures, taches noires ou tactile en panne.' },
                                { emoji: '🔋', q: 'Batterie Faible ?', a: 'Se décharge vite ou s\'éteint tout seul.' },
                                { emoji: '💧', q: 'Oxydation ?', a: 'Tombé dans l\'eau ? Agissez vite !' }
                            ];
                            if (lang === 'nl') return [
                                { emoji: '💥', q: 'Scherm Kapot?', a: 'Barsten, vlekken of touch werkt niet.' },
                                { emoji: '🔋', q: 'Zwakke Batterij?', a: 'Loopt snel leeg of valt uit.' },
                                { emoji: '💧', q: 'Waterschade?', a: 'In water gevallen? Kom direct langs!' }
                            ];
                            if (lang === 'tr') return [
                                { emoji: '💥', q: 'Ekran mı Kırıldı?', a: 'Çatlaklar, siyah lekeler veya dokunmatik sorunları.' },
                                { emoji: '🔋', q: 'Piliniz mi Zayıf?', a: 'Hızlı boşalma veya beklenmedik kapanmalar.' },
                                { emoji: '💧', q: 'Sıvı Teması mı?', a: 'Suya mı düştü? Hızlı hareket edin!' }
                            ];
                            return [
                                { emoji: '💥', q: 'Broken Screen?', a: 'Cracks, black spots or touch issues.' },
                                { emoji: '🔋', q: 'Weak Battery?', a: 'Drains fast or unexpected shutdowns.' },
                                { emoji: '💧', q: 'Water Damage?', a: 'Dropped in water? Act fast!' }
                            ];
                        };

                        const painPoints = getPainPoints();

                        return (
                            <div className="mb-12">
                                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
                                    {lang === 'fr' ? 'Problèmes fréquents' : (lang === 'nl' ? 'Veelvoorkomende problemen' : (lang === 'tr' ? 'Sık Karşılaşılan Sorunlar' : 'Common Issues'))}
                                </h3>
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                    {painPoints.map((p, i) => (
                                        <div key={i} className="bg-gray-50/50 dark:bg-slate-800/50 p-4 rounded-xl border border-gray-100 dark:border-slate-700">
                                            <div className="text-4xl mb-2">{p.emoji}</div>
                                            <div className="font-bold text-gray-900 dark:text-white mb-1">{p.q}</div>
                                            <div className="text-sm text-gray-600 dark:text-gray-400">{p.a}</div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        );
                    })()}

                    {renderServiceBlocks()}
                    {renderPriceTable()}

                    {/* Brussels Hub Internal Linking (Neighborhood Authority) */}
                    {(locationName.toLowerCase().includes('brussel') || location?.isHub) && (
                        <div className="mb-12">
                            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                                {lang === 'fr' ? 'Zones d\'intervention à Bruxelles' : (lang === 'nl' ? 'Interventiezones in Brussel' : (lang === 'tr' ? 'Brüksel\'de Servis Bölgeleri' : 'Service Areas in Brussels'))}
                            </h3>
                            <div className="flex flex-wrap gap-4">
                                {SHOPS.filter(s => ['schaerbeek', 'molenbeek', 'anderlecht'].includes(String(s.id).toLowerCase())).map(shop => {
                                    // Construct internal link
                                    // /fr/reparation/apple/iphone-13/schaerbeek
                                    // We need to rebuild the URL based on current context
                                    // If service is missing (store page), default to 'reparation' or check location slug
                                    const serviceSlug = service?.slugs[lang] || 'reparation'; // fallback
                                    const baseUrl = `/${lang}/${serviceSlug}/${brand ? createSlug(brand) : ''}`;
                                    // If model exists, include it
                                    const modelPart = model ? `/${createSlug(model)}` : '';
                                    // Shop slug suffix
                                    const shopSlug = shop.slugs[lang];

                                    const href = `${baseUrl}${modelPart}/${shopSlug}`.replace('//', '/'); // Cleanup double slashes if no brand

                                    return (
                                        <a
                                            key={shop.id}
                                            href={href}
                                            className="px-4 py-2 bg-gray-100 dark:bg-slate-800 rounded-full text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-bel-blue hover:text-white transition-colors"
                                        >
                                            {shop.city}
                                        </a>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {/* Internal Linking: Cross-Funnel (Repair <-> Buyback) */}
                    {(() => {
                        if (!brand || !model) return null;
                        const targetType = isRepair ? 'buyback' : 'repair';
                        // Map the correct URL slug for the target service
                        const targetServiceSlug = isRepair
                            ? (lang === 'fr' ? 'rachat' : (lang === 'nl' ? 'verkopen' : (lang === 'tr' ? 'sat' : 'buyback')))
                            : (lang === 'fr' ? 'reparation' : (lang === 'nl' ? 'reparatie' : (lang === 'tr' ? 'tamir' : 'repair')));

                        const href = `/${lang}/${targetServiceSlug}/${createSlug(brand)}/${createSlug(model)}`;

                        const title = isRepair
                            ? (lang === 'fr' ? `Ou vendez votre ${deviceName}` : (lang === 'nl' ? `Of verkoop uw ${deviceName}` : (lang === 'tr' ? `Veya ${deviceName} cihazınızı satın` : `Or sell your ${deviceName}`)))
                            : (lang === 'fr' ? `Ou réparez votre ${deviceName}` : (lang === 'nl' ? `Of repareer uw ${deviceName}` : (lang === 'tr' ? `Veya ${deviceName} cihazınızı tamir ettirin` : `Or repair your ${deviceName}`)));

                        const desc = isRepair
                            ? (lang === 'fr' ? "La réparation est trop chère ? Nous rachetons votre appareil cash, même cassé !" : (lang === 'nl' ? "Is de reparatie te duur? Wij kopen uw toestel contant, zelfs defect!" : (lang === 'tr' ? "Tamir çok mu pahalı? Cihazınızı, bozuk olsa bile nakit karşılığında alıyoruz!" : "Repair too expensive? We buy your device for cash, even broken!")))
                            : (lang === 'fr' ? `Vous préférez le garder ? Nous le réparons en ${durationText}.` : (lang === 'nl' ? `Houdt u het liever? Wij repareren het in ${durationText}.` : (lang === 'tr' ? `Cihazınızı saklamayı mı tercih edersiniz? ${durationText} içinde tamir ediyoruz.` : `Prefer to keep it? We repair it in ${durationText}.`)));

                        const cta = isRepair
                            ? (lang === 'fr' ? 'Obtenir une offre de rachat' : (lang === 'nl' ? 'Krijg een inkoopbod' : (lang === 'tr' ? 'Geri Alım Teklifi Al' : 'Get Buyback Offer')))
                            : (lang === 'fr' ? 'Voir les tarifs de réparation' : (lang === 'nl' ? 'Bekijk reparatietarieven' : (lang === 'tr' ? 'Onarım Fiyatlarını Gör' : 'See Repair Prices')));

                        return (
                            <div className="mb-12 bg-white dark:bg-slate-800 border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-2xl p-8 flex flex-col md:flex-row items-center justify-between gap-6 hover:border-cyber-citron transition-colors group/crosslink">
                                <div>
                                    <h3 className="text-2xl font-black text-gray-900 dark:text-white mb-2 group-hover/crosslink:text-cyber-citron transition-colors">{title}</h3>
                                    <p className="text-gray-600 dark:text-gray-300 font-medium">{desc}</p>
                                </div>
                                <a href={href} className="px-8 py-4 bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-black rounded-xl hover:scale-105 transition-transform whitespace-nowrap shadow-lg">
                                    {cta}
                                </a>
                            </div>
                        );
                    })()}

                    {/* Internal Linking: B2B Promo (Only on Repair Pages) */}
                    {isRepair && (
                        <div className="mb-12 bg-linear-to-r from-slate-900 to-bel-blue rounded-2xl p-8 lg:p-10 text-white relative overflow-hidden shadow-2xl">
                            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
                            <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
                                <div>
                                    <span className="inline-block px-3 py-1 bg-cyber-citron text-midnight text-[10px] font-black uppercase tracking-widest rounded-full mb-4">
                                        {lang === 'fr' ? 'Pour les Pros' : (lang === 'nl' ? 'Voor Bedrijven' : (lang === 'tr' ? 'Kurumsal' : 'For Business'))}
                                    </span>
                                    <h3 className="text-2xl lg:text-3xl font-black mb-2">
                                        {lang === 'fr' ? 'Vous gérez une flotte mobile ?' : (lang === 'nl' ? 'Beheert u een mobiele vloot?' : (lang === 'tr' ? 'Mobil bir filoyu mu yönetiyorsunuz?' : 'Managing a mobile fleet?'))}
                                    </h3>
                                    <p className="text-slate-200 text-lg max-w-xl">
                                        {lang === 'fr' ? 'Profitez de tarifs dégressifs, de la facturation mensuelle et d\'un service prioritaire.' : (lang === 'nl' ? 'Geniet van staffelprijzen, maandelijkse facturatie en prioritaire service.' : (lang === 'tr' ? 'Toplu indirimlerin, aylık faturalandırmanın ve öncelikli hizmetin keyfini çıkarın.' : 'Enjoy volume discounts, monthly billing, and priority service.'))}
                                    </p>
                                </div>
                                <a
                                    href={`/${lang}/business`}
                                    className="px-8 py-4 bg-white text-midnight font-black rounded-xl hover:bg-cyber-citron transition-colors whitespace-nowrap shadow-lg"
                                >
                                    {lang === 'fr' ? 'Découvrir Belmobile Pro' : (lang === 'nl' ? 'Ontdek Belmobile Pro' : (lang === 'tr' ? 'Belmobile Pro\'yu Keşfedin' : 'Discover Belmobile Pro'))}
                                </a>
                            </div>
                        </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* Card 1 */}
                        <div className="bg-gray-50 dark:bg-slate-950/50 p-8 rounded-2xl border border-gray-200 dark:border-slate-800 hover:border-bel-blue/30 transition-colors group">
                            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 text-bel-blue rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                                <ClockIcon className="w-6 h-6" aria-hidden="true" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4 group-hover:text-bel-blue transition-colors">
                                {card1.title}
                            </h3>
                            <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                                {card1.text}
                            </p>
                        </div>

                        {/* Card 2 */}
                        <div className="bg-gray-50 dark:bg-slate-950/50 p-8 rounded-2xl border border-gray-200 dark:border-slate-800 hover:border-bel-blue/30 transition-colors group">
                            <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                                <ShieldCheckIcon className="w-6 h-6" aria-hidden="true" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4 group-hover:text-bel-blue transition-colors">
                                {card2.title}
                            </h3>
                            <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                                {card2.text}
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default DynamicSEOContent;
