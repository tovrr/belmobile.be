import React from 'react';
import { Location } from '../data/locations';
import { Service } from '../data/services';

interface LocalSEOContentProps {
    location?: Location;
    service: Service;
    device?: string;
    lang: 'fr' | 'nl' | 'en';
}

const LocalSEOContent: React.FC<LocalSEOContentProps> = ({ location, service, device, lang }) => {
    // This is a placeholder. In a real app, this would likely come from a CMS or a rich translation file.
    // For now, we generate simple dynamic content.

    const cityName = location ? (location.slugs[lang].charAt(0).toUpperCase() + location.slugs[lang].slice(1)) : (lang === 'fr' ? 'Bruxelles' : lang === 'nl' ? 'Brussel' : 'Brussels');
    const serviceName = service.name[lang];
    const deviceName = device ? device : (lang === 'fr' ? 'votre appareil' : lang === 'nl' ? 'uw apparaat' : 'your device');

    return (
        <div className="prose dark:prose-invert max-w-none mb-8">
            <h1 className="text-3xl font-bold mb-4">
                {serviceName} {deviceName} {lang === 'en' ? 'in' : 'à'} {cityName}
            </h1>
            <p className="text-lg mb-4">
                {lang === 'fr' && `Bienvenue chez ${location ? location.name : 'Belmobile'}. Nous sommes les experts de la ${service.slugs.fr} de ${deviceName} à ${cityName}.`}
                {lang === 'nl' && `Welkom bij ${location ? location.name : 'Belmobile'}. Wij zijn de experts in ${service.slugs.nl} van ${deviceName} in ${cityName}.`}
                {lang === 'en' && `Welcome to ${location ? location.name : 'Belmobile'}. We are the experts in ${deviceName} ${service.slugs.en} in ${cityName}.`}
            </p>
            <p>
                {location && (
                    <>
                        {lang === 'fr' && `Notre atelier situé à ${location.address} vous accueille pour tous vos besoins.`}
                        {lang === 'nl' && `Onze werkplaats aan de ${location.address} verwelkomt u voor al uw behoeften.`}
                        {lang === 'en' && `Our workshop located at ${location.address} welcomes you for all your needs.`}
                    </>
                )}
                {!location && (
                    <>
                        {lang === 'fr' && `Visitez l'un de nos magasins à Bruxelles.`}
                        {lang === 'nl' && `Bezoek een van onze winkels in Brussel.`}
                        {lang === 'en' && `Visit one of our stores in Brussels.`}
                    </>
                )}
            </p>
        </div>
    );
};

export default LocalSEOContent;
