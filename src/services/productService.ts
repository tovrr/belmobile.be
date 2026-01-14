import { unstable_cache } from 'next/cache';
import { cache } from 'react';
import { adminDb } from '../lib/firebase-admin';
import { Product } from '../types';
import { logger } from '../utils/logger';

/**
 * FETCHES ALL PRODUCTS FOR CATALOGUE AND ISR
 * Uses adminDb for server-side performance and unstable_cache for speed.
 */
export const getProducts = cache(async (): Promise<Product[]> => {
    return unstable_cache(
        async () => {
            logger.debug('[ProductService] Cache Miss: getProducts');
            try {
                if (!adminDb) {
                    logger.warn('[ProductService] No adminDb available, returning empty');
                    return [];
                }
                const snapshot = await adminDb.collection('products').get();
                return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Product));
            } catch (error) {
                logger.error("[ProductService] Error fetching products", { action: 'getProducts' }, error);
                return [];
            }
        },
        ['all-products'],
        { revalidate: 3600, tags: ['products'] }
    )();
});
