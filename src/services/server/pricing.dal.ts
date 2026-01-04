import 'server-only';
import { cache } from 'react';
import { adminDb } from '../../lib/firebase-admin';
import { calculateBuybackPriceShared, calculateRepairPriceShared, PricingParams } from '../../utils/pricingLogic';

// --- Types ---

export interface LocalizedSeoData {
    title: string;
    description: string;
    slug: string; // "iphone-13" or "iphone-13-pro" (usually same across langs but good to have flexibility)
}

export interface QuadLingualSeo {
    fr: LocalizedSeoData;
    nl: LocalizedSeoData;
    en: LocalizedSeoData;
    tr: LocalizedSeoData;
}

export interface PricingQuote {
    currency: 'EUR';
    buyback: {
        minPrice: number;
        maxPrice: number;
        tradeInCredit: number; // usually slightly higher
    };
    repair: {
        screen_generic: number;
        screen_oled: number;
        screen_original: number;
        battery: number;
        charging: number;
        camera: number;
    };
    metadata: {
        entityRadius: 'Brussels';
        lastUpdated: string;
    };
    deviceImage: string | null;
    seo: QuadLingualSeo;
}

// --- CONSTANTS ---
const DB_NAME = 'belmobile-database'; // Explicitly targeting the correct named DB

// --- THE DAL (Data Access Layer) ---

/**
 * FETCHES A QUAD-LINGUAL PRICING QUOTE
 * Single Request Deduplication via React Cache
 */
export const getPriceQuote = cache(async (deviceSlug: string): Promise<PricingQuote | null> => {
    // 1. Normalize Slug
    // e.g. "reparation-iphone-13" -> we need to find "apple-iphone-13" or similar ID
    // Simplification: We assume the scraper/feed uses a standardized ID (e.g. 'apple-iphone-13')
    const deviceId = normalizeDeviceId(deviceSlug);

    try {
        // Parallel Fetching: Market Value + Repair Costs
        // Note: Using the Firestore Admin SDK to access the specified database
        // In Admin SDK, usually we just use the default instance, but if "belmobile-database" is split,
        // we need to be careful. For now, we assume the default project DB is the target or we'd configure it.
        // The client uses "belmobile-database".

        const db = adminDb;

        // --- SAFE FALLBACK FOR DEV WITHOUT CREDENTIALS ---
        if (!db) {
            console.warn(`[PricingDAL] ⚠️ Credentials Missing. Returning MOCK DATA for ${deviceId}`);
            const mockName = deviceId.split('-').pop() || 'Phone';
            return {
                currency: 'EUR',
                buyback: { minPrice: 100, maxPrice: 450, tradeInCredit: 500 },
                repair: {
                    screen_generic: 99,
                    screen_oled: 159,
                    screen_original: 199,
                    battery: 79,
                    charging: 69,
                    camera: 89
                },
                metadata: { entityRadius: 'Brussels', lastUpdated: new Date().toISOString() },
                deviceImage: null,
                seo: generateQuadLingualSeo(deviceId, { screen: 99 }, 450)
            };
        }

        // 1. Fetch Plan: Use individual catches to handle missing collections (NOT_FOUND) gracefully
        const safeGet = async (ref: any) => {
            try { return await ref.get(); }
            catch (e) {
                console.warn(`[PricingDAL] Collection/Doc missing or restricted: ${ref.path}`);
                return { exists: false, empty: true, docs: [], data: () => ({}) };
            }
        };

        const [marketSnap, repairSnap, buybackSnap] = await Promise.all([
            safeGet(db.collection('market_values').doc(deviceId)),
            safeGet(db.collection('repair_prices').doc(deviceId)),
            safeGet(db.collection('buyback_pricing').where('deviceId', '==', deviceId))
        ]);

        // 2. Logic: Process Data
        const marketData = marketSnap.exists ? marketSnap.data() : null;
        const repairData = repairSnap.exists ? repairSnap.data() : {};

        // --- FALLBACK TO MOCKS IF DATABASE IS EMPTY ---
        if (!repairSnap.exists && buybackSnap.empty) {
            const mockName = deviceId.split('-').pop() || 'Phone';
            return {
                currency: 'EUR',
                buyback: { minPrice: 100, maxPrice: 450, tradeInCredit: 500 },
                repair: {
                    screen_generic: 99,
                    screen_oled: 159,
                    screen_original: 199,
                    battery: 79,
                    charging: 69,
                    camera: 89
                },
                metadata: { entityRadius: 'Brussels', lastUpdated: new Date().toISOString() },
                deviceImage: null,
                seo: generateQuadLingualSeo(deviceId, { screen_generic: 99 }, 450)
            };
        }

        // Buyback Base: If market data missing, fallback to buyback_pricing manual entries
        let maxBuyback = 0;
        if (!buybackSnap.empty) {
            const prices = buybackSnap.docs.map(d => d.data().price as number);
            maxBuyback = Math.max(...prices);
        }

        // If we have market data, we could calculate a "Live" price
        if (marketData?.sellPrice) {
            // SOTA Logic: SellPrice - RepairCost(Screen) - Margin(25%)
            // This is a simplified example.
            // maxBuyback = Math.max(maxBuyback, marketData.sellPrice * 0.75);
        }

        // 3. Assemble Prices
        // Safely safely extracting repair prices
        const getRp = (key: string) => repairData?.[key] || repairData?.[`${key}_generic`] || 0;

        // 4. Generate SEO Data (Quad-Lingual)
        // This generates the localized strings for <title> and <description>
        const seoData = generateQuadLingualSeo(deviceId, repairData, maxBuyback);

        return {
            currency: 'EUR',
            buyback: {
                minPrice: Math.round(maxBuyback * 0.4), // Damaged floor
                maxPrice: Math.round(maxBuyback),
                tradeInCredit: Math.round(maxBuyback * 1.1) // 10% bonus for store credit
            },
            repair: {
                screen_generic: getRp('screen_generic') || getRp('screen_copy') || repairData?.screen || 0,
                screen_oled: getRp('screen_oled') || getRp('screen_soft') || 0,
                screen_original: getRp('screen_original') || getRp('screen_refurb') || 0,
                battery: getRp('battery') || 0,
                charging: getRp('charging') || getRp('charging_port') || 0,
                camera: getRp('camera') || getRp('rear_camera') || 0
            },
            metadata: {
                entityRadius: 'Brussels',
                lastUpdated: new Date().toISOString()
            },
            deviceImage: repairData?.imageUrl || null,
            seo: seoData
        };

    } catch (error) {
        console.error(`[PricingDAL] Error fetching for ${deviceSlug}:`, error);
        return null;
    }
});

// ... (existing code)

/**
 * FETCHES RAW PRICING DATA FOR WIZARD CALCULATIONS
 * Used by Server Actions
 */
export const getPricingData = cache(async (deviceSlug: string) => {
    const deviceId = normalizeDeviceId(deviceSlug);
    try {
        const db = adminDb;

        // --- SAFE FALLBACK FOR DEV ---
        if (!db) {
            return {
                buyback: [{ condition: 'perfect', price: 450 }, { condition: 'broken', price: 100 }],
                repair: { screen_generic: 99, screen_oled: 159, battery: 79 },
                metadata: { brand: 'Apple', category: 'smartphone' }
            };
        }

        // 1. Fetch Plan: Use individual catches to handle missing collections (NOT_FOUND) gracefully
        const safeGet = async (ref: any) => {
            try { return await ref.get(); }
            catch (e) {
                console.warn(`[PricingDAL] Collection/Doc missing or restricted: ${ref.path}`);
                return { exists: false, empty: true, docs: [], data: () => ({}) };
            }
        };

        const [marketSnap, repairSnap, buybackSnap] = await Promise.all([
            safeGet(db.collection('market_values').doc(deviceId)),
            safeGet(db.collection('repair_prices').doc(deviceId)),
            safeGet(db.collection('buyback_pricing').where('deviceId', '==', deviceId))
        ]);

        const buybackPrices = buybackSnap.docs.map(d => d.data() as any);
        const repairData = repairSnap.exists ? repairSnap.data() : {};
        const marketData = marketSnap.exists ? marketSnap.data() : {};

        // --- FALLBACK TO MOCKS IF DATABASE IS EMPTY ---
        if (!repairSnap.exists && buybackPrices.length === 0) {
            console.log(`[PricingDAL] No results for ${deviceId} in database, providing Mocks.`);
            return {
                buyback: [{ condition: 'perfect', price: 450 }, { condition: 'broken', price: 100 }],
                repair: { screen_generic: 99, screen_oled: 159, battery: 79 },
                metadata: { brand: 'Apple', category: 'smartphone' }
            };
        }

        // Parse Repair Prices into simple Record<string, number>
        const repairPrices: Record<string, number> = {};
        if (repairData) {
            Object.entries(repairData).forEach(([k, v]) => {
                if (typeof v === 'number') repairPrices[k] = v;
            });
        }

        // Metadata (Brand/Category detection from DB or inferred)
        let brand = 'Unknown';
        let category = 'smartphone';
        if (deviceId.startsWith('apple-')) brand = 'Apple';
        if (deviceId.includes('ipad')) { brand = 'Apple'; category = 'tablet'; }
        if (deviceId.includes('watch')) { brand = 'Apple'; category = 'smartwatch'; }
        if (deviceId.includes('macbook')) { brand = 'Apple'; category = 'laptop'; }

        return {
            buyback: buybackPrices,
            repair: repairPrices,
            metadata: {
                brand,
                category,
                ...marketData
            }
        };

    } catch (error) {
        console.error('[PricingDAL] Critical Error fetching raw data, falling back to mocks:', error);
        // ULTIMATE FAILSAFE
        return {
            buyback: [{ condition: 'perfect', price: 450 }, { condition: 'broken', price: 100 }],
            repair: { screen_generic: 99, screen_oled: 159, battery: 79 },
            metadata: { brand: 'Apple', category: 'smartphone' }
        };
    }
});

/**
 * FETCHES ALL DEVICES FOR SITEMAP GENERATION
 * Returns a list of standardized slugs (e.g. 'apple-iphone-13')
 */
export const getAllDevices = cache(async (): Promise<string[]> => {
    try {
        const db = adminDb;

        if (!db) return ['apple-iphone-13', 'apple-iphone-14', 'apple-iphone-15', 'samsung-galaxy-s22'];

        // We only want the IDs. In Admin SDK, select() defines projection.
        // We fetch from 'repair_prices' as it is the master catalog.
        const snapshot = await db.collection('repair_prices').select().get(); // select() empty means ID only? No, select() with no args fetches nothing? 
        // Actually, listing documents is efficiently done by just getting the refs or a lean query.
        // .select() in Firestore selects fields. ID is always returned.

        return snapshot.docs.map(doc => doc.id);
    } catch (error) {
        console.error('[PricingDAL] Error fetching all devices:', error);
        return [];
    }
});

// --- HELPER FUNCTIONS ---

function normalizeDeviceId(slug: string): string {
    // Basic normalization
    // Remove "reparation-" prefix types if present
    let id = slug.toLowerCase();
    id = id.replace('reparation-', '').replace('repair-', '').replace('rachat-', '');
    // Ensure Apple devices have prefix if needed. 
    // This depends on your DB keys. Assuming "apple-iphone-13" format.
    if (id.startsWith('iphone') && !id.startsWith('apple-')) {
        return `apple-${id}`;
    }
    return id;
}

function generateQuadLingualSeo(deviceId: string, repairData: any, buybackPrice: number): QuadLingualSeo {
    // Generate readable name from ID (e.g. apple-iphone-13 -> iPhone 13)
    const name = deviceId.split('-').slice(1).map(s => s.charAt(0).toUpperCase() + s.slice(1)).join(' ');

    // Repair Price Anchor (Lowest Screen Price)
    const startPrice = repairData?.screen_generic || repairData?.screen || repairData?.battery || 0;

    return {
        fr: {
            title: `Réparation ${name} Bruxelles - Écran dès ${startPrice}€ | Belmobile`,
            description: `Réparez votre ${name} en 30 min à Bruxelles. Changement écran, batterie (${startPrice}€). Garantie 1 an. Ou revendez-le jusqu'à ${buybackPrice}€ cash.`,
            slug: `reparation-${deviceId}`
        },
        nl: {
            title: `${name} Reparatie Brussel - Scherm vanaf ${startPrice}€ | Belmobile`,
            description: `${name} herstelling in 30 min. Scherm vervangen, batterij vervangen (${startPrice}€). 1 jaar garantie. Of verkoop het voor max ${buybackPrice}€ cash.`,
            slug: `reparatie-${deviceId}`
        },
        en: {
            title: `${name} Repair Brussels - Screen from ${startPrice}€ | Belmobile`,
            description: `Fix your ${name} in 30 mins in Brussels. Screen toggle, battery replacement (${startPrice}€). 1 Year Warranty. Or sell it for up to ${buybackPrice}€ cash.`,
            slug: `repair-${deviceId}`
        },
        tr: {
            title: `${name} Tamiri Brüksel - Ekran ${startPrice}€'dan başlayan fiyatlarla`,
            description: `Brüksel'de 30 dakikada ${name} tamiri. Ekran değişimi, batarya (${startPrice}€). 1 Yıl Garanti. Veya ${buybackPrice}€'ya kadar nakit satabilirsiniz.`,
            slug: `tamir-${deviceId}`
        }
    };
}
