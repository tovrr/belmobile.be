import 'server-only';
import { cache } from 'react';
import { adminDb } from '../../lib/firebase-admin';
import { calculateBuybackPriceShared, calculateRepairPriceShared, PricingParams } from '../../utils/pricingLogic';

// --- Types ---

export interface LocalizedSeoData {
    repair: {
        title: string;
        description: string;
    };
    buyback: {
        title: string;
        description: string;
    };
    slug: string;
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
        // Added Timeout to prevent hanging if connection fails
        const safeGet = async (ref: any) => {
            const timeoutPromise = new Promise((_, reject) =>
                setTimeout(() => reject(new Error('Timeout')), 3000)
            );
            try {
                return await Promise.race([ref.get(), timeoutPromise]) as any;
            }
            catch (e) {
                console.warn(`[PricingDAL] Firestore Timeout/Error for ${ref.path}. Falling back to local/mocks.`);
                return { exists: false, empty: true, docs: [], data: () => ({}) };
            }
        };

        const [marketSnap, repairQuerySnap, buybackSnap] = await Promise.all([
            safeGet(db.collection('market_values').doc(deviceId)),
            safeGet(db.collection('repair_prices').where('deviceId', '==', deviceId)),
            safeGet(db.collection('buyback_pricing').where('deviceId', '==', deviceId))
        ]);

        // 2. Logic: Process Data
        const marketData = marketSnap.exists ? marketSnap.data() : null;

        // Aggregate Repair Data from multiple documents
        const repairData: any = {};
        if (!repairQuerySnap.empty) {
            repairQuerySnap.docs.forEach((doc: any) => {
                const d = doc.data();
                const { issueId, variants, price } = d;

                // console.log(`[PricingDAL] Aggregating repair: ${issueId} - ${JSON.stringify(variants)} - €${price}`);

                if (issueId === 'screen' && variants?.quality) {
                    let q = variants.quality.toLowerCase();
                    // Sync with useFirestore.ts logic
                    if (q.includes('generic') || q.includes('lcd')) q = 'generic';
                    if (q.includes('soft') || q.includes('oled')) q = 'oled';
                    if (q.includes('refurb') || q.includes('original') || q.includes('service') || q.includes('pack')) q = 'original';
                    repairData[`screen_${q}`] = price;
                } else if (issueId === 'screen' && variants?.position) {
                    repairData[`screen_${variants.position.toLowerCase()}`] = price;
                } else {
                    repairData[issueId] = price;
                    // Synonym mappings for UI compatibility (REPAIR_ISSUES constants)
                    if (issueId === 'charging_port' || issueId === 'connector') repairData['charging'] = price;
                    if (issueId === 'rear_camera' || issueId === 'camera') repairData['camera_rear'] = price;
                    if (issueId === 'glass_back') repairData['back_glass'] = price;
                }
                if (d.imageUrl) repairData.imageUrl = d.imageUrl;
            });
        }

        // console.log(`[PricingDAL] getPriceQuote for ${deviceId}: Found ${Object.keys(repairData).length} mapped repair issues.`);


        // --- FALLBACK TO MOCKS IF DATABASE IS EMPTY ---
        if (Object.keys(repairData).length === 0 && buybackSnap.empty) {
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
            // FILTER: Exclude "new" condition from SEO price to be more realistic (User Request)
            const validDocs = buybackSnap.docs.filter((d: any) => d.data().condition !== 'new');
            const targetDocs = validDocs.length > 0 ? validDocs : buybackSnap.docs; // Fallback if only 'new' exists

            const prices = targetDocs.map((d: any) => d.data().price as number);
            maxBuyback = Math.max(...prices);
        }

        // SOTA Logic: If maxBuyback is missing, calculate from market value
        if (marketData?.sellPrice) {
            // Target Buyback = (Market Sell Price * 0.8) - RepairBuffer(€50) - Margin(€50)
            // Simplified: ~70% of market value for a "Perfect" device
            const calculatedBuyback = Math.round(marketData.sellPrice * 0.7);

            // If we have no manual buyback price, we use the calculated one.
            if (maxBuyback === 0) {
                maxBuyback = calculatedBuyback;
            }
        }

        // Final Floor: Ensure we never return 0 if we have some data
        if (maxBuyback === 0 && marketData?.sellPrice) {
            maxBuyback = Math.round(marketData.sellPrice * 0.6);
        }

        // 3. Assemble Prices
        // Safely safely extracting repair prices
        const getRp = (key: string) => repairData?.[key] || repairData?.[`${key}_generic`] || 0;

        // 4. Generate SEO Data (Quad-Lingual)
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

        if (!db) {
            return {
                buyback: [{ condition: 'perfect', price: 450 }, { condition: 'broken', price: 100 }],
                repair: { screen_generic: 99, screen_oled: 159, battery: 79 },
                metadata: { brand: 'Apple', category: 'smartphone' }
            };
        }

        const safeGet = async (ref: any) => {
            try { return await ref.get(); }
            catch (e) {
                console.warn(`[PricingDAL] Collection/Doc missing or restricted: ${ref.path}`);
                return { exists: false, empty: true, docs: [], data: () => ({}) };
            }
        };

        const [marketSnap, repairQuerySnap, buybackSnap] = await Promise.all([
            safeGet(db.collection('market_values').doc(deviceId)),
            safeGet(db.collection('repair_prices').where('deviceId', '==', deviceId)),
            safeGet(db.collection('buyback_pricing').where('deviceId', '==', deviceId))
        ]);

        console.log(`[PricingDAL] Fetching for ${deviceId}. Found ${repairQuerySnap.docs.length} repairs.`);

        const repairPrices: Record<string, number> = {};
        let repairImageUrl = null;

        if (!repairQuerySnap.empty) {
            repairQuerySnap.docs.forEach((doc: any) => {
                const d = doc.data();
                const { issueId, variants, price } = d;

                // console.log(`[PricingDAL] getPricingData repair: ${issueId} - €${price}`);

                if (issueId === 'screen' && variants?.quality) {
                    let q = variants.quality.toLowerCase();
                    if (q.includes('generic') || q.includes('lcd')) q = 'generic';
                    if (q.includes('soft') || q.includes('oled')) q = 'oled';
                    if (q.includes('refurb') || q.includes('original') || q.includes('service') || q.includes('pack')) q = 'original';
                    repairPrices[`screen_${q}`] = price;
                } else if (issueId === 'screen' && variants?.position) {
                    repairPrices[`screen_${variants.position.toLowerCase()}`] = price;
                } else {
                    repairPrices[issueId] = price;
                    // Synonym mappings for UI compatibility (REPAIR_ISSUES constants)
                    if (issueId === 'charging_port' || issueId === 'connector') repairPrices['charging'] = price;
                    if (issueId === 'rear_camera' || issueId === 'camera') repairPrices['camera_rear'] = price;
                    if (issueId === 'glass_back') repairPrices['back_glass'] = price;
                }
                if (d.imageUrl) repairImageUrl = d.imageUrl;
            });
        }

        const buybackPrices: { storage: string; price: number; condition?: string; capacity?: string }[] = [];
        let maxBuyback = 0;
        if (!buybackSnap.empty) {
            buybackSnap.docs.forEach((doc: any) => {
                const d = doc.data();
                const p = d.price || 0;
                buybackPrices.push({
                    storage: d.storage || d.capacity || '128GB',
                    capacity: d.capacity, // Pass original capacity if needed
                    condition: d.condition, // CRITICAL: Pass 'new', 'good', etc.
                    price: p
                });
                if (p > maxBuyback) maxBuyback = d.price;
            });
        }

        let brand = 'Apple';
        let category = 'smartphone';
        if (deviceId.includes('ipad')) category = 'tablet';
        if (deviceId.includes('watch')) category = 'smartwatch';

        return {
            buyback: buybackPrices.length > 0 ? buybackPrices : [
                { storage: '128GB', price: Math.round(maxBuyback) },
                { storage: 'perfect', price: Math.round(maxBuyback) } // Compatibility fallback
            ],
            repair: repairPrices,
            metadata: { brand, category, imageUrl: repairImageUrl }
        };
    } catch (error) {
        console.error(`[PricingDAL] Error in getPricingData for ${deviceSlug}:`, error);
        return {
            buyback: [{ condition: 'perfect', price: 450 }, { condition: 'broken', price: 100 }],
            repair: { screen_generic: 99, screen_oled: 159, battery: 79 },
            metadata: { brand: 'Apple', category: 'smartphone' }
        };
    }
});

const PRIORITY_DEVICES = [
    'apple-iphone-13', 'apple-iphone-14', 'apple-iphone-15', 'apple-iphone-16',
    'samsung-galaxy-s22', 'samsung-galaxy-s23', 'samsung-galaxy-s24'
];

/**
 * FETCHES ALL DEVICES FOR SITEMAP GENERATION
 * Returns a list of standardized slugs (e.g. 'apple-iphone-13')
 * Optimized via listDocuments() to avoid document reads.
 */
export const getAllDevices = cache(async (): Promise<string[]> => {
    try {
        const db = adminDb;
        if (!db) return PRIORITY_DEVICES;

        // Optimized: listDocuments() stays on the control plane, no doc reads ($)
        // We use the repair_prices collection as the master catalog
        const refs = await db.collection('repair_prices').listDocuments();
        const ids = refs.map(ref => ref.id);

        return ids.length > 0 ? ids : PRIORITY_DEVICES;
    } catch (error) {
        console.error('[PricingDAL] Error fetching all devices:', error);
        return PRIORITY_DEVICES;
    }
});

// --- HELPER FUNCTIONS ---

function normalizeDeviceId(slug: string): string {
    let id = slug.toLowerCase().trim().replace(/\s+/g, '-');

    // Comprehensive list of localized service prefixes to strip
    const prefixes = [
        'reparation-', 'repair-', 'reparatie-', 'onarim-', 'tamir-',
        'rachat-', 'buyback-', 'inkoop-', 'geri-alim-'
    ];

    prefixes.forEach(p => {
        if (id.startsWith(p)) id = id.replace(p, '');
    });

    // Handle double prefixes (e.g. apple-apple-watch)
    if (id.startsWith('apple-apple-')) id = id.replace('apple-apple-', 'apple-');
    if (id.startsWith('samsung-samsung-')) id = id.replace('samsung-samsung-', 'samsung-');

    // Ensure Apple devices have prefix
    if (id.startsWith('iphone') && !id.startsWith('apple-')) {
        return `apple-${id}`;
    }
    return id;
}

function generateQuadLingualSeo(deviceId: string, repairData: any, buybackPrice: number): QuadLingualSeo {
    // Generate readable name from ID (e.g. apple-iphone-13 -> iPhone 13)
    const name = deviceId.split('-').slice(1).map(s => {
        if (s === 'iphone') return 'iPhone';
        if (s === 'ipad') return 'iPad';
        if (s === 'macbook') return 'MacBook';
        if (s === 'apple') return 'Apple';
        if (s === 'watch') return 'Watch';
        return s.charAt(0).toUpperCase() + s.slice(1);
    }).join(' ');

    // Repair Price Anchor (Lowest Screen Price)
    // Repair Price Anchor (Lowest Screen Price)
    // Filter for strictly positive values to avoid -1 or 0 showing in title
    const getPos = (v: any) => (typeof v === 'number' && v > 0) ? v : null;

    const startPrice =
        getPos(repairData?.screen_generic) ||
        getPos(repairData?.screen_original) ||
        getPos(repairData?.screen_oled) ||
        getPos(repairData?.screen) ||
        getPos(repairData?.battery) ||
        Object.values(repairData).find(v => typeof v === 'number' && v > 0) ||
        0;

    const floorBuyback = Math.round(buybackPrice * 0.4);

    return {
        fr: {
            repair: {
                title: `Réparation ${name} Bruxelles - Écran dès ${startPrice}€ | Belmobile`,
                description: `Réparez votre ${name} en 30 min à Bruxelles. Changement écran, batterie (${startPrice}€). Garantie 1 an. Ou revendez-le jusqu'à ${buybackPrice}€ cash.`
            },
            buyback: {
                title: `Rachat ${name} Bruxelles - Vendez au meilleur prix (${buybackPrice}€ Cash)`,
                description: `Estimation immédiate pour votre ${name} à Bruxelles. Nous rachetons votre appareil cash jusqu'à ${buybackPrice}€, même cassé.`
            },
            slug: `reparation-${deviceId}` // Base slug used for routing
        },
        nl: {
            repair: {
                title: `${name} Reparatie Brussel - Scherm vanaf ${startPrice}€ | Belmobile`,
                description: `${name} herstelling in 30 min. Scherm vervangen, batterij vervangen (${startPrice}€). 1 jaar garantie. Of verkoop het voor max ${buybackPrice}€ cash.`
            },
            buyback: {
                title: `${name} Verkopen Brussel - Hoogste prijs (${buybackPrice}€ Cash)`,
                description: `Directe schatting voor uw ${name} in Brussel. Wij kopen uw toestel contant tot ${buybackPrice}€, zelfs defect.`
            },
            slug: `reparatie-${deviceId}`
        },
        en: {
            repair: {
                title: `${name} Repair Brussels - Screen from ${startPrice}€ | Belmobile`,
                description: `Fix your ${name} in 30 mins in Brussels. Screen toggle, battery replacement (${startPrice}€). 1 Year Warranty. Or sell it for up to ${buybackPrice}€ cash.`
            },
            buyback: {
                title: `Sell ${name} Brussels - Best Price (${buybackPrice}€ Cash)`,
                description: `Instant quote for your ${name} in Brussels. We buy back your device for up to ${buybackPrice}€ cash, even broken.`
            },
            slug: `repair-${deviceId}`
        },
        tr: {
            repair: {
                title: `${name} Tamiri Brüksel - Ekran ${startPrice}€'dan başlayan fiyatlarla`,
                description: `Brüksel'de 30 dakikada ${name} tamiri. Ekran değişimi, batarya (${startPrice}€). 1 Yıl Garanti. Veya ${buybackPrice}€'ya kadar nakit satabilirsiniz.`
            },
            buyback: {
                title: `${name} Nakit Alım Brüksel - En İyi Fiyat (${buybackPrice}€ Nakit)`,
                description: `Brüksel'de ${name} cihazınız için dürüst fiyat. Cihazınızı ${buybackPrice}€'ya kadar nakit alıyoruz.`
            },
            slug: `tamir-${deviceId}`
        }
    };
}

/**
 * FETCHES LOCALIZED REPAIR ISSUES (SSoT)
 * Returns a dictionary of issues (key -> localized label)
 */
export const getLocalizedRepairDictionary = cache(async (lang: 'fr' | 'nl' | 'en' | 'tr'): Promise<Record<string, string>> => {
    try {
        const db = adminDb;
        const dict: Record<string, string> = {};

        // Fallback Dictionary (Hardcoded from constants/repair-issues.ts logic)
        // We use this if Firestore is empty or fails
        const fallback: Record<string, any> = {
            'screen': { fr: 'Remplacement d\'écran', nl: 'Schermvervanging', en: 'Screen Replacement', tr: 'Ekran Değişimi' },
            'battery': { fr: 'Remplacement batterie', nl: 'Batterijvervanging', en: 'Battery Replacement', tr: 'Batarya Değişimi' },
            'charging': { fr: 'Connecteur de charge', nl: 'Laadconnector', en: 'Charging Port', tr: 'Şarj Soketi' },
            'camera_rear': { fr: 'Caméra arrière', nl: 'Achtercamera', en: 'Rear Camera', tr: 'Arka Kamera' },
            'face_id': { fr: 'Réparation Face ID', nl: 'Face ID Reparatie', en: 'Face ID Repair', tr: 'Face ID Tamiri' },
            'back_glass': { fr: 'Vitre arrière', nl: 'Achterkant Glas', en: 'Back Glass', tr: 'Arka Cam' },
            'housing': { fr: 'Châssis complet', nl: 'Volledige Behuizing', en: 'Full Housing', tr: 'Kasa Değişimi' },
            'lock_button': { fr: 'Bouton Verrouillage', nl: 'Vergrendelknop', en: 'Lock Button', tr: 'Kilit Tuşu' },
            'volume_button': { fr: 'Boutons Volume', nl: 'Volumeknoppen', en: 'Volume Buttons', tr: 'Ses Tuşları' }
        };

        if (db) {
            const snap = await db.collection('repair_issues').get();
            if (!snap.empty) {
                snap.docs.forEach(doc => {
                    const data = doc.data();
                    const label = data.labels?.[lang] || data.label || fallback[doc.id]?.[lang] || doc.id;
                    dict[doc.id] = label;
                });
            }
        }

        // Merge with fallback for missing keys
        Object.keys(fallback).forEach(key => {
            if (!dict[key]) {
                dict[key] = fallback[key][lang] || fallback[key]['en'];
            }
        });

        return dict;
    } catch (error) {
        console.error('[PricingDAL] Error fetching localized issues:', error);
        return {};
    }
});

/**
 * UPDATES MARKET VALUE (Scraper Hook)
 * Validates existence before writing to avoid ghost data.
 */
export const updateMarketPrice = async (
    deviceId: string,
    price: number,
    source: string = 'scraper'
): Promise<{ success: boolean; message: string }> => {
    try {
        const db = adminDb;
        if (!db) return { success: false, message: "No DB Connection" };

        const normalizedId = normalizeDeviceId(deviceId);

        // 1. Validate Existance (Guard Clause)
        const devices = await getAllDevices();
        if (!devices.includes(normalizedId)) {
            // Optional: Check if it's a valid ID formatting issue
            // For strict mode, we reject unknown devices
            return { success: false, message: `Device ${normalizedId} not found in catalog.` };
        }

        // 2. Write to Firestore
        await db.collection('market_values').doc(normalizedId).set({
            id: normalizedId,
            sellPrice: price,
            currency: 'EUR',
            source,
            lastScraped: new Date().toISOString()
        }, { merge: true });

        console.log(`[PricingDAL] Updated Market Value for ${normalizedId}: €${price}`);
        return { success: true, message: "Updated" };

    } catch (error) {
        console.error(`[PricingDAL] Update failed for ${deviceId}:`, error);
        return { success: false, message: "Internal Error" };
    }
};
