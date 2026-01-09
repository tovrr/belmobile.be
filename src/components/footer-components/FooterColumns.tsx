import React from 'react';
import Link from 'next/link';
import { BikeIcon, AcademicCapIcon as GraduationCap } from '../ui/BrandIcons';
import { TranslationDict } from '@/utils/translations';
import { getLocalizedPath } from '@/utils/i18n-helpers';
import { Locale } from '@/i18n-config';

interface FooterColumnsProps {
    lang: string;
    dict: TranslationDict;
}

/**
 * FooterColumns component renders the grouped links in the footer.
 * It uses the localized path helper to ensure cross-language navigation.
 */
const FooterColumns: React.FC<FooterColumnsProps> = ({ lang, dict }) => {
    const t = (key: string) => dict[key] || key;
    const language = lang as Locale;

    return (
        <div className="contents">
            {/* Column 1: Services */}
            <div className="col-span-1 lg:col-span-3">
                <h4 className="font-bold uppercase tracking-wider text-xs mb-4 text-cyber-citron">
                    <Link href={getLocalizedPath('/services', language)} className="block w-fit hover:text-white transition-colors">
                        {t('Services')}
                    </Link>
                </h4>
                <ul className="space-y-3.5 text-sm text-slate-400">
                    <li><Link href={getLocalizedPath('/repair', language)} className="hover:text-white transition-all hover:translate-x-1 inline-block duration-200">{t('Repair')}</Link></li>
                    <li><Link href={getLocalizedPath('/buyback', language)} className="hover:text-white transition-all hover:translate-x-1 inline-block duration-200">{t('Buyback')}</Link></li>
                    <li><Link href={getLocalizedPath('/products', language)} className="hover:text-white transition-all hover:translate-x-1 inline-block duration-200">{t('Products')}</Link></li>
                    <li><Link href={getLocalizedPath('/business', language)} className="hover:text-white transition-all hover:translate-x-1 inline-block duration-200">{t('Business Solutions')}</Link></li>
                    <li><Link href={getLocalizedPath('/services/data-recovery', language)} className="hover:text-white transition-all hover:translate-x-1 inline-block duration-200">{t('Data Recovery')}</Link></li>
                    <li><Link href={getLocalizedPath('/services/microsoldering', language)} className="hover:text-white transition-all hover:translate-x-1 inline-block duration-200">{t('Microsoudure')}</Link></li>
                    <li>
                        <Link href={getLocalizedPath('/students', language)} className="hover:text-white transition-all hover:translate-x-1 inline-flex items-center duration-200 group">
                            {t('Student Offers')}
                            <span className="ml-2 px-1 py-0.5 rounded text-[9px] font-black bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 group-hover:bg-emerald-500 group-hover:text-white transition-all">
                                -10%
                            </span>
                        </Link>
                    </li>
                    <li>
                        <Link href={getLocalizedPath('/express-courier', language)} className="hover:text-white transition-all hover:translate-x-1 inline-flex items-center gap-1.5 duration-200 text-sky-400 font-bold">
                            <BikeIcon className="w-3.5 h-3.5" />
                            {t('Express Courier')}
                        </Link>
                    </li>
                    <li><Link href={getLocalizedPath('/franchise', language)} className="hover:text-white transition-all hover:translate-x-1 inline-block duration-200">{t('Become a Partner')}</Link></li>
                    <li>
                        <Link href={getLocalizedPath('/training', language)} className="hover:text-white transition-all hover:translate-x-1 inline-flex items-center gap-1.5 duration-200">
                            <GraduationCap className="w-3.5 h-3.5 text-cyber-citron" />
                            {t('formation')}
                        </Link>
                    </li>
                    <li><Link href={getLocalizedPath('/careers', language)} className="hover:text-white transition-all hover:translate-x-1 inline-block duration-200">{t('Careers')}</Link></li>
                </ul>
            </div>

            {/* Column 2: Support */}
            <div className="col-span-1 lg:col-span-3">
                <h4 className="font-bold uppercase tracking-wider text-xs mb-4 text-cyber-citron">
                    <Link href={getLocalizedPath('/support', language)} className="block w-fit hover:text-white transition-colors">
                        {t('Support')}
                    </Link>
                </h4>
                <ul className="space-y-3.5 text-sm text-slate-400">
                    <li><Link href={getLocalizedPath('/contact', language)} className="hover:text-white transition-all hover:translate-x-1 inline-block duration-200">{t('Contact Us')}</Link></li>
                    <li><Link href={getLocalizedPath('/track-order', language)} className="hover:text-white transition-all hover:translate-x-1 inline-block duration-200">{t('Track Order')}</Link></li>
                    <li><Link href={getLocalizedPath('/faq', language)} className="hover:text-white transition-all hover:translate-x-1 inline-block duration-200">{t('Help Center')}</Link></li>
                    <li><Link href={getLocalizedPath('/stores', language)} className="hover:text-white transition-all hover:translate-x-1 inline-block duration-200">{t('Store Locator')}</Link></li>
                    <li><Link href={getLocalizedPath('/about', language)} className="hover:text-white transition-all hover:translate-x-1 inline-block duration-200">{t('About Us')}</Link></li>
                    <li><Link href={getLocalizedPath('/blog', language)} className="hover:text-white transition-all hover:translate-x-1 inline-block duration-200">{t('Blog')}</Link></li>
                    <li><Link href={getLocalizedPath('/sustainability', language)} className="hover:text-white transition-all hover:translate-x-1 inline-block duration-200">{t('Sustainability')}</Link></li>
                </ul>
            </div>

            {/* Column 3: Legal */}
            <div className="col-span-1 lg:col-span-2">
                <h4 className="font-bold uppercase tracking-wider text-xs mb-4 text-cyber-citron">
                    {t('Legal')}
                </h4>
                <ul className="space-y-3.5 text-sm text-slate-400">
                    <li><Link href={getLocalizedPath('/terms', language)} className="hover:text-white transition-all hover:translate-x-1 inline-block duration-200">{t('Terms of Service')}</Link></li>
                    <li><Link href={getLocalizedPath('/privacy', language)} className="hover:text-white transition-all hover:translate-x-1 inline-block duration-200">{t('Privacy Policy')}</Link></li>
                    <li><Link href={getLocalizedPath('/cookies', language)} className="hover:text-white transition-all hover:translate-x-1 inline-block duration-200">{t('Cookie Settings')}</Link></li>
                    <li><Link href={getLocalizedPath('/warranty', language)} className="hover:text-white transition-all hover:translate-x-1 inline-block duration-200">{t('Warranty Info')}</Link></li>
                </ul>
            </div>
        </div>
    );
};

export default FooterColumns;
