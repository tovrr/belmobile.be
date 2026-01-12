import { SERVICES } from '@/data/services';
import { LOCATIONS, Location } from '@/data/locations';
import { DEVICE_TYPES } from '@/constants';
import { findDefaultBrandCategory } from '@/utils/deviceLogic';
import { createSlug } from '@/utils/slugs';

export const parseRouteParams = (slug: string[]) => {
    const firstSegment = slug && slug.length > 0 ? slug[0].toLowerCase() : '';
    const service = SERVICES.find(s => Object.values(s.slugs).some(slugVal => slugVal.toLowerCase() === firstSegment));

    if (!service) return null;

    let location: Location | undefined;
    let device: { value: string, deviceType: string } | undefined;
    let deviceModel: string | undefined;
    let deviceCategory: string | undefined;

    const segments = [...slug.slice(1)];

    // 1. Check for location (as a standalone segment or suffix)
    if (segments.length > 0) {
        // Try standalone first (e.g., /apple/iphone/molenbeek)
        const last = segments[segments.length - 1];
        const foundLoc = LOCATIONS.find(l => Object.values(l.slugs).includes(last));
        if (foundLoc) {
            location = foundLoc;
            segments.pop();
        } else {
            // Try suffix (e.g., /apple/iphone-molenbeek)
            for (const seg of segments) {
                const foundSuffixLoc = LOCATIONS.find(l =>
                    Object.values(l.slugs).some(s => seg.endsWith(`-${s}`))
                );
                if (foundSuffixLoc) {
                    location = foundSuffixLoc;
                    // Clean the segment where we found the location
                    const locSlug = Object.values(foundSuffixLoc.slugs).find(s => seg.endsWith(`-${s}`));
                    if (locSlug) {
                        const index = segments.indexOf(seg);
                        segments[index] = seg.replace(`-${locSlug}`, '');
                    }
                    break;
                }
            }
        }
    }

    // 2. Parse device/model/category from remaining segments
    if (segments.length > 0) {
        const seg1 = segments[0];
        // Robust check: match exact ID OR slugified ID (e.g. 'console_home' matched by 'console-home')
        const foundCat = DEVICE_TYPES.find(d => d.id === seg1 || createSlug(d.id) === seg1);
        if (foundCat) {
            deviceCategory = foundCat.id;
            // Check if next segment is a Brand
            if (segments.length > 1) {
                const seg2 = segments[1];
                const foundDev = findDefaultBrandCategory(seg2);
                if (foundDev) {
                    device = {
                        ...foundDev,
                        deviceType: deviceCategory || foundDev.deviceType
                    };
                    // Note: foundDev.deviceType might differ but we enforce category from URL
                    if (segments.length > 2) {
                        deviceModel = segments[2];
                    }
                }
            }
        } else {
            const foundDev = findDefaultBrandCategory(seg1);
            if (foundDev) {
                device = foundDev;
                deviceCategory = foundDev.deviceType; // Default category

                // Check if next segment is actually a specific Category Alias (e.g. /apple/tablets)
                if (segments.length > 1) {
                    const seg2 = segments[1];
                    const overriddenCat = DEVICE_TYPES.find(d =>
                        d.id === seg2 ||
                        d.aliases?.some(a => a.toLowerCase() === seg2.toLowerCase())
                    );

                    if (overriddenCat) {
                        // It's a category filter, not a model!
                        deviceCategory = overriddenCat.id;
                        if (segments.length > 2) {
                            deviceModel = segments[2];
                        }
                    } else {
                        // Standard: It's a model
                        deviceModel = segments[1];
                    }
                }
            }
        }

    }

    return { service, location, device, deviceModel, deviceCategory };
};
