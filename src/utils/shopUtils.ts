
import { Shop } from '../types';
import { db } from '../firebase';
import { collection, getDocs } from 'firebase/firestore';
import { LOCATIONS } from '../data/locations';
import { SHOPS } from '../constants';

/**
 * Fetch shops from Firestore and merge with static LOCATIONS
 */
export const fetchMergedShops = async (): Promise<Shop[]> => {
    let shops: Shop[] = [];
    try {
        const snapshot = await getDocs(collection(db, 'shops'));
        shops = snapshot.docs.map(doc => {
            const shopData = { id: doc.id, ...doc.data() } as unknown as Shop;
            // Override with verified constants for core shops
            const verifiedShop = SHOPS.find(s => s.id === shopData.id);
            const staticInfo = LOCATIONS.find(l => l.id === shopData.id);

            return {
                ...shopData,
                // Ensure zip and slugs are always available from static data if missing in DB
                zip: shopData.zip || staticInfo?.zip,
                slugs: shopData.slugs || staticInfo?.slugs,
                isHub: staticInfo?.isHub || false,
                // Merge critical flags from constants
                isPrimary: shopData.isPrimary ?? verifiedShop?.isPrimary ?? false,
                // Override coordinates/address for specific shops as per previous logic
                ...(verifiedShop && (shopData.id === 'schaerbeek' || shopData.id === 'anderlecht' || shopData.id === 'molenbeek') ? {
                    coords: verifiedShop.coords,
                    address: verifiedShop.address,
                    name: verifiedShop.name
                } : {})
            };
        });
    } catch (error) {
        console.error("Error fetching shops:", error);
    }

    // Merge static LOCATIONS
    const staticShops = LOCATIONS.map(l => ({
        ...l,
        // Do not force 'open' here, let the merging logic handle it
    } as unknown as Shop));

    const combined = [...shops];
    staticShops.forEach(s => {
        const existing = combined.find(c => c.id === s.id);
        if (!existing) {
            combined.push(s);
        } else if (!existing.status) {
            // Keep the status from database if it exists, otherwise use 'open'
            existing.status = 'open';
        }
    });

    return combined;
};

/**
 * Helper to check if shop is open based on Brussels Time, supporting day ranges
 */
export const isShopOpen = (hoursInput: string | string[] | undefined): boolean => {
    // Safety check: return false if hoursInput is undefined or empty
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

    // Normalizing known status strings that imply "closed"
    const lowerHours = hoursString.toLowerCase();
    if (lowerHours.includes('coming soon') || lowerHours.includes('temporarily closed')) return false;
    if (lowerHours.includes('closed') && !lowerHours.includes(':')) return false;

    // 1. Get Brussels Time
    const formatter = new Intl.DateTimeFormat('en-US', {
        timeZone: 'Europe/Brussels',
        weekday: 'short',
        hour: 'numeric',
        minute: 'numeric',
        hour12: false
    });

    const parts = formatter.formatToParts(new Date());
    const getPart = (type: string) => parts.find(p => p.type === type)?.value;

    const currentDay = getPart('weekday'); // "Mon", "Tue", etc.
    const currentHourStr = getPart('hour');
    const currentMinuteStr = getPart('minute');

    if (!currentDay || !currentHourStr || !currentMinuteStr) return false;

    const currentHour = parseFloat(currentHourStr) + parseFloat(currentMinuteStr) / 60;

    // 2. Parse all lines and expand ranges
    const lines = hoursString.split('\n');
    const daysMap: { [key: string]: number } = { 'Mon': 1, 'Tue': 2, 'Wed': 3, 'Thu': 4, 'Fri': 5, 'Sat': 6, 'Sun': 7 };

    let todayLine = lines.find(line => line.includes(currentDay));

    if (!todayLine) {
        // Try to handle ranges like "Mon-Sat"
        for (const line of lines) {
            const dayPart = line.split(':')[0];
            if (dayPart.includes('-')) {
                const [startDay, endDay] = dayPart.split('-').map(d => d.trim());
                const startIdx = daysMap[startDay];
                const endIdx = daysMap[endDay];
                const currentIdx = daysMap[currentDay];

                if (startIdx && endIdx && currentIdx && currentIdx >= startIdx && currentIdx <= endIdx) {
                    todayLine = line;
                    break;
                }
            }
        }
    }

    if (!todayLine) return false; // Still no info -> closed
    if (todayLine.toLowerCase().includes('closed') && !todayLine.includes(':')) return false;

    // 3. Parse hours
    // Handle cases like "Fri: 10:30-12:30 & 14:30-19:00"
    const timePart = todayLine.substring(todayLine.indexOf(':') + 1).trim();

    // Split by comma or ampersand for multiple ranges
    const ranges = timePart.split(/[,&]/);

    for (const range of ranges) {
        const parts = range.split('-').map(s => s.trim());
        if (parts.length < 2) continue;

        const [startStr, endStr] = parts;

        const parseTime = (timeStr: string) => {
            const timeParts = timeStr.split(':').map(parseFloat);
            if (timeParts.length < 2) return timeParts[0]; // Handle just "10" as 10:00
            return timeParts[0] + timeParts[1] / 60;
        };

        const start = parseTime(startStr);
        const end = parseTime(endStr);

        if (currentHour >= start && currentHour < end) {
            return true;
        }
    }

    return false;
};
