import React from 'react';
import { Shop } from '../../types';

interface SchemaOrgProps {
    shop?: Shop;
    service?: {
        id: string;
        name: { [key: string]: string };
        description: { [key: string]: string };
    };
    device?: string;
    deviceModel?: string;
    language: string;
    price?: number;
}

const SchemaOrg: React.FC<SchemaOrgProps> = ({ shop, service, device, deviceModel, language, price }) => {
    const baseUrl = 'https://belmobile.be';
    const schemas = [];

    // 1. LocalBusiness / MobilePhoneStore Schema
    if (shop) {
        const storeSchema = {
            "@context": "https://schema.org",
            "@type": "MobilePhoneStore",
            "name": shop.name,
            "image": `${baseUrl}/logo.png`,
            "@id": `${baseUrl}/${language}/stores/${shop.id}`,
            "url": `${baseUrl}/${language}/stores/${shop.id}`,
            "telephone": shop.phone,
            "email": shop.email,
            "address": {
                "@type": "PostalAddress",
                "streetAddress": shop.address,
                "addressLocality": shop.city || "Brussels",
                "postalCode": shop.zip || "1000",
                "addressCountry": "BE"
            },
            "geo": {
                "@type": "GeoCoordinates",
                "latitude": shop.coords?.lat || (shop as { coordinates?: { lat: number } }).coordinates?.lat || 0,
                "longitude": shop.coords?.lng || (shop as { coordinates?: { lng: number } }).coordinates?.lng || 0
            },
            "openingHoursSpecification": shop.openingHours && shop.openingHours.length > 0 ? shop.openingHours.map(() => {
                // Basic parsing, ideally we'd parse "Mon-Fri: 10:00 - 19:00" into structured data
                return {
                    "@type": "OpeningHoursSpecification",
                    "dayOfWeek": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
                    "opens": "10:00",
                    "closes": "19:00"
                };
            }) : [],
            "priceRange": "€€"
        };
        schemas.push(storeSchema);
    } else {
        // Organization Schema for general pages
        schemas.push({
            "@context": "https://schema.org",
            "@type": "Organization",
            "name": "Belmobile",
            "url": baseUrl,
            "logo": `${baseUrl}/logo.png`,
            "contactPoint": {
                "@type": "ContactPoint",
                "telephone": "+32 2 123 45 67", // Default contact
                "contactType": "customer service"
            }
        });
    }

    // 2. Service or Product Schema
    if (service) {
        const serviceName = service.name[language as keyof typeof service.name] || service.name.en;
        const serviceDesc = service.description[language as keyof typeof service.description] || service.description.en;
        const deviceName = device ? `${device} ${deviceModel || ''}`.trim() : 'Smartphone';

        if (service.id === 'repair') {
            const isConsole = [
                'PlayStation', 'Xbox', 'Nintendo', 'Switch', 'Steam Deck', 'Console'
            ].some(k => (device && device.includes(k)) || (deviceModel && deviceModel.includes(k)));

            const repairSchema = {
                "@context": "https://schema.org",
                "@type": "Service",
                "serviceType": isConsole ? "GameConsoleRepair" : "MobilePhoneRepair",
                "provider": shop ? {
                    "@type": "MobilePhoneStore",
                    "name": shop.name,
                    "address": shop.address
                } : {
                    "@type": "Organization",
                    "name": "Belmobile"
                },
                "name": `${serviceName} ${deviceName}`,
                "description": serviceDesc,
                "areaServed": shop ? {
                    "@type": "City",
                    "name": shop.city || "Brussels"
                } : {
                    "@type": "City",
                    "name": "Brussels",
                    "containedIn": {
                        "@type": "Country",
                        "name": "Belgium"
                    }
                },
                "offers": price ? {
                    "@type": "Offer",
                    "price": price,
                    "priceCurrency": "EUR",
                    "availability": "https://schema.org/InStock"
                } : undefined
            };
            schemas.push(repairSchema);
        } else if (service.id === 'buyback') {
            // For buyback, we can use a Product schema with an Offer to buy
            // Or a Service schema for "Electronics Recycling"
            const buybackSchema = {
                "@context": "https://schema.org",
                "@type": "Service",
                "serviceType": "ElectronicsRecycling",
                "provider": {
                    "@type": "Organization",
                    "name": "Belmobile"
                },
                "name": `${serviceName} ${deviceName}`,
                "description": serviceDesc
            };
            schemas.push(buybackSchema);
        }
    }

    // 3. BreadcrumbList Schema
    const breadcrumbItems = [
        {
            "@type": "ListItem",
            "position": 1,
            "name": "Home",
            "item": `${baseUrl}/${language}`
        }
    ];

    if (service) {
        breadcrumbItems.push({
            "@type": "ListItem",
            "position": 2,
            "name": service.name[language as keyof typeof service.name] || service.name.en,
            "item": `${baseUrl}/${language}/${service.id}` // Simplified URL construction
        });
    }

    if (device) {
        breadcrumbItems.push({
            "@type": "ListItem",
            "position": 3,
            "name": device,
            "item": `${baseUrl}/${language}/${service?.id}/${device.toLowerCase()}`
        });
    }

    if (shop) {
        breadcrumbItems.push({
            "@type": "ListItem",
            "position": breadcrumbItems.length + 1,
            "name": shop.name,
            "item": `${baseUrl}/${language}/stores/${shop.id}`
        });
    }

    const breadcrumbSchema = {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        "itemListElement": breadcrumbItems
    };
    schemas.push(breadcrumbSchema);

    return (
        <>
            {schemas.map((schema, index) => (
                <script
                    key={index}
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
                />
            ))}
        </>
    );
};

export default SchemaOrg;
