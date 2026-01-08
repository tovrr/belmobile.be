'use client';

import React from 'react';
import { useLanguage } from '../../hooks/useLanguage';
import { SHOPS } from '../../constants';
import { Product, Shop } from '../../types';

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
        "@type": "Organization",
        "@id": "https://belmobile.be/#organization",
        "name": "Belmobile.be",
        "legalName": "Belmobile Pro Solutions",
        "url": "https://belmobile.be",
        "logo": "https://belmobile.be/belmobile-logo.png",
        "foundingDate": "2011",
        "address": {
            "@type": "PostalAddress",
            "streetAddress": "Rue Ulens 88",
            "addressLocality": "Molenbeek-Saint-Jean",
            "postalCode": "1080",
            "addressCountry": "BE"
        },
        "sameAs": [
            "https://www.facebook.com/belmobile",
            "https://www.instagram.com/belmobile",
            "https://www.linkedin.com/company/belmobile"
        ],
        "contactPoint": [
            {
                "@type": "ContactPoint",
                "telephone": "+32-484-83-75-60",
                "contactType": "customer service",
                "areaServed": "BE",
                "availableLanguage": ["English", "French", "Dutch", "Turkish"]
            },
            {
                "@type": "ContactPoint",
                "telephone": "+32-2-306-76-56",
                "contactType": "sales",
                "areaServed": "BE",
                "availableLanguage": ["English", "French", "Dutch"]
            }
        ],
        "hasPart": [
            {
                "@type": "SiteNavigationElement",
                "name": t('Repair') || "Repair Service",
                "url": `https://belmobile.be/${language}/repair`
            },
            {
                "@type": "SiteNavigationElement",
                "name": t('Buyback') || "Sell Your Device",
                "url": `https://belmobile.be/${language}/buyback`
            },
            {
                "@type": "SiteNavigationElement",
                "name": "B2B / Corporate",
                "url": `https://belmobile.be/${language}/business`
            },
            {
                "@type": "SiteNavigationElement",
                "name": "Academy / Training",
                "url": `https://belmobile.be/${language}/training`
            }
        ]
    };

    // 1.5 WebSite Schema (Sitelinks Search Box)
    const websiteSchema = {
        "@type": "WebSite",
        "@id": "https://belmobile.be/#website",
        "name": "Belmobile.be",
        "url": "https://belmobile.be",
        "publisher": { "@id": "https://belmobile.be/#organization" },
        "potentialAction": {
            "@type": "SearchAction",
            "target": `https://belmobile.be/${language}/search?q={search_term_string}`,
            "query-input": "required name=search_term_string"
        }
    };



    // 1.1 B2B Professional Service (Authority Boost)
    const fleetManagementSchema = {
        "@context": "https://schema.org",
        "@type": "ProfessionalService",
        "name": language === 'fr' ? "Gestion de Flotte Mobile Bruxelles" : "Fleet Management Brussels",
        "image": "https://belmobile.be/images/bento/business_bg.png",
        "@id": "https://belmobile.be/#fleet-management",
        "url": `https://belmobile.be/${language}/business`,
        "telephone": "+32-2-306-76-56", // Molenbeek HQ
        "address": {
            "@type": "PostalAddress",
            "streetAddress": "Rue Ulens 88",
            "addressLocality": "Molenbeek-Saint-Jean",
            "postalCode": "1080",
            "addressCountry": "BE"
        },
        "description": language === 'fr'
            ? "Services professionnels de gestion de flotte mobile (Gérer flotte mobile), maintenance industrielle et rachat de parc informatique pour entreprises à Bruxelles."
            : "Professional mobile fleet management services, industrial maintenance, and IT asset recovery for companies in Brussels.",
        "provider": organizationSchema,
        "areaServed": "Belgium",
        "hasOfferCatalog": {
            "@type": "OfferCatalog",
            "name": "B2B Mobile Solutions",
            "itemListElement": [
                {
                    "@type": "Offer",
                    "itemOffered": {
                        "@type": "Service",
                        "name": "Fleet Maintenance",
                        "about": [
                            { "@type": "Thing", "@id": "https://www.wikidata.org/wiki/Q34687", "name": "Smartphone" },
                            { "@type": "Thing", "@id": "https://www.wikidata.org/wiki/Q12625946", "name": "Maintenance (technical)" }
                        ]
                    }
                },
                {
                    "@type": "Offer",
                    "itemOffered": {
                        "@type": "Service",
                        "name": "Mobile Buyback (B2B)",
                        "about": [
                            { "@type": "Thing", "@id": "https://www.wikidata.org/wiki/Q1080335", "name": "Circular economy" },
                            { "@type": "Thing", "@id": "https://www.wikidata.org/wiki/Q173317", "name": "Reverse logistics" }
                        ]
                    }
                }
            ]
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
            "priceRange": "€€",
            "aggregateRating": {
                "@type": "AggregateRating",
                "ratingValue": "4.8",
                "reviewCount": "1250",
                "bestRating": "5",
                "worstRating": "1"
            }
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
                "url": "https://belmobile.be/belmobile-logo.png"
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

    // 8. VideoObject Schema (Video SEO Strategy for 2026)
    // Helps appear in "Videos" tab and Google Discover
    const videoObjectSchema = type === 'organization' ? {
        "@context": "https://schema.org",
        "@type": "VideoObject",
        "name": "Belmobile - Expert Smartphone Repair in Brussels",
        "description": "See inside our certified repair labs in Schaerbeek. 30-minute iPhone and Samsung repairs.",
        "thumbnailUrl": [
            "https://belmobile.be/og-image.jpg"
        ],
        "uploadDate": "2024-01-01T08:00:00+08:00",
        "duration": "PT1M33S",
        "contentUrl": "https://belmobile.be/videos/Belmobile_corporate_video_2026.mp4",
        "embedUrl": "https://www.youtube.com/embed/placeholder",
        "interactionStatistic": {
            "@type": "InteractionCounter",
            "interactionType": { "@type": "WatchAction" },
            "userInteractionCount": 5600
        },
        "contentLocation": {
            "@type": "Place",
            "name": "Belmobile Liedts",
            "address": {
                "@type": "PostalAddress",
                "streetAddress": "Rue Gallait 4",
                "addressLocality": "Schaerbeek",
                "postalCode": "1030",
                "addressCountry": "BE"
            }
        },
        "locationCreated": {
            "@type": "Place",
            "name": "Belmobile Lab",
            "address": {
                "@type": "PostalAddress",
                "streetAddress": "Rue Gallait 4",
                "addressLocality": "Schaerbeek",
                "postalCode": "1030",
                "addressCountry": "BE"
            }
        }
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
                <script
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{
                        __html: JSON.stringify({
                            "@context": "https://schema.org",
                            "@graph": [
                                organizationSchema,
                                websiteSchema,
                                fleetManagementSchema,
                                ...localBusinessSchema,
                                ...(videoObjectSchema ? [videoObjectSchema] : [])
                            ]
                        })
                    }}
                />
            )}

            {type === 'contact' && contactPageSchema && (
                <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(contactPageSchema) }} />
            )}
        </>
    );
};

export default SchemaMarkup;
