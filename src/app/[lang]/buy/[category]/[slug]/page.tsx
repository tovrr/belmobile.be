import React, { cache } from 'react';
import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import ProductDetail from '../../../../../components/ProductDetail';
import { db } from '../../../../../firebase';
import { collection, getDocs } from 'firebase/firestore';
import { Product } from '../../../../../types';

interface PageProps {
    params: Promise<{
        lang: string;
        category: string;
        slug: string;
    }>;
}

// Cached helper to fetch all products from Firestore
const getAllProducts = cache(async (): Promise<Product[]> => {
    try {
        const snapshot = await getDocs(collection(db, 'products'));
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as unknown as Product));
    } catch (error) {
        console.error("Error fetching products for SSG:", error);
        return [];
    }
});

async function getProduct(slug: string): Promise<Product | undefined> {
    const products = await getAllProducts();
    return products.find(p => p.slug === slug);
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
    const { slug, lang } = await params;
    const product = await getProduct(slug);

    if (!product) {
        return {
            title: 'Product Not Found | Belmobile',
        };
    }

    return {
        title: `${product.brand ? product.brand + ' ' : ''}${product.name} | Belmobile`,
        description: `Buy ${product.brand} ${product.name} at Belmobile. Certified refurbished with 1 year warranty.`,
        openGraph: {
            images: [product.imageUrl],
        },
    };
}

export async function generateStaticParams() {
    const products = await getAllProducts();
    const languages = ['en', 'fr', 'nl'];
    const params: { lang: string; category: string; slug: string }[] = [];

    products.forEach(product => {
        if (product.slug && product.category) {
            languages.forEach(lang => {
                params.push({
                    lang,
                    category: product.category || 'uncategorized',
                    slug: product.slug
                });
            });
        }
    });

    return params;
}

export default async function ProductDetailPage({ params }: PageProps) {
    const { slug } = await params;
    const product = await getProduct(slug);

    if (!product) {
        return notFound();
    }

    // Pass the server-fetched product as initialData to the CLIENT component
    return <ProductDetail initialProduct={product} />;
}
