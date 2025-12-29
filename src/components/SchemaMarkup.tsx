'use client';

import React from 'react';
import { useLanguage } from '../hooks/useLanguage';
import { SHOPS } from '../constants';
import { Product, Shop } from '../types';

interface SchemaProps {
    type?: 'organization' | 'product' | 'breadcrumb' | 'faq' | 'article' | 'contact';
    product?: Product;
    article?: {
        headline: string;
        image: string;
        author: string;
        datePublished: string;
        dateModified?: string;
        description: string;
        slug: string;
    };
    breadcrumbs?: { name: string; item: string }[];
    faqItems?: { question: string; answer: string }[];
    shops?: Shop[];
    isAvailable?: boolean;
}

const SchemaMarkup: React.FC<SchemaProps> = ({ type = 'organization', product, breadcrumbs, faqItems, shops = SHOPS, isAvailable = true, ...props }) => {
    const { language, t } = useLanguage();

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
    const localBusinessSchema = shops.filter(s => s.status === 'open').map(shop => {
        // Extract municipality from title or address
        const municipality = shop.name.split(' - ')[1] || shop.city || "Brussels";
        const postalCode = shop.address.match(/\d{4}/)?.[0] || "1000";

        return {
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
                "addressLocality": municipality,
                "postalCode": postalCode,
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
        };
    });

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
    const articleSchema = type === 'article' && (props.article || product) ? {
        "@context": "https://schema.org",
        "@type": "Article",
        "headline": props.article?.headline || product?.name,
        "image": props.article?.image || product?.imageUrl,
        "author": {
            "@type": "Person",
            "name": props.article?.author || (product as any)?.author || "Belmobile Team"
        },
        "publisher": {
            "@type": "Organization",
            "name": "Belmobile.be",
            "logo": {
                "@type": "ImageObject",
                "url": "https://belmobile.be/logo.png"
            }
        },
        "datePublished": props.article?.datePublished || (product as any)?.date || new Date().toISOString(),
        "dateModified": props.article?.dateModified || props.article?.datePublished || (product as any)?.date || new Date().toISOString(),
        "description": props.article?.description || product?.description,
        "mainEntityOfPage": {
            "@type": "WebPage",
            "@id": `https://belmobile.be/${language}/blog/${props.article?.slug || (product as any)?.slug}`
        }
    } : null;

    // 7. ContactPage Schema
    const contactPageSchema = type === 'contact' ? {
        "@context": "https://schema.org",
        "@type": "ContactPage",
        "name": t('meta_contact_title'),
        "description": t('meta_contact_description'),
        "url": `https://belmobile.be/${language}/contact`,
        "mainEntity": organizationSchema
    } : null;

    return (
        <>

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

            {(type === 'contact' || type === 'organization') && (
                <>
                    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }} />
                    {localBusinessSchema.map((schema, index) => (
                        <script key={index} type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
                    ))}
                </>
            )}

            {type === 'contact' && contactPageSchema && (
                <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(contactPageSchema) }} />
            )}
        </>
    );
};

export default SchemaMarkup;
