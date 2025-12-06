'use client';

import React from 'react';
import { useLanguage } from '../hooks/useLanguage';
import { MOCK_SHOPS } from '../constants';
import { Product, FAQItem } from '../types';

interface SchemaProps {
    type?: 'organization' | 'product' | 'breadcrumb' | 'faq' | 'article';
    product?: Product;
    breadcrumbs?: { name: string; item: string }[];
    faqItems?: { question: string; answer: string }[];
    shops?: any[]; // Using any[] to avoid circular dependency with Shop type if not imported, but better to import Shop
    isAvailable?: boolean;
}

const SchemaMarkup: React.FC<SchemaProps> = ({ type = 'organization', product, breadcrumbs, faqItems, shops = MOCK_SHOPS, isAvailable = true }) => {
    const { language } = useLanguage();

    // 1. Organization Schema (Brand Authority) - Always present on Home
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

    // 2. LocalBusiness Schema (Map Pack & Local SEO) - Always present on Home or Store Locator
    const localBusinessSchema = shops.filter(s => s.status === 'open').map(shop => ({
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
            "addressLocality": "Brussels",
            "postalCode": "1000",
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

    // 3. Product Schema
    const productSchema = product ? {
        "@context": "https://schema.org",
        "@type": "Product",
        "name": product.name,
        "image": product.imageUrl,
        "description": product.description,
        "brand": {
            "@type": "Brand",
            "name": product.brand || "Belmobile"
        },
        "offers": {
            "@type": "Offer",
            "url": `https://belmobile.be/${language}/buy/${product.category}/${product.slug}`,
            "priceCurrency": "EUR",
            "price": product.price,
            "availability": isAvailable ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
            "itemCondition": product.condition === 'perfect' ? "https://schema.org/RefurbishedCondition" : "https://schema.org/UsedCondition"
        }
    } : null;

    // 4. Breadcrumb Schema
    const breadcrumbSchema = breadcrumbs ? {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        "itemListElement": breadcrumbs.map((item, index) => ({
            "@type": "ListItem",
            "position": index + 1,
            "name": item.name,
            "item": item.item
        }))
    } : null;

    // 5. FAQ Schema
    const faqSchema = faqItems ? {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        "mainEntity": faqItems.map(item => ({
            "@type": "Question",
            "name": item.question,
            "acceptedAnswer": {
                "@type": "Answer",
                "text": item.answer
            }
        }))
    } : null;

    // 6. Article Schema (Blog Posts)
    const articleSchema = type === 'article' && product ? { // Reusing 'product' prop as generic data container or we can add a specific prop
        "@context": "https://schema.org",
        "@type": "Article",
        "headline": product.name, // Using product.name as title
        "image": product.imageUrl,
        "author": {
            "@type": "Person",
            "name": (product as any).author || "Belmobile Team"
        },
        "publisher": {
            "@type": "Organization",
            "name": "Belmobile.be",
            "logo": {
                "@type": "ImageObject",
                "url": "https://belmobile.be/logo.png"
            }
        },
        "datePublished": (product as any).date || new Date().toISOString(),
        "description": product.description
    } : null;

    return (
        <>
            {type === 'organization' && (
                <>
                    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }} />
                    {localBusinessSchema.map((schema, index) => (
                        <script key={index} type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
                    ))}
                </>
            )}

            {type === 'product' && productSchema && (
                <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(productSchema) }} />
            )}

            {type === 'breadcrumb' && breadcrumbSchema && (
                <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
            )}

            {type === 'faq' && faqSchema && (
                <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
            )}

            {type === 'article' && articleSchema && (
                <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }} />
            )}
        </>
    );
};

export default SchemaMarkup;

