import React from 'react';
import { Metadata } from 'next';
import Link from 'next/link';
import Hreflang from '../../../components/seo/Hreflang';
import StoresLayout from '../../../components/stores/StoresLayout';

interface PageProps {
    params: Promise<{
        lang: string;
    }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
    const { lang } = await params;
    return {
        title: 'Our Stores - Belmobile',
        description: 'Find a Belmobile store near you in Brussels. Expert repair and buyback services.',
    };
}

export default async function StoresPage({ params }: PageProps) {
    const { lang } = await params;

    const hreflangSlugs = {
        fr: 'magasins',
        nl: 'winkels',
        en: 'stores'
    };

    return (
        <div className="min-h-screen bg-transparent">
            <Hreflang
                slugs={hreflangSlugs}
                baseUrl="https://belmobile.be"
            />

            {/* Full width layout for Map + Sidebar */}
            <StoresLayout lang={lang} />
        </div>
    );
}
