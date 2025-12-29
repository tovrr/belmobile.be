import { DEVICE_BRANDS } from '@/data/brands';
import { createSlug } from './slugs';

interface DeviceMatch {
    value: string; // The canonical brand name (e.g. "Apple")
    deviceType: string; // The category ID (e.g. "smartphone")
}

/**
 * Finds the default device category for a given brand slug.
 * Iterates through categories in the order defined in DEVICE_BRANDS.
 * Returns the first match found.
 */
export const findDefaultBrandCategory = (brandSlug: string): DeviceMatch | null => {
    for (const [type, brands] of Object.entries(DEVICE_BRANDS)) {
        const found = (brands as string[]).find(b => createSlug(b) === brandSlug);
        if (found) return { value: found, deviceType: type };
    }
    return null;
};
