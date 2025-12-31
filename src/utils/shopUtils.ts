import { Shop } from '../types';
import { db } from '../firebase';
import { collection, getDocs } from 'firebase/firestore';
import { LOCATIONS } from '../data/locations';
import { SHOPS } from '../constants';
import { ShopSchema } from '../types/schemas';

/**
 * Fetch shops from Firestore and merge with static LOCATIONS
 */
export const fetchMergedShops = async (): Promise<Shop[]> => {
    let shops: Shop[] = [];
    try {
        const snapshot = await getDocs(collection(db, 'shops'));
        shops = snapshot.docs.map(doc => {
            const data = { id: doc.id, ...doc.data() };
            const parsed = ShopSchema.safeParse(data);
            if (!parsed.success) {
                console.warn(`Invalid shop data in DB for ${doc.id}:`, parsed.error.format());
                return null;
            }
            const shopData = parsed.data;
            const verifiedShop = SHOPS.find(s => s.id === shopData.id);
            const staticInfo = LOCATIONS.find(l => l.id === shopData.id);

            const merged: Shop = {
                ...shopData,
                // Ensure critical fields from models.ts are satisfied
                openingHours: shopData.openingHours || (Array.isArray(shopData.hours) ? shopData.hours : []),
                id: String(shopData.id),
                slugs: (shopData.slugs as any) || staticInfo?.slugs || {},
                zip: shopData.zip || staticInfo?.zip || '',
                city: shopData.city || staticInfo?.city || '',
                // Merge critical flags from constants
                isPrimary: shopData.isPrimary ?? verifiedShop?.isPrimary ?? false,
                // Override coordinates/address for specific shops
                ...(verifiedShop && (shopData.id === 'schaerbeek' || shopData.id === 'anderlecht' || shopData.id === 'molenbeek') ? {
                    coords: verifiedShop.coords,
                    address: verifiedShop.address,
                    name: verifiedShop.name
                } : {})
            };
            return merged;
        }).filter((s): s is Shop => s !== null);
    } catch (error) {
        console.error("Error fetching shops:", error);
    }

    const staticShops = LOCATIONS.map(l => {
        // We trust static LOCATIONS but ensure they match the Shop interface
        return {
            ...l,
            openingHours: l.openingHours || [],
            id: String(l.id),
            // Ensure status is present
            status: l.status || 'open',
            slugs: l.slugs
        } as unknown as Shop;
    });

    const combined = [...shops];
    staticShops.forEach(s => {
        const existing = combined.find(c => c.id === s.id);
        if (!existing) {
            combined.push(s);
        } else if (!existing.status) {
            existing.status = 'open';
        }
    });

    return combined;
};

/**
 * Helper to check if shop is open based on Brussels Time
 */
export const isShopOpen = (hoursInput: string | string[] | undefined): boolean => {
    if (!hoursInput) return false;

    let hoursString = '';
    if (Array.isArray(hoursInput)) {
        hoursString = hoursInput.join('\n');
    } else if (typeof hoursInput === 'string') {
        hoursString = hoursInput;
    } else {
        return false;
    }

    if (hoursString.trim().length === 0) return false;
    const lowerHours = hoursString.toLowerCase();
    if (lowerHours.includes('coming soon') || lowerHours.includes('temporarily closed')) return false;
    if (lowerHours.includes('closed') && !lowerHours.includes(':')) return false;

    const formatter = new Intl.DateTimeFormat('en-US', {
        timeZone: 'Europe/Brussels',
        weekday: 'short',
        hour: 'numeric',
        minute: 'numeric',
        hour12: false
    });

    const parts = formatter.formatToParts(new Date());
    const getPart = (type: string) => parts.find(p => p.type === type)?.value;

    const currentDay = getPart('weekday');
    const currentHourStr = getPart('hour');
    const currentMinuteStr = getPart('minute');

    if (!currentDay || !currentHourStr || !currentMinuteStr) return false;
    const currentHour = parseFloat(currentHourStr) + parseFloat(currentMinuteStr) / 60;

    const lines = hoursString.split('\n');
    const daysMap: { [key: string]: number } = { 'Mon': 1, 'Tue': 2, 'Wed': 3, 'Thu': 4, 'Fri': 5, 'Sat': 6, 'Sun': 7 };
    let todayLine = lines.find(line => line.includes(currentDay));

    if (!todayLine) {
        for (const line of lines) {
            const dayPart = line.split(':')[0];
            if (dayPart.includes('-')) {
                const [startDay, endDay] = dayPart.split('-').map(d => d.trim());
                if (daysMap[startDay] && daysMap[endDay] && daysMap[currentDay] &&
                    daysMap[currentDay] >= daysMap[startDay] && daysMap[currentDay] <= daysMap[endDay]) {
                    todayLine = line;
                    break;
                }
            }
        }
    }

    if (!todayLine) return false;
    if (todayLine.toLowerCase().includes('closed') && !todayLine.includes(':')) return false;

    const timePart = todayLine.substring(todayLine.indexOf(':') + 1).trim();
    const ranges = timePart.split(/[,&]/);

    for (const range of ranges) {
        const parts = range.split('-').map(s => s.trim());
        if (parts.length < 2) continue;
        const [startStr, endStr] = parts;

        const parseTime = (timeStr: string) => {
            const timeParts = timeStr.split(':').map(parseFloat);
            if (timeParts.length < 2) return timeParts[0];
            return timeParts[0] + timeParts[1] / 60;
        };

        const start = parseTime(startStr);
        const end = parseTime(endStr);
        if (currentHour >= start && currentHour < end) return true;
    }

    return false;
};
