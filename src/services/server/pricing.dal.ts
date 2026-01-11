import 'server-only';
import { cache } from 'react';
import { adminDb } from '../../lib/firebase-admin';
import { calculateBuybackPriceShared, calculateRepairPriceShared, PricingParams } from '../../utils/pricingLogic';
import { MASTER_DEVICE_LIST } from '../../data/master-device-list';

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
const db = adminDb;

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
        // Fetching: Market Value + Repair Costs

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

        // Consolidate Repair Data
        const repairData: any = { imageUrl: null };
        if (!repairQuerySnap.empty) {
            repairQuerySnap.docs.forEach((doc: any) => {
                const d = doc.data();
                const { issueId, variants, price } = d;

                if (issueId === 'screen' && variants?.quality) {
                    let q = variants.quality.toLowerCase();
                    if (q.includes('generic') || q.includes('lcd')) q = 'generic';
                    if (q.includes('soft') || q.includes('oled')) q = 'oled';
                    if (q.includes('refurb') || q.includes('original')) q = 'original';
                    repairData[`screen_${q}`] = price;
                } else {
                    repairData[issueId] = price;
                    // Synonyms for UI compatibility
                    if (issueId === 'charging_port' || issueId === 'connector') repairData['charging'] = price;
                    if (issueId === 'rear_camera' || issueId === 'camera') repairData['camera'] = price;
                    if (issueId === 'glass_back') repairData['back_glass'] = price;
                }
                if (d.imageUrl) repairData.imageUrl = d.imageUrl;
            });
        }

        // --- NEW SSOT PRICING LOGIC ---
        // We strictly prioritize Manual Data. If no manual data, it's "On Request".
        const anchorSnap = await safeGet(db.collection('pricing_anchors').doc(deviceId));
        const isManuallyActivated = anchorSnap.exists && anchorSnap.data()?.managedManually === true;

        let maxBuyback = 0;
        let isVerified = false;

        if (isManuallyActivated && !buybackSnap.empty) {
            const validDocs = buybackSnap.docs.filter((d: any) => d.data().condition !== 'new');
            const targetDocs = validDocs.length > 0 ? validDocs : buybackSnap.docs;
            const prices = targetDocs.map((d: any) => d.data().price as number);
            maxBuyback = Math.max(...prices);
            isVerified = true;
        }

        // If not verified, we return a "Quote Required" structure (Price 0 triggers UI "On Request")
        if (!isVerified) {
            maxBuyback = 0;
        }

        const getRp = (key: string) => repairData?.[key] || 0;
        const seoData = generateQuadLingualSeo(deviceId, repairData, maxBuyback);

        return {
            currency: 'EUR',
            buyback: {
                minPrice: Math.round(maxBuyback * 0.4),
                maxPrice: maxBuyback,
                tradeInCredit: Math.round(maxBuyback * 1.1)
            },
            repair: {
                screen_generic: getRp('screen_generic') || 0,
                screen_oled: getRp('screen_oled') || 0,
                screen_original: getRp('screen_original') || 0,
                battery: getRp('battery') || 0,
                charging: getRp('charging') || 0,
                camera: getRp('camera') || 0
            },
            metadata: {
                entityRadius: 'Brussels',
                lastUpdated: new Date().toISOString(),
                isVerified // Pass to UI if needed
            } as any,
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
        if (deviceId.includes('macbook')) category = 'laptop';
        if (deviceId.includes('ps5') || deviceId.includes('xbox')) category = 'console_home';
        if (deviceId.includes('switch') || deviceId.includes('steam-deck')) category = 'console_portable';


        // Sync Anchor State
        const anchorSnap = await safeGet(db.collection('pricing_anchors').doc(deviceId));
        const isManuallyActivated = anchorSnap.exists && anchorSnap.data()?.managedManually === true;

        return {
            buyback: isManuallyActivated ? buybackPrices : [],
            repair: repairPrices,
            metadata: {
                brand,
                category,
                imageUrl: repairImageUrl,
                isVerified: isManuallyActivated && buybackPrices.length > 0
            }
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
 * Returns a list of all known device IDs from various sources.
 */
export const getAllDevices = cache(async (): Promise<string[]> => {
    // 1. Static Master List (Priority & Instant)
    const staticIds = new Set(MASTER_DEVICE_LIST.map(d => d.id));

    // 2. Dynamic DB Fetch (Coverage)
    // We fetch ALL documents from pricing_anchors to ensure every trainable device is indexed
    if (adminDb) {
        try {
            // Select only document ID to minimize bandwidth/latency
            const snapshot = await adminDb.collection('pricing_anchors').select().get();
            snapshot.docs.forEach(doc => staticIds.add(doc.id));
        } catch (error) {
            console.warn("[PricingDAL] Failed to fetch dynamic device list via pricing_anchors:", error);
        }
    }

    return Array.from(staticIds);
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

    const getPos = (v: any) => (typeof v === 'number' && v > 0) ? v : null;
    const foundPrice = Object.values(repairData).find(v => typeof v === 'number' && v > 0);

    const startPrice = Number(
        getPos(repairData?.screen_generic) ||
        getPos(repairData?.screen_original) ||
        getPos(repairData?.screen_oled) ||
        getPos(repairData?.screen) ||
        getPos(repairData?.battery) ||
        (typeof foundPrice === 'number' ? foundPrice : 0)
    ) as number;

    return {
        fr: {
            repair: {
                title: `Réparation ${name} Bruxelles - ${startPrice > 0 ? 'Écran dès ' + startPrice + '€' : 'Prix sur demande'} | Belmobile`,
                description: `Réparez votre ${name} en 30 min à Bruxelles. Écran, batterie (${startPrice > 0 ? startPrice + '€' : 'sur demande'}). Garantie 1 an. ${buybackPrice > 0 ? 'Ou revendez-le jusqu\'à ' + buybackPrice + '€ cash.' : ''}`
            },
            buyback: {
                title: buybackPrice > 0 ? `Rachat ${name} Bruxelles - Vendez au meilleur prix (${buybackPrice}€ Cash)` : `Rachat ${name} Bruxelles - Prix sur demande`,
                description: buybackPrice > 0
                    ? `Estimation immédiate pour votre ${name} à Bruxelles. Nous rachetons votre appareil cash jusqu'à ${buybackPrice}€, même cassé.`
                    : `Propriétaire d'un ${name} ? Revendez-le au meilleur prix chez Belmobile Bruxelles. Estimation professionnelle sur demande.`
            },
            slug: `reparation-${deviceId}`
        },
        nl: {
            repair: {
                title: `${name} Reparatie Brussel - ${startPrice > 0 ? 'Scherm vanaf ' + startPrice + '€' : 'Prijs op aanvraag'} | Belmobile`,
                description: `${name} herstelling in 30 min. Scherm vervangen, batterij vervangen (${startPrice > 0 ? startPrice + '€' : 'prijs op aanvraag'}). 1 jaar garantie. ${buybackPrice > 0 ? 'Of verkoop het voor max ' + buybackPrice + '€ cash.' : ''}`
            },
            buyback: {
                title: buybackPrice > 0 ? `${name} Verkopen Brussel - Hoogste prijs (${buybackPrice}€ Cash)` : `${name} Verkopen Brussel - Prijs op aanvraag`,
                description: buybackPrice > 0
                    ? `Directe schatting voor uw ${name} in Brussel. Wij kopen uw toestel contant tot ${buybackPrice}€, zelfs defect.`
                    : `Bent u eigenaar van een ${name}? Verkoop het tegen de beste prijs aan Belmobile Brussel. Directe schatting op aanvraag.`
            },
            slug: `reparatie-${deviceId}`
        },
        en: {
            repair: {
                title: `${name} Repair Brussels - ${startPrice > 0 ? 'Screen from ' + startPrice + '€' : 'Quote on request'} | Belmobile`,
                description: `Fix your ${name} in 30 mins in Brussels. Screen, battery (${startPrice > 0 ? startPrice + '€' : 'quote on request'}). 1 Year Warranty. ${buybackPrice > 0 ? 'Or sell it for up to ' + buybackPrice + '€ cash.' : ''}`
            },
            buyback: {
                title: buybackPrice > 0 ? `Sell ${name} Brussels - Best Price (${buybackPrice}€ Cash)` : `Sell ${name} Brussels - Quote on Request`,
                description: buybackPrice > 0
                    ? `Instant quote for your ${name} in Brussels. We buy back your device for up to ${buybackPrice}€ cash, even broken.`
                    : `Own a ${name}? Sell it to Belmobile Brussels for the best market price. Professional quote on request.`
            },
            slug: `repair-${deviceId}`
        },
        tr: {
            repair: {
                title: `${name} Tamiri Brüksel - ${startPrice > 0 ? 'Ekran ' + startPrice + "€'dan başlayan fiyatlarla" : 'Fiyat sorunuz'}`,
                description: `Brüksel'de 30 dakikada ${name} tamiri. Ekran değişimi, batarya (${startPrice > 0 ? startPrice + '€' : 'fiyat sorunuz'}). 1 Yıl Garanti. ${buybackPrice > 0 ? 'Veya ' + buybackPrice + "€'ya kadar nakit satabilirsiniz." : ''}`
            },
            buyback: {
                title: buybackPrice > 0 ? `${name} Nakit Alım Brüksel - En İyi Fiyat (${buybackPrice}€ Nakit)` : `${name} Nakit Alım Brüksel - Teklif İsteyin`,
                description: buybackPrice > 0
                    ? `Brüksel'de ${name} cihazınız için dürüst fiyat. Cihazınızı ${buybackPrice}€'ya kadar nakit alıyoruz.`
                    : `${name} cihazınızı nakit satmak mı istiyorsunuz? Belmobile Brüksel'den hemen teklif isteyin.`
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
