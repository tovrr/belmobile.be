import React from 'react';
import Header from '../../components/Header';
import Breadcrumbs from '../../components/Breadcrumbs';
import { Providers } from '../../components/Providers';

import Footer from '../../components/Footer';
import AIChatAssistantWrapper from '../../components/AIChatAssistantWrapper';

export async function generateStaticParams() {
    return [{ lang: 'en' }, { lang: 'fr' }, { lang: 'nl' }];
}

export default async function LangLayout({
    children,
    params,
}: {
    children: React.ReactNode;
    params: Promise<{ lang: string }>;
}) {
    const { lang } = await params;
    return (
        <Providers lang={lang}>
            <div className="min-h-screen flex flex-col font-sans text-slate-900 dark:text-white bg-gray-50 dark:bg-slate-900 transition-colors duration-300">
                <Header />
                <Breadcrumbs />
                <main className="grow">
                    {children}
                </main>
                <Footer />
                <AIChatAssistantWrapper />
            </div>
        </Providers>
    );
}
