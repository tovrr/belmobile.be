import React from 'react';
import Link from 'next/link';
import { Bike } from 'lucide-react';
import { TranslationDict } from '@/utils/translations';

interface FooterColumnsProps {
    lang: string;
    dict: TranslationDict;
}

const FooterColumns: React.FC<FooterColumnsProps> = ({ lang, dict }) => {
    // Simple helper if dict lookup fails
    const t = (key: string) => dict[key] || key;
    const language = lang;

    return (
        <div className="contents">
            {/* Services Column (Span 3) */}
            <div className="col-span-1 lg:col-span-3">
                <h4 className="font-bold uppercase tracking-widest text-xs mb-6 text-cyber-citron">
                    <Link
                        href={
                            language === 'nl'
                                ? '/nl/diensten'
                                : language === 'tr'
                                    ? '/tr/hizmetler'
                                    : `/${language}/services`
                        }
                        className="hover:text-white transition-colors duration-200"
                    >
                        {t('Services')}
                    </Link>
                </h4>
                <ul className="space-y-4 text-sm text-slate-400">
                    <li><Link href={`/${language}/${language === 'fr' ? 'reparation' : language === 'nl' ? 'reparatie' : language === 'tr' ? 'tamir' : 'repair'}`} className="hover:text-white transition-colors hover:translate-x-1 inline-block duration-200">{t('Repair')}</Link></li>
                    <li><Link href={`/${language}/${language === 'fr' ? 'rachat' : language === 'nl' ? 'inkoop' : language === 'tr' ? 'sat' : 'buyback'}`} className="hover:text-white transition-colors hover:translate-x-1 inline-block duration-200">{t('Buyback')}</Link></li>
                    <li><Link href={`/${language}/${language === 'fr' ? 'produits' : language === 'nl' ? 'producten' : language === 'tr' ? 'urunler' : 'products'}`} className="hover:text-white transition-colors hover:translate-x-1 inline-block duration-200">{t('Products')}</Link></li>
                    <li>
                        <Link
                            href={
                                language === 'nl'
                                    ? '/nl/zakelijk'
                                    : language === 'tr'
                                        ? '/tr/kurumsal'
                                        : `/${language}/business`
                            }
                            className="hover:text-white transition-colors hover:translate-x-1 inline-block duration-200"
                        >
                            {t('Business Solutions')}
                        </Link>
                    </li>
                    <li>
                        <Link
                            href={
                                language === 'fr'
                                    ? '/fr/services/recuperation-donnees'
                                    : language === 'nl'
                                        ? '/nl/services/data-recovery'
                                        : language === 'tr'
                                            ? '/tr/hizmetler/veri-kurtarma'
                                            : `/${language}/services/data-recovery`
                            }
                            className="hover:text-white transition-colors hover:translate-x-1 inline-block duration-200"
                        >
                            {t('Data Recovery')}
                        </Link>
                    </li>
                    <li>
                        <Link
                            href={
                                language === 'fr'
                                    ? '/fr/services/microsoudure'
                                    : language === 'nl'
                                        ? '/nl/services/microsolderen'
                                        : language === 'tr'
                                            ? '/tr/hizmetler/mikrosoldering'
                                            : `/${language}/services/microsoldering`
                            }
                            className="hover:text-white transition-colors hover:translate-x-1 inline-block duration-200"
                        >
                            {t('Microsoldering')}
                        </Link>
                    </li>
                    <li>
                        <Link href={`/${language}/students`} className="hover:text-white transition-colors hover:translate-x-1 inline-flex items-center duration-200 group">
                            <span className="font-semibold text-white">{t('Student Offers')}</span>
                            <span className="ml-2 px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 group-hover:bg-emerald-500 group-hover:text-white transition-all">
                                -10%
                            </span>
                        </Link>
                    </li>
                    <li>
                        <Link href={`/${language}/express-courier`} className="hover:text-white hover:translate-x-1 inline-flex items-center duration-200 group font-bold text-sky-400 transition-all">
                            <Bike className="w-4 h-4 mr-1.5 animate-pulse" />
                            {t('Express Courier')}
                        </Link>
                    </li>
                    <li>
                        <Link
                            href={
                                language === 'fr'
                                    ? '/fr/devenir-partenaire'
                                    : language === 'nl'
                                        ? '/nl/word-partner'
                                        : language === 'tr'
                                            ? '/tr/franchise'
                                            : `/${language}/franchise`
                            }
                            className="hover:text-white transition-colors hover:translate-x-1 inline-block duration-200"
                        >
                            {t('Become a Partner')}
                        </Link>
                    </li>
                    <li><Link href={`/${language}/${language === 'fr' ? 'carrieres' : language === 'nl' ? 'vacatures' : language === 'tr' ? 'kariyer' : 'jobs'}`} className="hover:text-white transition-colors hover:translate-x-1 inline-block duration-200">{t('Careers')}</Link></li>
                </ul>
            </div>

            {/* Support Column (Span 3) */}
            <div className="col-span-1 lg:col-span-3">
                <h4 className="font-bold uppercase tracking-widest text-xs mb-6 text-cyber-citron">
                    <Link
                        href={
                            language === 'nl'
                                ? '/nl/ondersteuning'
                                : `/${language}/support`
                        }
                        className="hover:text-white transition-colors duration-200"
                    >
                        {t('Support')}
                    </Link>
                </h4>
                <ul className="space-y-4 text-sm text-slate-400">
                    <li><Link href={`/${language}/contact`} className="hover:text-white transition-colors hover:translate-x-1 inline-block duration-200">{t('Contact Us')}</Link></li>
                    <li><Link href={`/${language}/${language === 'fr' ? 'magasins' : language === 'nl' ? 'winkels' : 'stores'}/${language === 'fr' ? 'bruxelles' : language === 'nl' ? 'brussel' : 'brussels'}`} className="hover:text-white transition-colors hover:translate-x-1 inline-block duration-200">{t('Store Locator')}</Link></li>
                    <li><Link href={`/${language}/faq`} className="hover:text-white transition-colors hover:translate-x-1 inline-block duration-200">{t('Help Center')}</Link></li>
                    <li>
                        <Link
                            href={
                                language === 'fr'
                                    ? '/fr/suivi-commande'
                                    : language === 'nl'
                                        ? '/nl/bestelling-volgen'
                                        : `/${language}/track-order`
                            }
                            className="hover:text-white transition-colors hover:translate-x-1 inline-block duration-200"
                        >
                            {t('Track Order')}
                        </Link>
                    </li>
                    <li><Link href={`/${language}/blog`} className="hover:text-white transition-colors hover:translate-x-1 inline-block duration-200">{t('Blog')}</Link></li>
                    <li>
                        <Link
                            href={
                                language === 'fr'
                                    ? '/fr/a-propos'
                                    : language === 'nl'
                                        ? '/nl/over-ons'
                                        : language === 'tr'
                                            ? '/tr/hakkimizda'
                                            : `/${language}/about`
                            }
                            className="hover:text-white transition-colors hover:translate-x-1 inline-block duration-200"
                        >
                            {t('About Us')}
                        </Link>
                    </li>
                    <li>
                        <Link
                            href={
                                language === 'fr'
                                    ? '/fr/a-propos/durabilite'
                                    : language === 'nl'
                                        ? '/nl/over-ons/duurzaamheid'
                                        : `/${language}/about/sustainability`
                            }
                            className="hover:text-white transition-colors hover:translate-x-1 inline-block duration-200"
                        >
                            {t('Sustainability')}
                        </Link>
                    </li>
                </ul>
            </div>

            {/* Legal Column (Span 2) */}
            <div className="col-span-1 lg:col-span-2">
                <h4 className="font-bold uppercase tracking-widest text-xs mb-6 text-cyber-citron">{t('Legal')}</h4>
                <ul className="space-y-4 text-sm text-slate-400">
                    <li>
                        <Link
                            href={
                                language === 'fr'
                                    ? '/fr/conditions-generales'
                                    : language === 'nl'
                                        ? '/nl/algemene-voorwaarden'
                                        : language === 'tr'
                                            ? '/tr/kosullar'
                                            : `/${language}/terms`
                            }
                            className="hover:text-white transition-colors hover:translate-x-1 inline-block duration-200"
                        >
                            {t('Terms of Service')}
                        </Link>
                    </li>
                    <li>
                        <Link
                            href={
                                language === 'fr'
                                    ? '/fr/vie-privee'
                                    : language === 'nl'
                                        ? '/nl/privacy'
                                        : language === 'tr'
                                            ? '/tr/gizlilik'
                                            : `/${language}/privacy`
                            }
                            className="hover:text-white transition-colors hover:translate-x-1 inline-block duration-200"
                        >
                            {t('Privacy Policy')}
                        </Link>
                    </li>
                    <li><Link href={`/${language}/cookies`} className="hover:text-white transition-colors hover:translate-x-1 inline-block duration-200">{t('Cookie Policy')}</Link></li>
                    <li>
                        <Link
                            href={
                                language === 'fr'
                                    ? '/fr/garantie'
                                    : language === 'nl'
                                        ? '/nl/garantie'
                                        : language === 'tr'
                                            ? '/tr/garanti'
                                            : `/${language}/warranty`
                            }
                            className="hover:text-white transition-colors hover:translate-x-1 inline-block duration-200"
                        >
                            {t('Warranty Info')}
                        </Link>
                    </li>
                </ul>
            </div>
        </div>
    );
};

export default FooterColumns;
