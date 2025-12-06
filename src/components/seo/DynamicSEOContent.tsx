import { Shop } from '../../types';
import { Location } from '../../data/locations';
import { Service } from '../../data/services';
import { slugToDisplayName } from '../../utils/slugs';

interface DynamicSEOContentProps {
    type: 'store' | 'repair' | 'buyback';
    lang: 'fr' | 'nl' | 'en';
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
    const locationName = shop?.city || location?.city || (lang === 'fr' ? 'Bruxelles' : 'Brussels');
    const isHub = location?.isHub || false;

    // Helper to get device name
    const getDeviceName = () => {
        // Format model name (convert slug to display name)
        const formattedModel = model ? slugToDisplayName(model) : '';

        if (formattedModel) return `${brand} ${formattedModel}`;

        if (brand) {
            // French: Type Brand (e.g., Smartphone Apple)
            if (lang === 'fr') {
                if (brand.toLowerCase() === 'apple' && deviceType === 'smartphone') return 'iPhone';
                return `${deviceType === 'smartphone' ? 'Smartphone' : 'Appareil'} ${brand}`;
            }
            // NL/EN: Brand Type (e.g., Apple Smartphone)
            return `${brand} ${deviceType || 'Devices'}`;
        }

        if (deviceType === 'smartphone') return lang === 'fr' ? 'Smartphone' : 'Smartphone';
        return lang === 'fr' ? 'Appareil' : 'Device';
    };

    const deviceName = getDeviceName();

    // Content Generation Logic
    const isRepair = type === 'repair';
    const isBuyback = type === 'buyback';
    const isStore = type === 'store';

    // Translations & Content Helpers
    const getTitle = () => {
        if (isStore) return lang === 'fr' ? `Magasin de réparation et rachat à ${locationName}` : lang === 'nl' ? `Reparatie en inkoop winkel in ${locationName}` : `Repair and Buyback Store in ${locationName}`;
        if (isRepair) return lang === 'fr' ? `Réparation ${deviceName} Professionnelle à ${locationName}` : lang === 'nl' ? `Professionele ${deviceName} Reparatie in ${locationName}` : `Professional ${deviceName} Repair in ${locationName}`;
        return lang === 'fr' ? `Rachat de ${deviceName} au meilleur prix à ${locationName}` : lang === 'nl' ? `Inkoop van ${deviceName} voor de beste prijs in ${locationName}` : `Sell your ${deviceName} for the best price in ${locationName}`;
    };

    const getDescription = () => {
        if (isStore) {
            return lang === 'fr'
                ? `Bienvenue chez ${shop?.name || 'Belmobile'}, votre expert local à ${locationName}. Situé au ${shop?.address}, nous offrons des services rapides pour smartphones, tablettes et consoles.`
                : lang === 'nl'
                    ? `Welkom bij ${shop?.name || 'Belmobile'}, uw lokale expert in ${locationName}. Gevestigd aan ${shop?.address}, bieden wij snelle diensten voor smartphones, tablets en consoles.`
                    : `Welcome to ${shop?.name || 'Belmobile'}, your local expert in ${locationName}. Located at ${shop?.address}, we offer fast services for smartphones, tablets, and consoles.`;
        }
        if (isRepair) {
            return lang === 'fr'
                ? `Vous cherchez une réparation rapide pour votre ${deviceName} ? Chez Belmobile, nos techniciens certifiés sont experts en appareils ${brand || 'toutes marques'}. Nous utilisons des pièces de qualité pour que votre ${deviceName} soit comme neuf. Que ce soit un écran cassé, une batterie ou de l'oxydation, nous avons la solution.`
                : lang === 'nl'
                    ? `Zoekt u een snelle reparatie voor uw ${deviceName}? Bij Belmobile zijn onze gecertificeerde technici experts in ${brand || 'alle merken'} apparaten. Wij gebruiken kwaliteitsonderdelen zodat uw ${deviceName} weer als nieuw is. Of het nu gaat om een gebroken scherm, een batterij of waterschade, wij hebben de oplossing.`
                    : `Looking for a fast repair for your ${deviceName}? At Belmobile, our certified technicians are experts in ${brand || 'all brands'} devices. We use quality parts so your ${deviceName} is like new. Whether it's a broken screen, a battery, or water damage, we have the solution.`;
        }
        return lang === 'fr'
            ? `Vous souhaitez vendre votre ${deviceName} à ${locationName} ? Belmobile vous offre la meilleure offre de reprise, payée immédiatement. Ne laissez pas votre ancien appareil prendre la poussière.`
            : lang === 'nl'
                ? `Wilt u uw ${deviceName} verkopen in ${locationName}? Belmobile biedt u het beste overnamebod, direct betaald. Laat uw oude apparaat geen stof verzamelen.`
                : `Do you want to sell your ${deviceName} in ${locationName}? Belmobile offers you the best trade-in deal, paid immediately. Don't let your old device gather dust.`;
    };

    const getCard1 = () => {
        const title = lang === 'fr' ? 'Pourquoi Nous Choisir ?' : lang === 'nl' ? 'Waarom Ons Kiezen?' : 'Why Choose Us?';
        const text = isRepair
            ? (lang === 'fr' ? `Garantie de 1 an sur toutes les réparations ${deviceName}. Remplacement d'écran en 30 minutes sur place.` : lang === 'nl' ? `1 jaar garantie op alle ${deviceName} reparaties. Schermvervanging in 30 minuten ter plaatse.` : `1 year warranty on all ${deviceName} repairs. Screen replacement in 30 minutes on site.`)
            : (lang === 'fr' ? 'Paiement instantané en cash ou virement. Meilleur prix garanti sur le marché.' : lang === 'nl' ? 'Directe betaling in contanten of per overschrijving. Beste prijsgarantie op de markt.' : 'Instant payment in cash or bank transfer. Best price guaranteed on the market.');
        return { title, text };
    };

    const getCard2 = () => {
        const title = lang === 'fr' ? 'Notre Expertise' : lang === 'nl' ? 'Onze Expertise' : 'Our Expertise';
        const text = isRepair
            ? (lang === 'fr' ? `Écran cassé, batterie faible ? Nous connaissons les ${brand || 'appareils'} par cœur. Visitez nos magasins à Schaerbeek, Anderlecht ou Molenbeek.` : lang === 'nl' ? `Gebroken scherm, zwakke batterij? Wij kennen ${brand || 'apparaten'} door en door. Bezoek onze winkels in Schaarbeek, Anderlecht of Molenbeek.` : `Broken screen, weak battery? We know ${brand || 'devices'} inside out. Visit our stores in Schaerbeek, Anderlecht, or Molenbeek.`)
            : (lang === 'fr' ? 'Estimation gratuite et sans engagement. Nous reprenons aussi les appareils cassés ou oxydés.' : lang === 'nl' ? 'Gratis en vrijblijvende schatting. Wij nemen ook kapotte of geoxideerde apparaten terug.' : 'Free and no-obligation estimate. We also buy back broken or water-damaged devices.');
        return { title, text };
    };

    const card1 = getCard1();
    const card2 = getCard2();

    // Generate FAQ Schema
    const getFAQSchema = () => {
        const faqs = [];

        if (isRepair) {
            // Repair FAQs
            if (lang === 'fr') {
                faqs.push(
                    {
                        question: `Combien de temps prend une réparation ${deviceName} ?`,
                        answer: `La plupart des réparations ${deviceName} sont effectuées en 30 minutes à 1 heure. Les réparations d'écran sont généralement les plus rapides. Pour des problèmes plus complexes comme l'oxydation, comptez 24-48h.`
                    },
                    {
                        question: `Quelle garantie offrez-vous sur les réparations ${deviceName} ?`,
                        answer: `Nous offrons une garantie de 12 mois sur toutes les pièces et la main d'œuvre pour les réparations ${deviceName}. Si vous rencontrez un problème avec la réparation, nous le corrigerons gratuitement.`
                    },
                    {
                        question: `Utilisez-vous des pièces originales pour ${deviceName} ?`,
                        answer: `Nous proposons plusieurs options : pièces génériques de qualité, pièces OLED premium, et pièces originales constructeur. Le choix vous appartient selon votre budget.`
                    },
                    {
                        question: `Puis-je obtenir un devis avant la réparation ?`,
                        answer: `Oui, nous offrons un diagnostic gratuit et un devis détaillé avant toute réparation ${deviceName}. Vous décidez ensuite si vous souhaitez procéder.`
                    }
                );
            } else if (lang === 'nl') {
                faqs.push(
                    {
                        question: `Hoe lang duurt een ${deviceName} reparatie?`,
                        answer: `De meeste ${deviceName} reparaties worden uitgevoerd in 30 minuten tot 1 uur. Schermreparaties zijn meestal het snelst. Voor complexere problemen zoals waterschade, reken op 24-48 uur.`
                    },
                    {
                        question: `Welke garantie bieden jullie op ${deviceName} reparaties?`,
                        answer: `We bieden 12 maanden garantie op alle onderdelen en arbeid voor ${deviceName} reparaties. Als u een probleem ondervindt met de reparatie, lossen we dit gratis op.`
                    },
                    {
                        question: `Gebruiken jullie originele onderdelen voor ${deviceName}?`,
                        answer: `We bieden verschillende opties: kwaliteitsvolle generieke onderdelen, premium OLED onderdelen, en originele fabrieksonderdelen. De keuze is aan u, afhankelijk van uw budget.`
                    },
                    {
                        question: `Kan ik een offerte krijgen voor de reparatie?`,
                        answer: `Ja, we bieden een gratis diagnose en gedetailleerde offerte voordat we een ${deviceName} reparatie uitvoeren. U beslist vervolgens of u wilt doorgaan.`
                    }
                );
            } else {
                faqs.push(
                    {
                        question: `How long does a ${deviceName} repair take?`,
                        answer: `Most ${deviceName} repairs are completed in 30 minutes to 1 hour. Screen replacements are typically the fastest. For more complex issues like water damage, allow 24-48 hours.`
                    },
                    {
                        question: `What warranty do you offer on ${deviceName} repairs?`,
                        answer: `We offer a 12-month warranty on all parts and labor for ${deviceName} repairs. If you experience any issues with the repair, we'll fix it for free.`
                    },
                    {
                        question: `Do you use original parts for ${deviceName}?`,
                        answer: `We offer multiple options: quality generic parts, premium OLED parts, and original manufacturer parts. The choice is yours based on your budget.`
                    },
                    {
                        question: `Can I get a quote before the repair?`,
                        answer: `Yes, we offer a free diagnostic and detailed quote before any ${deviceName} repair. You then decide if you want to proceed.`
                    }
                );
            }
        } else {
            // Buyback FAQs
            if (lang === 'fr') {
                faqs.push(
                    {
                        question: `Comment est calculé le prix de rachat de mon ${deviceName} ?`,
                        answer: `Le prix dépend de l'état (parfait, très bon, bon, acceptable), de la capacité de stockage, et de la demande du marché. Nous vous donnons une estimation instantanée en ligne.`
                    },
                    {
                        question: `Quand suis-je payé pour mon ${deviceName} ?`,
                        answer: `Le paiement est immédiat. Vous pouvez choisir entre paiement cash sur place ou virement bancaire instantané.`
                    },
                    {
                        question: `Dois-je effacer mes données avant de vendre mon ${deviceName} ?`,
                        answer: `Nous vous recommandons de faire une sauvegarde et de réinitialiser votre appareil. Si vous ne pouvez pas, nous le ferons gratuitement de manière sécurisée.`
                    },
                    {
                        question: `Acceptez-vous les appareils cassés ou oxydés ?`,
                        answer: `Oui, nous rachetons même les ${deviceName} cassés, oxydés ou ne s'allumant plus. Le prix sera ajusté en fonction de l'état.`
                    }
                );
            } else if (lang === 'nl') {
                faqs.push(
                    {
                        question: `Hoe wordt de inkoopprijs van mijn ${deviceName} berekend?`,
                        answer: `De prijs hangt af van de staat (perfect, zeer goed, goed, aanvaardbaar), opslagcapaciteit, en marktvraag. We geven u direct een online schatting.`
                    },
                    {
                        question: `Wanneer word ik betaald voor mijn ${deviceName}?`,
                        answer: `Betaling is onmiddellijk. U kunt kiezen tussen contante betaling ter plaatse of directe bankoverschrijving.`
                    },
                    {
                        question: `Moet ik mijn gegevens wissen voordat ik mijn ${deviceName} verkoop?`,
                        answer: `We raden aan een back-up te maken en uw apparaat te resetten. Als u dit niet kunt, doen wij dit gratis en veilig voor u.`
                    },
                    {
                        question: `Accepteren jullie kapotte of geoxideerde apparaten?`,
                        answer: `Ja, we kopen zelfs kapotte, geoxideerde of niet-werkende ${deviceName} toestellen. De prijs wordt aangepast aan de staat.`
                    }
                );
            } else {
                faqs.push(
                    {
                        question: `How is the buyback price for my ${deviceName} calculated?`,
                        answer: `The price depends on condition (perfect, very good, good, acceptable), storage capacity, and market demand. We give you an instant online estimate.`
                    },
                    {
                        question: `When do I get paid for my ${deviceName}?`,
                        answer: `Payment is immediate. You can choose between cash payment on-site or instant bank transfer.`
                    },
                    {
                        question: `Should I erase my data before selling my ${deviceName}?`,
                        answer: `We recommend backing up and resetting your device. If you can't, we'll do it for free in a secure manner.`
                    },
                    {
                        question: `Do you accept broken or water-damaged devices?`,
                        answer: `Yes, we buy back even broken, water-damaged, or non-working ${deviceName} devices. The price will be adjusted based on condition.`
                    }
                );
            }
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

    return (
        <section className="w-full bg-transparent py-16 lg:py-24 transition-colors duration-300">
            {getFAQSchema()}
            <div className="container mx-auto px-4 max-w-6xl">
                <div className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl rounded-3xl p-8 lg:p-12 shadow-2xl border border-white/20 dark:border-white/10">
                    <h2 className="text-3xl lg:text-4xl font-extrabold text-gray-900 dark:text-white mb-6 tracking-tight">
                        {getTitle()}
                    </h2>
                    <p className="text-lg lg:text-xl text-gray-600 dark:text-gray-300 mb-12 max-w-4xl leading-relaxed">
                        {getDescription()}
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* Card 1 */}
                        <div className="bg-gray-50 dark:bg-slate-950/50 p-8 rounded-2xl border border-gray-200 dark:border-slate-800 hover:border-bel-blue/30 transition-colors group">
                            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                                <span className="text-2xl">✨</span>
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
                            <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                                <span className="text-2xl">🛡️</span>
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
