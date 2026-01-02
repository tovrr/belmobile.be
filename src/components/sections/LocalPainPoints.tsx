import { ClockIcon, CurrencyEuroIcon, ShieldCheckIcon, MapPinIcon } from '@heroicons/react/24/outline';
import { slugToDisplayName } from '../../utils/slugs';

interface LocalPainPointsProps {
    lang: 'fr' | 'nl' | 'en';
    locationName: string;
    deviceType?: string;
    type?: 'repair' | 'buyback';
}

export default function LocalPainPoints({ lang, locationName, deviceType: rawDeviceType, type = 'repair' }: LocalPainPointsProps) {
    const deviceType = rawDeviceType ? slugToDisplayName(rawDeviceType) : '';
    const isBrussels = (locationName || '').toLowerCase().includes('brussels') || (locationName || '').toLowerCase().includes('bruxelles') || (locationName || '').toLowerCase().includes('brussel');

    const content = {
        fr: {
            repair: {
                title: `Pourquoi réparer votre ${deviceType || 'appareil'} à ${locationName} ?`,
                points: [
                    {
                        icon: ClockIcon,
                        title: "Pas le temps ?",
                        text: "Réparation en 30 minutes chrono. Profitez d'un café ou faites vos courses pendant que nous remettons votre appareil à neuf."
                    },
                    {
                        icon: MapPinIcon,
                        title: isBrussels ? "Stationnement difficile ?" : "Facile d'accès",
                        text: isBrussels
                            ? "Nos magasins à Schaerbeek, Molenbeek et Anderlecht sont situés sur des axes majeurs. Parking aisé ou métro à proximité."
                            : "Accès facile et parking gratuit devant le magasin."
                    },
                    {
                        icon: ShieldCheckIcon,
                        title: "Peur de la qualité ?",
                        text: "Nous utilisons des pièces premium et offrons une garantie d'un an. Votre appareil est entre de bonnes mains (expertes)."
                    },
                    {
                        icon: CurrencyEuroIcon,
                        title: "Budget serré ?",
                        text: "Transparence totale. Le prix est fixé à l'avance, aucun frais caché. Si ce n'est pas réparable, vous ne payez rien."
                    }
                ]
            },
            buyback: {
                title: `Pourquoi vendre votre ${deviceType || 'appareil'} à ${locationName} ?`,
                points: [
                    {
                        icon: ClockIcon,
                        title: "Estimation Immédiate",
                        text: "Recevez une offre de reprise ferme en moins de 2 minutes. Pas d'attente, pas de complications."
                    },
                    {
                        icon: MapPinIcon,
                        title: "Accès Facile",
                        text: isBrussels
                            ? "Déposez votre appareil rapidement dans nos magasins à Schaerbeek, Molenbeek ou Anderlecht."
                            : `Déposez votre appareil rapidement dans notre magasin à ${locationName}.`
                    },
                    {
                        icon: ShieldCheckIcon,
                        title: "Paiement Sécurisé",
                        text: "Paiement immédiat par virement bancaire sécurisé ou en espèces sur place. Sûr et garanti."
                    },
                    {
                        icon: CurrencyEuroIcon,
                        title: "Meilleur Prix",
                        text: `Nous garantissons la meilleure offre de reprise du marché à ${locationName} pour votre ${deviceType || 'appareil'}.`
                    }
                ]
            }
        },
        nl: {
            repair: {
                title: `Waarom uw ${deviceType || 'toestel'} in ${locationName} repareren?`,
                points: [
                    {
                        icon: ClockIcon,
                        title: "Geen tijd?",
                        text: "Reparatie in 30 minuten. Geniet van een koffie of doe boodschappen terwijl wij uw toestel als nieuw maken."
                    },
                    {
                        icon: MapPinIcon,
                        title: isBrussels ? "Moeilijk parkeren?" : "Gemakkelijk bereikbaar",
                        text: isBrussels
                            ? "Onze winkels in Schaarbeek, Molenbeek en Anderlecht liggen aan hoofdwegen. Makkelijk parkeren of metro in de buurt."
                            : "Gemakkelijke toegang en gratis parkeren voor de deur."
                    },
                    {
                        icon: ShieldCheckIcon,
                        title: "Zorgen over kwaliteit?",
                        text: "Wij gebruiken premium onderdelen en bieden één jaar garantie. Uw toestel is in goede (expert) handen."
                    },
                    {
                        icon: CurrencyEuroIcon,
                        title: "Krap budget?",
                        text: "Volledige transparantie. De prijs staat vast, geen verborgen kosten. Niet te repareren? Geen kosten."
                    }
                ]
            },
            buyback: {
                title: `Waarom uw ${deviceType || 'toestel'} in ${locationName} verkopen?`,
                points: [
                    {
                        icon: ClockIcon,
                        title: "Onmiddellijke Schatting",
                        text: "Ontvang een vast overnamebod in minder dan 2 minuten. Geen wachttijd, geen gedoe."
                    },
                    {
                        icon: MapPinIcon,
                        title: "Gemakkelijke Toegang",
                        text: isBrussels
                            ? "Lever uw toestel snel in bij onze winkels in Schaarbeek, Molenbeek of Anderlecht."
                            : `Lever uw toestel snel in bij onze winkel in ${locationName}.`
                    },
                    {
                        icon: ShieldCheckIcon,
                        title: "Veilige Betaling",
                        text: "Onmiddellijke betaling via beveiligde bankoverschrijving of contant ter plaatse."
                    },
                    {
                        icon: CurrencyEuroIcon,
                        title: "Beste Prijs",
                        text: `Wij garanderen het beste overnamebod op de markt in ${locationName} voor uw ${deviceType || 'toestel'}.`
                    }
                ]
            }
        },
        en: {
            repair: {
                title: `Why repair your ${deviceType || 'device'} in ${locationName}?`,
                points: [
                    {
                        icon: ClockIcon,
                        title: "No time?",
                        text: "30-minute repair. Enjoy a coffee or run errands while we make your device meaningful again."
                    },
                    {
                        icon: MapPinIcon,
                        title: isBrussels ? "Hard to park?" : "Easy Access",
                        text: isBrussels
                            ? "Our stores in Schaerbeek, Molenbeek, and Anderlecht are on main roads. Easy parking or nearby metro."
                            : "Easy access and free parking in front of the shop."
                    },
                    {
                        icon: ShieldCheckIcon,
                        title: "Worried about quality?",
                        text: "We use premium parts and offer a 1-year warranty. Your device is in safe (expert) hands."
                    },
                    {
                        icon: CurrencyEuroIcon,
                        title: "Tight budget?",
                        text: "Total transparency. Price fixed upfront, no hidden fees. If we can't fix it, you pay nothing."
                    }
                ]
            },
            buyback: {
                title: `Why sell your ${deviceType || 'device'} in ${locationName}?`,
                points: [
                    {
                        icon: ClockIcon,
                        title: "Instant Estimate",
                        text: "Get a firm trade-in offer in less than 2 minutes. No wait, no hassle."
                    },
                    {
                        icon: MapPinIcon,
                        title: "Easy Access",
                        text: "Drop off your device quickly at our stores in Schaerbeek, Molenbeek, or Anderlecht."
                    },
                    {
                        icon: ShieldCheckIcon,
                        title: "Secure Payment",
                        text: "Immediate payment via secure bank transfer or cash on the spot. Safe and guaranteed."
                    },
                    {
                        icon: CurrencyEuroIcon,
                        title: "Best Price",
                        text: "We guarantee the best trade-in offer on the market in Brussels for your device."
                    }
                ]
            }
        },
        tr: {
            repair: {
                title: `Neden ${deviceType || 'cihazınızı'} ${locationName} konumunda tamir ettirmelisiniz?`,
                points: [
                    {
                        icon: ClockIcon,
                        title: "Vaktiniz mi yok?",
                        text: "30 dakikada tamir. Biz cihazınızı yenilerken siz kahvenizi için veya işlerinizi halledin."
                    },
                    {
                        icon: MapPinIcon,
                        title: isBrussels ? "Park sorunu mu?" : "Kolay Ulaşım",
                        text: isBrussels
                            ? "Schaerbeek, Molenbeek ve Anderlecht mağazalarımız ana caddelerdedir. Kolay park veya metro yakını."
                            : "Kolay ulaşım ve mağaza önünde park imkanı."
                    },
                    {
                        icon: ShieldCheckIcon,
                        title: "Kalite endişesi?",
                        text: "Premium parçalar kullanıyor ve 1 yıl garanti sunuyoruz. Cihazınız uzman ellerde."
                    },
                    {
                        icon: CurrencyEuroIcon,
                        title: "Bütçe dostu?",
                        text: "Tam şeffaflık. Fiyat önceden bellidir, sürpriz yok. Tamir edilemezse ücret ödemezsiniz."
                    }
                ]
            },
            buyback: {
                title: `Neden ${deviceType || 'cihazınızı'} ${locationName} konumunda satmalısınız?`,
                points: [
                    {
                        icon: ClockIcon,
                        title: "Anında Fiyat",
                        text: "2 dakikadan kısa sürede kesin teklif alın. Beklemek yok, prosedür yok."
                    },
                    {
                        icon: MapPinIcon,
                        title: "Kolay Ulaşım",
                        text: isBrussels
                            ? "Cihazınızı Schaerbeek, Molenbeek veya Anderlecht mağazalarımıza hızlıca bırakın."
                            : `${locationName} mağazamıza cihazınızı hızlıca bırakın.`
                    },
                    {
                        icon: ShieldCheckIcon,
                        title: "Güvenli Ödeme",
                        text: "Banka havalesi veya elden nakit ödeme ile anında paranızı alın. Güvenli ve garantili."
                    },
                    {
                        icon: CurrencyEuroIcon,
                        title: "En İyi Fiyat",
                        text: `${locationName} bölgesinde cihazınız için en iyi geri alım fiyatını garanti ediyoruz.`
                    }
                ]
            }
        }
    };

    const t = content[lang] ? content[lang][type] : content['en'][type];

    return (
        <section className="py-12 bg-transparent">
            <div className="container mx-auto px-4 max-w-6xl">
                <div className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl rounded-3xl p-8 lg:p-12 shadow-2xl border border-white/20 dark:border-white/10">
                    <h2 className="text-2xl md:text-3xl font-bold text-center mb-12 text-gray-900 dark:text-white">
                        {t.title}
                    </h2>
                    <div className="flex overflow-x-auto pb-6 -mx-4 px-4 gap-4 md:grid md:grid-cols-2 lg:grid-cols-4 md:gap-8 md:overflow-visible snap-x snap-mandatory no-scrollbar">
                        {t.points.map((point, idx) => (
                            <div key={idx} className="min-w-[260px] md:min-w-0 flex flex-col items-center text-center group snap-center bg-gray-50 dark:bg-slate-950/50 p-6 rounded-2xl border border-gray-200 dark:border-slate-800 hover:border-bel-blue/30 transition-all duration-300">
                                <div className="w-16 h-16 bg-blue-50 dark:bg-slate-800 rounded-2xl flex items-center justify-center mb-6 text-bel-blue group-hover:scale-110 transition-transform duration-300 shadow-sm md:shadow-none">
                                    <point.icon className="w-8 h-8" />
                                </div>
                                <h3 className="text-lg font-bold mb-3 text-gray-900 dark:text-white group-hover:text-bel-blue transition-colors">
                                    {point.title}
                                </h3>
                                <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
                                    {point.text}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
}

