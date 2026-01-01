import { Shop } from '../../types';
import { Location } from '../../data/locations';
import { Service } from '../../data/services';
import { slugToDisplayName, createSlug } from '../../utils/slugs';
import { ShieldCheckIcon, ClockIcon, DevicePhoneMobileIcon, BoltIcon, BanknotesIcon, WrenchScrewdriverIcon, TvIcon, FireIcon } from '@heroicons/react/24/solid';

import { SHOPS, MOCK_REPAIR_PRICES } from '../../constants';
import { FAQS } from '../../data/faqs';

import { getSEOTitle, getSEODescription } from '../../utils/seoHelpers';

interface DynamicSEOContentProps {
    type: 'store' | 'repair' | 'buyback';
    lang: 'fr' | 'nl' | 'en' | 'tr';
    shop?: Shop; // For specific store pages
    location?: Location; // For location-based pages (hub or shop)
    service?: Service;
    brand?: string;
    model?: string;
    deviceType?: string;
}

const DynamicSEOContent: React.FC<DynamicSEOContentProps> = ({
    type,
    lang,
    shop,
    location,
    service,
    brand,
    model,
    deviceType
}) => {
    // Helper to get location name
    const locationName = shop?.city || location?.city || (lang === 'fr' ? 'Bruxelles' : (lang === 'nl' ? 'Brussel' : (lang === 'tr' ? 'Brüksel' : 'Brussels')));

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

        if (deviceType === 'smartphone') return 'Smartphone';
        return lang === 'fr' ? 'appareil' : (lang === 'nl' ? 'toestel' : (lang === 'tr' ? 'cihazı' : 'device'));
    };

    const deviceName = getDeviceName();

    // Content Generation Logic
    const isRepair = type === 'repair';
    const isStore = type === 'store';
    const isHomeConsole = deviceType === 'console_home';
    const isHub = !!shop?.isHub || !!location?.isHub;

    const issuesText = isHomeConsole
        ? (lang === 'fr' ? 'port HDMI ou surchauffe' : (lang === 'nl' ? 'HDMI-poort of oververhitting' : (lang === 'tr' ? 'HDMI portu veya aşırı ısınma' : 'HDMI port or overheating')))
        : (lang === 'fr' ? 'écran ou batterie' : (lang === 'nl' ? 'scherm of batterij' : (lang === 'tr' ? 'ekran veya batarya' : 'screen or battery')));

    const durationText = isHomeConsole
        ? (lang === 'fr' ? '3h à 4h' : (lang === 'nl' ? '3u tot 4u' : (lang === 'tr' ? '3-4 saat' : '3h to 4h')))
        : (lang === 'fr' ? '30 minutes' : (lang === 'nl' ? '30 minuten' : (lang === 'tr' ? '30 dakika' : '30 minutes')));

    // Find pricing data if model is provided
    const pricingSlug = model ? createSlug(`${brand} ${model}`) : '';
    const pricingData = MOCK_REPAIR_PRICES.find(p => p.id === pricingSlug);

    // Translations & Content Helpers
    const getTitle = () => getSEOTitle({ isStore, isRepair, lang, locationName, deviceName });

    const getDescription = () => getSEODescription({
        isStore, isRepair, lang, locationName, deviceName, isHub, shop, brand, issuesText, durationText
    });

    const getCard1 = () => {
        const title = lang === 'fr' ? 'Pourquoi Nous Choisir ?' : (lang === 'nl' ? 'Waarom Ons Kiezen?' : (lang === 'tr' ? 'Neden Biz?' : 'Why Choose Us?'));
        const text = isRepair
            ? (lang === 'fr' ? `Garantie de 1 an sur toutes les réparations ${deviceName}. Réparation en 30 minutes dans nos laboratoires de Schaerbeek et Anderlecht. Pièces d'origine certifiées.` : (lang === 'nl' ? `1 jaar garantie op alle ${deviceName} reparaties. Schermvervanging in 30 minuten in onze laboratoria (Schaerbeek/Anderlecht).` : (lang === 'tr' ? `Tüm ${deviceName} onarımlarında 1 yıl garanti. Schaerbeek ve Anderlecht laboratuvarlarımızda 30 dakikada orijinal parça ile onarım.` : `1-year warranty on all ${deviceName} repairs. 30-minute express repair in our Schaerbeek & Anderlecht labs using certified parts.`)))
            : (lang === 'fr' ? 'Paiement immédiat en Cash. Nous offrons les meilleurs taux de reprise de Bruxelles pour vos anciens appareils.' : (lang === 'nl' ? 'Directe betaling in contanten of per overschrijving. Beste prijsgarantie op de markt.' : (lang === 'tr' ? 'Anında nakit ödeme. Eski cihazlarınız için Brüksel\'deki en iyi geri alım oranlarını sunuyoruz.' : 'Instant payment in cash or bank transfer. Best price guaranteed on the market.')));
        return { title, text };
    };

    const getCard2 = () => {
        const title = lang === 'fr' ? 'Nos Adresses à Bruxelles' : (lang === 'nl' ? 'Onze Expertise' : (lang === 'tr' ? 'Uzmanlığımız' : 'Our Expertise'));

        // Generate dynamic address string from real shops
        const activeShops = SHOPS.filter(s => s.status === 'open');

        // Simplify to just City/Neighborhood names for cleaner UI
        const cityNames = activeShops.map(s => {
            // Capitalize first letter
            return String(s.id).charAt(0).toUpperCase() + String(s.id).slice(1);
        }).join(', ');

        const text = isRepair
            ? (lang === 'fr' ? `Retrouvez nos ateliers au cœur de Bruxelles à ${cityNames}. Sans rendez-vous.` : (lang === 'nl' ? `Gebroken scherm, zwakke batterij? Wij kennen ${brand || 'apparaten'} door en door. Bezoek onze winkels in ${cityNames}.` : (lang === 'tr' ? `Ekranınız mı kırıldı? ${brand || 'Cihazları'} en iyi biz tanıyoruz. ${cityNames} mağazalarımıza bekleriz.` : `Broken screen, weak battery? We know ${brand || 'devices'} inside out. Visit our stores in ${cityNames}.`)))
            : (lang === 'fr' ? `Estimation gratuite en 2 minutes dans nos magasins de ${cityNames}.` : (lang === 'nl' ? `Gratis schatting in onze winkels in ${cityNames}.` : (lang === 'tr' ? `${cityNames} mağazalarımızda 2 dakikada ücretsiz fiyat tahmini.` : `Free estimate in our stores in ${cityNames}.`)));
        return { title, text };
    };

    const card1 = getCard1();
    const card2 = getCard2();

    // Generate FAQ Schema
    const getFAQSchema = () => {
        let faqs = [];
        const langCode = (lang === 'fr' || lang === 'nl') ? lang : 'en';

        // 1. Core FAQs based on Type
        if (isRepair) {
            faqs = [...FAQS[langCode].repair];
        } else {
            faqs = [...FAQS[langCode].buyback];
        }

        // 2. Hub Specific FAQs (Brussels Authority)
        const isHub = !!location?.isHub || locationName.toLowerCase().includes('brussel');
        if (isHub) {
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

        const schema = {
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
        };

        return (
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
            />
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
                            ? `Écran cassé ou tactile défaillant ? Nous remplaçons votre dalle par des pièces d'origine ou premium en 30 minutes.`
                            : (lang === 'nl'
                                ? `Gebroken scherm of defecte touch? Wij vervangen uw scherm door originele of premium onderdelen in 30 minuten.`
                                : (lang === 'tr'
                                    ? `Ekran mı kırıldı? Orijinal veya premium parçalarla cihazınızın ekranını 30 dakikada değiştiriyoruz.`
                                    : `Broken screen or touch failure? We replace your display with original or premium parts in 30 minutes.`))
                    },
                    {
                        id: 'battery',
                        icon: BoltIcon,
                        title: lang === 'fr' ? `Remplacement de Batterie ${deviceName}` : (lang === 'nl' ? `Batterij Vervangen ${deviceName}` : (lang === 'tr' ? `${deviceName} Batarya Değişimi` : `Battery Replacement ${deviceName}`)),
                        text: lang === 'fr'
                            ? `Votre ${deviceName} se décharge trop vite ? Retrouvez une autonomie optimale avec une batterie neuve certifiée.`
                            : (lang === 'nl'
                                ? `Loopt uw ${deviceName} te snel leeg? Krijg de optimale batterijduur terug met een yeni gecertificeerde batterij.`
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
                        ? `Ne jetez pas votre appareil abîmé ! Nous rachetons les ${deviceName} avec écran fissuré ou batterie HS pour pièces.`
                        : (lang === 'nl'
                            ? `Gooi uw beschadigde apparaat niet weg! Wij kopen ${deviceName} toestellen met gebarsten schermen voor onderdelen.`
                            : (lang === 'tr'
                                ? `Hasarlı cihazınızı atmayın! Ekranı kırık veya bataryası bitik ${deviceName} cihazlarını parça amaçlı alıyoruz.`
                                : `Don't throw away your damaged device! We buy back ${deviceName} units with cracked screens or dead batteries for parts.`))
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
        if (!isRepair || !pricingData) return null;

        const tableRows = [
            { id: 'screen', label: lang === 'fr' ? 'Écran' : (lang === 'nl' ? 'Scherm' : (lang === 'tr' ? 'Ekran' : 'Screen')), price: pricingData.screen || pricingData.standard },
            { id: 'battery', label: lang === 'fr' ? 'Batterie' : (lang === 'nl' ? 'Batterij' : (lang === 'tr' ? 'Batarya' : 'Battery')), price: pricingData.battery },
            { id: 'charging', label: lang === 'fr' ? 'Connecteur de Charge' : (lang === 'nl' ? 'Oplaadpoort' : (lang === 'tr' ? 'Şarj Soketi' : 'Charging')), price: pricingData.charging },
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
    };

    return (
        <section className="w-full bg-transparent py-16 lg:py-24 transition-colors duration-300">
            {getFAQSchema()}
            <div className="container mx-auto px-4 max-w-6xl">
                <div className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl rounded-3xl p-6 lg:p-12 shadow-2xl border border-white/20 dark:border-white/10">
                    <h2 className="text-3xl lg:text-4xl font-extrabold text-gray-900 dark:text-white mb-6 tracking-tight">
                        {getTitle()}
                    </h2>
                    <p className="text-lg lg:text-xl text-gray-600 dark:text-gray-300 mb-12 max-w-4xl leading-relaxed">
                        {getDescription()}
                    </p>

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
