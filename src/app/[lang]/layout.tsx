import React, { Suspense } from 'react';
import Link from 'next/link';
import Header from '../../components/layout/Header';
import Breadcrumbs from '../../components/layout/Breadcrumbs';
import { Providers } from '../../components/common/Providers';

import Footer from '../../components/layout/Footer';
import AIChatAssistantWrapper from '../../components/chat/AIChatAssistantWrapper';
import CookieConsent from '../../components/common/CookieConsent';
import GoogleAnalytics from '../../components/seo/GoogleAnalytics';
import { TranslationDict } from '../../utils/translations';
import path from 'path';
import { promises as fs } from 'fs';
import SchemaMarkup from '../../components/seo/SchemaMarkup';
import FaviconHeartbeat from '../../components/ui/FaviconHeartbeat';

export async function generateStaticParams() {
    return [{ lang: 'en' }, { lang: 'fr' }, { lang: 'nl' }, { lang: 'tr' }];
}

async function getTranslations(lang: string): Promise<TranslationDict> {
    try {
        const filePath = path.join(process.cwd(), 'src/data/i18n', `${lang}.json`);
        const fileContent = await fs.readFile(filePath, 'utf8');
        return JSON.parse(fileContent);
    } catch (error) {
        // Ignore errors for system files, robots, or sitemaps accidentally hitting the [lang] route
        const ignored = ['favicon.ico', 'robots.txt', 'sitemap.xml', 'sitemap'];
        if (ignored.includes(lang) || lang.startsWith('.well-known')) {
            return {};
        }
        console.warn(`Missing translation file for ${lang}`);
        return {};
    }
}

import LayoutWrapper from '../../components/layout/LayoutWrapper';

// ... imports remain the same ...

export default async function LangLayout({
    children,
    params,
}: {
    children: React.ReactNode;
    params: Promise<{ lang: string }>;
}) {
    const { lang } = await params;
    const translations = await getTranslations(lang);

    return (
        <Providers lang={lang} translations={translations}>
            <div className="min-h-screen flex flex-col font-sans text-slate-900 dark:text-white bg-gray-50 dark:bg-slate-900 transition-colors duration-300">
                <Link
                    href="#main-content"
                    className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:p-4 focus:bg-white focus:text-black focus:rounded-md focus:shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                    {translations['Skip to content'] || 'Skip to content'}
                </Link>

                <LayoutWrapper>
                    <Suspense fallback={<div className="h-20" />}>
                        <Header />
                    </Suspense>
                    <Suspense fallback={<div className="h-6" />}>
                        <Breadcrumbs />
                    </Suspense>
                </LayoutWrapper>

                <main id="main-content" className="grow">
                    {children}
                </main>

                <LayoutWrapper>
                    <Suspense fallback={<div className="h-40" />}>
                        <Footer lang={lang} dict={translations} />
                    </Suspense>
                    <CookieConsent />
                    <AIChatAssistantWrapper />
                    <FaviconHeartbeat />
                </LayoutWrapper>

                <GoogleAnalytics />
                <SchemaMarkup type="organization" />
            </div>
        </Providers>
    );
}
