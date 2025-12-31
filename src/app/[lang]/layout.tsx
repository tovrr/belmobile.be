import React, { Suspense } from 'react';
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

export async function generateStaticParams() {
    return [{ lang: 'en' }, { lang: 'fr' }, { lang: 'nl' }];
}

async function getTranslations(lang: string): Promise<TranslationDict> {
    try {
        const filePath = path.join(process.cwd(), 'src/data/i18n', `${lang}.json`);
        const fileContent = await fs.readFile(filePath, 'utf8');
        return JSON.parse(fileContent);
    } catch (error) {
        // Ignorer les erreurs pour les fichiers système ou robots
        if (lang === 'favicon.ico' || lang === 'robots.txt' || lang === 'sitemap.xml' || lang.startsWith('.well-known')) {
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
                <LayoutWrapper>
                    <Suspense fallback={<div className="h-20" />}>
                        <Header />
                    </Suspense>
                    <Suspense fallback={<div className="h-6" />}>
                        <Breadcrumbs />
                    </Suspense>
                </LayoutWrapper>

                <main className="grow">
                    {children}
                </main>

                <LayoutWrapper>
                    <Suspense fallback={<div className="h-40" />}>
                        <Footer lang={lang} dict={translations} />
                    </Suspense>
                    <CookieConsent />
                    <AIChatAssistantWrapper />
                </LayoutWrapper>

                <GoogleAnalytics />
                <SchemaMarkup type="organization" />
            </div>
        </Providers>
    );
}
