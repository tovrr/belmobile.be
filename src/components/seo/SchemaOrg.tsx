import React from 'react';
import { Shop } from '../../types';
import { createSlug } from '../../utils/slugs';

interface SchemaOrgProps {
    shop?: Shop;
    shops?: Shop[];
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

const SchemaOrg: React.FC<SchemaOrgProps> = ({ shop, shops, service, device, deviceModel, language, price }) => {
    const baseUrl = 'https://belmobile.be';
    const schemas = [];

    // 1. Organization Schema (Brand Authority)
    schemas.push({
        "@context": "https://schema.org",
        "@type": "Organization",
        "name": "Belmobile",
        "url": baseUrl,
        "logo": `${baseUrl}/logo.png`,
        "sameAs": [
            "https://www.facebook.com/belmobile",
            "https://www.instagram.com/belmobile",
            "https://www.tiktok.com/@belmobile.be"
        ],
        "contactPoint": {
            "@type": "ContactPoint",
            "telephone": "+32 484 83 75 60",
            "contactType": "customer service",
            "areaServed": "BE",
            "availableLanguage": ["English", "French", "Dutch"]
        }
    });

    // 2. LocalBusiness / MobilePhoneStore Schema
    const shopList = shop ? [shop] : shops || [];

    shopList.forEach(s => {
        const storeSchema = {
            "@context": "https://schema.org",
            "@type": "MobilePhoneStore",
            "name": s.name,
            "image": s.photos && s.photos.length > 0 ? s.photos[0] : `${baseUrl}/logo.png`,
            "@id": `${baseUrl}/${language}/stores/${s.id}`,
            "url": `${baseUrl}/${language}/stores/${s.id}`,
            "telephone": s.phone,
            "email": s.email,
            "address": {
                "@type": "PostalAddress",
                "streetAddress": s.address,
                "addressLocality": s.city || "Brussels",
                "postalCode": s.zip || "1000",
                "addressCountry": "BE"
            },
            "geo": {
                "@type": "GeoCoordinates",
                "latitude": s.coords?.lat || 0,
                "longitude": s.coords?.lng || 0
            },
            "openingHoursSpecification": s.openingHours && s.openingHours.length > 0 ? s.openingHours.map(hourStr => {
                // Better parsing for "Mon-Fri: 10:30 - 19:00"
                const [dayRange, timeRange] = hourStr.split(':').map(str => str.trim());
                if (!timeRange || timeRange.toLowerCase() === 'closed') {
                    return null;
                }

                const [opens, closes] = timeRange.split('-').map(str => str.trim());
                const dayMap: Record<string, string> = {
                    'Mon': 'Monday', 'Tue': 'Tuesday', 'Wed': 'Wednesday', 'Thu': 'Thursday', 'Fri': 'Friday', 'Sat': 'Saturday', 'Sun': 'Sunday'
                };

                let dayOfWeek: string[] = [];
                if (dayRange.includes('-')) {
                    const [start, end] = dayRange.split('-').map(str => str.trim());
                    const startIdx = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].indexOf(start);
                    const endIdx = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].indexOf(end);
                    if (startIdx !== -1 && endIdx !== -1) {
                        const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
                        dayOfWeek = days.slice(startIdx, endIdx + 1);
                    }
                } else {
                    dayOfWeek = [dayMap[dayRange] || dayRange];
                }

                return {
                    "@type": "OpeningHoursSpecification",
                    "dayOfWeek": dayOfWeek,
                    "opens": opens,
                    "closes": closes
                };
            }).filter(Boolean) : [],
            "priceRange": "€€"
        };
        schemas.push(storeSchema);
    });

    // 3. Service or Product Schema
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
                    "name": "Brussels"
                },
                "offers": price ? {
                    "@type": "Offer",
                    "price": price,
                    "priceCurrency": "EUR",
                    "availability": "https://schema.org/InStock"
                } : undefined,
                "aggregateRating": {
                    "@type": "AggregateRating",
                    "ratingValue": "4.8",
                    "reviewCount": "1250"
                }
            };
            schemas.push(repairSchema);

            // 5. Product Schema (For Rich Snippets on specific models)
            if (deviceModel) {
                const productSchema = {
                    "@context": "https://schema.org",
                    "@type": "Product",
                    "name": `${device} ${deviceModel}`,
                    "brand": {
                        "@type": "Brand",
                        "name": device || "Generic"
                    },
                    "description": serviceDesc,
                    "image": `${baseUrl}/images/devices/${createSlug(`${device}-${deviceModel}`)}.jpg`, // Fallback logic handled by Google if 404
                    "offers": price ? {
                        "@type": "Offer",
                        "price": price,
                        "priceCurrency": "EUR",
                        "availability": "https://schema.org/InStock",
                        "url": `${baseUrl}/${language}/reparation/${createSlug(device || '')}/${createSlug(deviceModel)}`
                    } : undefined,
                    "aggregateRating": {
                        "@type": "AggregateRating",
                        "ratingValue": "4.8",
                        "reviewCount": "85"
                    }
                };
                schemas.push(productSchema);
            }
        } else if (service.id === 'buyback') {
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

    // 4. BreadcrumbList Schema
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
            "item": `${baseUrl}/${language}/${service.id}`
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

