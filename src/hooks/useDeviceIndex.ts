import { useState, useEffect } from 'react';
import { DEVICE_BRANDS } from '../data/brands';
import { createSlug } from '../utils/slugs';
import { normalizeCategoryLabel } from '../utils/pricing-utils';

export type DeviceIndexItem = {
    id: string;          // e.g. "apple-iphone-13"
    name: string;        // e.g. "iPhone 13"
    brand: string;       // e.g. "Apple"
    category: string;    // e.g. "Smartphone"
    fileCategory: string; // e.g. "smartphone" (internal key in model file)
};

export const useDeviceIndex = () => {
    const [deviceIndex, setDeviceIndex] = useState<DeviceIndexItem[]>([]);
    const [isLoadingIndex, setIsLoadingIndex] = useState(true);

    useEffect(() => {
        const buildIndex = async () => {
            setIsLoadingIndex(true);
            const index: DeviceIndexItem[] = [];
            const processedBrands = new Set<string>();

            // 1. Get all unique brands from DEVICE_BRANDS
            Object.values(DEVICE_BRANDS).flat().forEach(brand => {
                processedBrands.add(brand);
            });

            // 2. Iterate and load files
            for (const brand of Array.from(processedBrands)) {
                try {
                    const brandSlug = createSlug(brand);
                    // Handle Microsoft vs Xbox vs Surface naming quirks if necessary
                    // but usually the file is just [brand].ts
                    let importSlug = brandSlug;
                    if (brand === 'Microsoft') importSlug = 'microsoft';
                    // (Ensure your file naming matches. 'Xbox' -> 'xbox.ts', 'Sony' -> 'sony.ts')

                    const modelData = await import(`../data/models/${importSlug}`);
                    if (modelData.MODELS) {
                        const modelsObj = modelData.MODELS;

                        // Iterate through categories in the file (e.g. smartphone, tablet)
                        // Iterate through categories in the file (e.g. smartphone, tablet)
                        Object.entries(modelsObj).forEach(([fCat, fModels]: [string, unknown]) => {
                            if (typeof fModels !== 'object' || fModels === null) return;

                            // Map internal keys to Display Categories using shared utility
                            const displayCat = normalizeCategoryLabel(fCat, brand);

                            Object.keys(fModels as Record<string, unknown>).forEach(modelName => {
                                // Create master slug
                                const fullSlug = createSlug(`${brand} ${modelName}`);

                                index.push({
                                    id: fullSlug,
                                    name: modelName,
                                    brand: brand,
                                    category: displayCat,
                                    fileCategory: fCat
                                });
                            });
                        });
                    }
                } catch {
                    // console.warn(`No static file for ${brand}`);
                }
            }

            setDeviceIndex(index.sort((a, b) => a.name.localeCompare(b.name)));
            setIsLoadingIndex(false);
        };

        buildIndex();
    }, []);

    return { deviceIndex, isLoadingIndex };
};
