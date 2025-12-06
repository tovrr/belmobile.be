'use client';

import React from 'react';
import StoreLocator from './StoreLocator';
import BuybackRepair from './BuybackRepair';
import LocalSEOContent from './LocalSEOContent';
import { Service } from '../data/services';
import { Location } from '../data/locations';
import { Shop } from '../types';
import ReviewsSection from './ReviewsSection';

interface BrusselsHubProps {
    lang: string;
    service: Service;
    location: Location;
    hubShops: Shop[];
    type: 'buyback' | 'repair';
}

const BrusselsHub: React.FC<BrusselsHubProps> = ({ lang, service, location, hubShops, type }) => {
    return (
        <div className="container mx-auto px-4 py-8">
            <LocalSEOContent
                service={service}
                location={location}
                device={undefined}
                lang={lang as 'fr' | 'nl' | 'en'}
            />

            <div className="mt-8">
                <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">
                    {lang === 'fr' ? 'Nos magasins à Bruxelles' : lang === 'nl' ? 'Onze winkels in Brussel' : 'Our Stores in Brussels'}
                </h2>
                <StoreLocator
                    shops={hubShops}
                    className="h-[600px] rounded-2xl shadow-xl border border-gray-200 dark:border-slate-700"
                    zoom={12}
                />
            </div>

            <ReviewsSection lang={lang} />

            <div className="mt-12">
                <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">
                    {lang === 'fr' ? 'Ou commencez votre réparation en ligne' : lang === 'nl' ? 'Of start uw reparatie online' : 'Or start your repair online'}
                </h2>
                <BuybackRepair
                    type={type}
                    initialShop={undefined}
                    initialDevice={undefined}
                />
            </div>
        </div>
    );
};

export default BrusselsHub;
