
import React from 'react';
import { useLanguage } from '../hooks/useLanguage';
import { MOCK_SHOPS } from '../constants';

const SchemaMarkup: React.FC = () => {
    const { language } = useLanguage();

    // 1. Organization Schema (Brand Authority)
    const organizationSchema = {
        "@context": "https://schema.org",
        "@type": "Organization",
        "name": "Belmobile.be",
        "url": "https://belmobile.be",
        "logo": "https://belmobile.be/logo.png",
        "sameAs": [
            "https://www.facebook.com/belmobile",
            "https://www.instagram.com/belmobile",
            "https://www.linkedin.com/company/belmobile"
        ],
        "contactPoint": {
            "@type": "ContactPoint",
            "telephone": "+32-484-83-75-60",
            "contactType": "customer service",
            "areaServed": "BE",
            "availableLanguage": ["English", "French", "Dutch"]
        }
    };

    // 2. LocalBusiness Schema (Map Pack & Local SEO)
    // We map over your MOCK_SHOPS to create an array of store entities
    const localBusinessSchema = MOCK_SHOPS.filter(s => s.status === 'open').map(shop => ({
        "@context": "https://schema.org",
        "@type": "MobilePhoneStore",
        "name": shop.name,
        "image": "https://belmobile.be/store-front.jpg",
        "@id": `https://belmobile.be/stores/${shop.id}`,
        "url": `https://belmobile.be/${language}/stores`,
        "telephone": shop.phone,
        "address": {
            "@type": "PostalAddress",
            "streetAddress": shop.address.split(',')[0],
            "addressLocality": "Brussels", // Simplified for mock
            "postalCode": "1000", // Simplified
            "addressCountry": "BE"
        },
        "geo": {
            "@type": "GeoCoordinates",
            "latitude": shop.coords.lat,
            "longitude": shop.coords.lng
        },
        "openingHoursSpecification": {
            "@type": "OpeningHoursSpecification",
            "dayOfWeek": [
                "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"
            ],
            "opens": "10:30",
            "closes": "19:00"
        },
        "priceRange": "€€"
    }));

    return (
        <>
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }} />
            {localBusinessSchema.map((schema, index) => (
                <script key={index} type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
            ))}
        </>
    );
};

export default SchemaMarkup;
