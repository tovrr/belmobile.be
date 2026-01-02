import React from 'react';
import Link from 'next/link';
import { Bike, GraduationCap } from 'lucide-react';
import { TranslationDict } from '@/utils/translations';

interface FooterColumnsProps {
    lang: string;
    dict: TranslationDict;
}

const FooterColumns: React.FC<FooterColumnsProps> = ({ lang, dict }) => {
    const t = (key: string) => dict[key] || key;
    const language = lang;

    return (
        <div className="contents">
            {/* Column 1: Services */}
            <div className="col-span-1 lg:col-span-3">
                <h4 className="font-bold uppercase tracking-wider text-xs mb-4 text-cyber-citron">
                    <Link href={`/${language}/services`} className="block w-fit hover:text-white transition-colors">
                        {t('Services')}
                    </Link>
                </h4>
                <ul className="space-y-3.5 text-sm text-slate-400">
                    <li><Link href={`/${language}/${language === 'fr' ? 'reparation' : language === 'nl' ? 'reparatie' : language === 'tr' ? 'tamir' : 'repair'}`} className="hover:text-white transition-all hover:translate-x-1 inline-block duration-200">{t('Repair')}</Link></li>
                    <li><Link href={`/${language}/${language === 'fr' ? 'rachat' : language === 'nl' ? 'inkoop' : language === 'tr' ? 'sat' : 'buyback'}`} className="hover:text-white transition-all hover:translate-x-1 inline-block duration-200">{t('Buyback')}</Link></li>
                    <li><Link href={`/${language}/${language === 'fr' ? 'produits' : language === 'nl' ? 'producten' : language === 'tr' ? 'urunler' : 'products'}`} className="hover:text-white transition-all hover:translate-x-1 inline-block duration-200">{t('Products')}</Link></li>
                    <li><Link href={`/${language}/business`} className="hover:text-white transition-all hover:translate-x-1 inline-block duration-200">{t('Business Solutions')}</Link></li>
                    <li><Link href={`/${language}/services/data-recovery`} className="hover:text-white transition-all hover:translate-x-1 inline-block duration-200">{t('Data Recovery')}</Link></li>
                    <li><Link href={`/${language}/services/microsoudure`} className="hover:text-white transition-all hover:translate-x-1 inline-block duration-200">{t('Microsoudure')}</Link></li>
                    <li>
                        <Link href={`/${language}/students`} className="hover:text-white transition-all hover:translate-x-1 inline-flex items-center duration-200 group">
                            {t('Student Offers')}
                            <span className="ml-2 px-1 py-0.5 rounded text-[9px] font-black bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 group-hover:bg-emerald-500 group-hover:text-white transition-all">
                                -10%
                            </span>
                        </Link>
                    </li>
                    <li>
                        <Link href={`/${language}/express-courier`} className="hover:text-white transition-all hover:translate-x-1 inline-flex items-center gap-1.5 duration-200 text-sky-400 font-bold">
                            <Bike className="w-3.5 h-3.5" />
                            {t('Express Courier')}
                        </Link>
                    </li>
                    <li><Link href={`/${language}/franchise`} className="hover:text-white transition-all hover:translate-x-1 inline-block duration-200">{t('Become a Partner')}</Link></li>
                    <li>
                        <Link href={`/${language}/${language === 'nl' ? 'opleiding' : language === 'tr' ? 'egitim' : language === 'fr' ? 'formation' : 'training'}`} className="hover:text-white transition-all hover:translate-x-1 inline-flex items-center gap-1.5 duration-200">
                            <GraduationCap className="w-3.5 h-3.5 text-cyber-citron" />
                            {t('formation')}
                        </Link>
                    </li>
                    <li><Link href={`/${language}/#careers`} className="hover:text-white transition-all hover:translate-x-1 inline-block duration-200">{t('Careers')}</Link></li>
                </ul>
            </div>

            {/* Column 2: Support */}
            <div className="col-span-1 lg:col-span-3">
                <h4 className="font-bold uppercase tracking-wider text-xs mb-4 text-cyber-citron">
                    <Link href={`/${language}/support`} className="block w-fit hover:text-white transition-colors">
                        {t('Support')}
                    </Link>
                </h4>
                <ul className="space-y-3.5 text-sm text-slate-400">
                    <li><Link href={`/${language}/contact`} className="hover:text-white transition-all hover:translate-x-1 inline-block duration-200">{t('Contact Us')}</Link></li>
                    <li><Link href={`/${language}/stores`} className="hover:text-white transition-all hover:translate-x-1 inline-block duration-200">{t('Store Locator')}</Link></li>
                    <li><Link href={`/${language}/faq`} className="hover:text-white transition-all hover:translate-x-1 inline-block duration-200">{t('Help Center')}</Link></li>
                    <li><Link href={`/${language}/track-order`} className="hover:text-white transition-all hover:translate-x-1 inline-block duration-200">{t('Track Order')}</Link></li>
                    <li><Link href={`/${language}/blog`} className="hover:text-white transition-all hover:translate-x-1 inline-block duration-200">{t('Blog')}</Link></li>
                    <li><Link href={`/${language}/about`} className="hover:text-white transition-all hover:translate-x-1 inline-block duration-200">{t('About Us')}</Link></li>
                    <li><Link href={`/${language}/${language === 'nl' ? 'duurzaamheid' : language === 'tr' ? 'surdurulebilirlik' : language === 'fr' ? 'durabilite' : 'sustainability'}`} className="hover:text-white transition-all hover:translate-x-1 inline-block duration-200">Sustainability</Link></li>
                </ul>
            </div>

            {/* Column 3: Legal */}
            <div className="col-span-1 lg:col-span-2">
                <h4 className="font-bold uppercase tracking-wider text-xs mb-4 text-cyber-citron">
                    {language === 'fr' ? 'Information Légale' : 'Legal'}
                </h4>
                <ul className="space-y-3.5 text-sm text-slate-400">
                    <li><Link href={`/${language}/terms`} className="hover:text-white transition-all hover:translate-x-1 inline-block duration-200">{t('Terms of Service')}</Link></li>
                    <li><Link href={`/${language}/privacy`} className="hover:text-white transition-all hover:translate-x-1 inline-block duration-200">{t('Privacy Policy')}</Link></li>
                    <li><Link href={`/${language}/cookies`} className="hover:text-white transition-all hover:translate-x-1 inline-block duration-200">{t('Cookie Settings')}</Link></li>
                    <li><Link href={`/${language}/warranty`} className="hover:text-white transition-all hover:translate-x-1 inline-block duration-200">{t('Warranty Info')}</Link></li>
                </ul>
            </div>
        </div>
    );
};

export default FooterColumns;
