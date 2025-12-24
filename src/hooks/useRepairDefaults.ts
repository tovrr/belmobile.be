import { useCallback } from 'react';
import { RepairPriceRecord } from '../types';
import { PricingEngine } from '../utils/pricing-engine';

export const useRepairDefaults = () => {
    // Helper to add price record with Engine
    const createPriceRecord = (deviceId: string, issueId: string, variants: Record<string, string>, partCost: number, laborMinutes: number, timestamp: string): RepairPriceRecord => {
        const finalPrice = PricingEngine.calculateRepairPrice(partCost, laborMinutes);

        return {
            deviceId,
            issueId,
            variants,
            price: finalPrice,
            currency: 'EUR',
            partCost: partCost,
            laborMinutes: laborMinutes, // Default for batch generation
            isActive: true,
            updatedAt: timestamp
        };
    };
    const generateAppleDefaults = useCallback((deviceId: string): RepairPriceRecord[] => {
        // Basic tier detection
        const isProMax = deviceId.includes('pro-max');
        const isPro = deviceId.includes('pro') && !isProMax;


        // Series detection
        const match = deviceId.match(/iphone-(\d+)/);
        const series = match ? parseInt(match[1]) : 0;

        // PART COSTS (Estimated)
        let screenGeneric = 0;
        let screenOled = 0;
        let screenOriginal = 0;
        let battery = 0;
        let charging = 0;
        let rearCam = 0;
        let backGlass = 0;
        let housing = 0;
        let faceId = 0;

        // Series 15 (USB-C, high value)
        if (series >= 15) {
            screenGeneric = 0;
            screenOled = 150 + (isPro ? 40 : 0) + (isProMax ? 80 : 0);
            screenOriginal = 250 + (isPro ? 60 : 0) + (isProMax ? 100 : 0);

            battery = 35;
            charging = 40;
            rearCam = 80 + (isPro ? 40 : 0);
            backGlass = 40;
            housing = 100;
            faceId = 60;
        }
        // Series 13, 14 (Modern OLED)
        else if (series >= 13) {
            screenGeneric = 40 + (isPro ? 10 : 0);
            screenOled = 80 + (isPro ? 30 : 0) + (isProMax ? 50 : 0);
            screenOriginal = 160 + (isPro ? 40 : 0) + (isProMax ? 60 : 0);

            battery = 25;
            charging = 30;
            rearCam = 60;
            backGlass = 30;
            housing = 80;
            faceId = 50;
        }
        // Series 12
        else if (series === 12) {
            screenGeneric = 35;
            screenOled = 70;
            screenOriginal = 130;
            battery = 20;
            charging = 25;
            rearCam = 50;
            backGlass = 25;
            housing = 60;
            faceId = 40;
        }
        // Series X, 11
        else if (series >= 10) {
            if (deviceId.includes('iphone-11') && !isPro && !isProMax) {
                screenGeneric = 25;
                screenOled = 0;
                screenOriginal = 60;
            } else {
                screenGeneric = 25;
                screenOled = 45;
                screenOriginal = 80;
            }
            battery = 18;
            charging = 20;
            rearCam = 40;
            backGlass = 20;
            housing = 40;
            faceId = 30;
        }
        // Older
        else {
            screenGeneric = 15;
            screenOled = 0;
            screenOriginal = 35;
            battery = 10;
            charging = 15;
            rearCam = 20;
            backGlass = 15;
            housing = 30;
        }

        const records: RepairPriceRecord[] = [];
        const timestamp = new Date().toISOString();

        const addPrice = (issueId: string, variants: Record<string, string>, partCost: number, laborMinutes: number) => {
            if (partCost <= 0) return;
            records.push(createPriceRecord(deviceId, issueId, variants, partCost, laborMinutes, timestamp));
        };

        // Screen Variants
        if (screenGeneric > 0) addPrice('screen', { quality: 'generic-lcd' }, screenGeneric, 45);
        if (screenOled > 0) addPrice('screen', { quality: 'oled-soft' }, screenOled, 45);
        if (screenOriginal > 0) addPrice('screen', { quality: 'original-refurb' }, screenOriginal, 45);

        // Components
        if (battery > 0) addPrice('battery', {}, battery, 30);
        if (charging > 0) addPrice('charging', {}, charging, 45);
        if (rearCam > 0) addPrice('camera_rear', {}, rearCam, 30);
        if (rearCam > 0) addPrice('camera_front', {}, Math.max(40, rearCam - 20), 30); // Heuristic for Front Cam
        if (backGlass > 0) addPrice('back_glass', {}, backGlass, 90); // Hard labor
        if (housing > 0) addPrice('housing', {}, housing, 120); // Very hard labor
        if (faceId > 0) addPrice('face_id', {}, faceId, 60);

        return records;
    }, []);

    const generateSamsungDefaults = useCallback((deviceId: string): RepairPriceRecord[] => {
        const timestamp = new Date().toISOString();
        const records: RepairPriceRecord[] = [];
        const add = (i: string, v: Record<string, string>, p: number, labor: number) => {
            if (p > 0) records.push(createPriceRecord(deviceId, i, v, p, labor, timestamp));
        };

        const isUltra = deviceId.includes('ultra');
        const isPlus = deviceId.includes('plus') || deviceId.includes('+');

        // Series Extraction
        let series = 0;
        const sMatch = deviceId.match(/s(\d+)/);
        const aMatch = deviceId.match(/a(\d+)/);
        const noteMatch = deviceId.match(/note[- ]?(\d+)/);

        let screen = 0;
        let battery = 25;
        let charging = 25;
        let backGlass = 30;

        // S Series
        if (sMatch) {
            series = parseInt(sMatch[1]);
            if (series >= 24) { // S24
                screen = 250 + (isUltra ? 60 : 0) + (isPlus ? 30 : 0);
                battery = 45;
                charging = 50;
                backGlass = 40;
            } else if (series >= 22) { // S22, S23
                screen = 180 + (isUltra ? 50 : 0) + (isPlus ? 20 : 0);
                battery = 40;
                charging = 40;
                backGlass = 30;
            } else if (series >= 20) {
                screen = 140 + (isUltra ? 40 : 0);
                battery = 35;
                charging = 35;
                backGlass = 25;
            } else {
                screen = 100;
                battery = 30;
                charging = 30;
                backGlass = 20;
            }
        }
        // A Series
        else if (aMatch) {
            series = parseInt(aMatch[1]);
            if (series >= 70) {
                screen = 90;
                battery = 30;
                charging = 30;
            } else if (series >= 50) {
                screen = 80;
                battery = 30;
                charging = 30;
            } else if (series >= 30) {
                screen = 70;
                battery = 30;
                charging = 25;
            } else {
                screen = 40;
                battery = 20;
                charging = 20;
            }
        }
        // Note Series
        else if (noteMatch) {
            series = parseInt(noteMatch[1]);
            if (series >= 20) screen = 200 + (isUltra ? 50 : 0);
            else screen = 150;
            battery = 35;
            charging = 35;
            backGlass = 30;
        }

        // Foldables
        if (deviceId.includes('fold') || deviceId.includes('flip')) {
            const zMatch = deviceId.match(/(?:fold|flip)(\d+)/);
            const gen = zMatch ? parseInt(zMatch[1]) : 3;

            if (deviceId.includes('fold')) {
                add('screen_foldable_inner', {}, 400 + (gen * 50), 60); // Very expensive
                add('screen_foldable_outer', {}, 120 + (gen * 10), 45);
                screen = 0;
            } else {
                add('screen_foldable_inner', {}, 300 + (gen * 30), 60);
                add('screen', {}, 100, 45); // Outer
                screen = 0;
            }
            battery = 45;
            charging = 50;
            backGlass = 40;
        }

        if (screen > 0) {
            add('screen', { quality: 'service-pack-original' }, screen, 45);
        }

        add('battery', {}, battery, 30);
        add('charging', {}, charging, 45);
        add('back_glass', {}, backGlass, 60);

        add('camera_rear', {}, screen > 0 ? screen * 0.4 : 40, 30);
        add('camera_lens', {}, 15, 20);

        return records;
    }, []);

    const generateGoogleDefaults = useCallback((deviceId: string): RepairPriceRecord[] => {
        const timestamp = new Date().toISOString();
        const records: RepairPriceRecord[] = [];
        const add = (i: string, v: Record<string, string>, p: number, labor: number) => {
            if (p > 0) records.push(createPriceRecord(deviceId, i, v, p, labor, timestamp));
        };

        const isPro = deviceId.includes('pro');
        const match = deviceId.match(/pixel-(\d+)/);
        const series = match ? parseInt(match[1]) : 6;

        let screen = 0;
        let battery = 30;
        let charging = 30;

        if (series >= 8) {
            screen = 150 + (isPro ? 50 : 0);
            battery = 40;
            charging = 40;
        } else if (series >= 6) {
            screen = 110 + (isPro ? 40 : 0);
            battery = 35;
        } else {
            screen = 80;
            battery = 25;
        }

        if (screen > 0) add('screen', { quality: 'original-refurb' }, screen, 45);
        add('battery', {}, battery, 30);
        add('charging', {}, charging, 45);
        add('back_glass', {}, 40, 60);
        add('camera_rear', {}, 60, 30);

        return records;
    }, []);

    // NEW: Xiaomi Generator
    // NEW: Xiaomi Generator
    const generateXiaomiDefaults = useCallback((deviceId: string): RepairPriceRecord[] => {
        const timestamp = new Date().toISOString();
        const records: RepairPriceRecord[] = [];
        const add = (i: string, v: Record<string, string>, p: number, labor: number) => {
            if (p > 0) records.push(createPriceRecord(deviceId, i, v, p, labor, timestamp));
        };

        // Heuristics
        const isLite = deviceId.includes('lite');
        const isPro = deviceId.includes('pro');
        const isRedmi = deviceId.includes('redmi');
        const isPoco = deviceId.includes('poco');

        let screen = 0;
        let battery = 25;
        const charging = 25;

        // Budget Series (Redmi non-Note, Poco M)
        if (isRedmi && !deviceId.includes('note') && !isPoco) {
            screen = 40; // LCD
            battery = 20;
        }
        // Redmi Note Series
        else if (deviceId.includes('redmi-note')) {
            screen = 60 + (isPro ? 20 : 0);
            battery = 25;
        }
        // Xiaomi Main Series
        else if (!isRedmi && !isPoco) {
            const numMatch = deviceId.match(/xiaomi-(\d+)/) || deviceId.match(/mi-(\d+)/);
            if (numMatch) {
                const num = parseInt(numMatch[1]);
                if (num >= 12) screen = 150 + (isPro ? 50 : 0); // Expensive curved OLEDs
                else if (num >= 10) screen = 100;
            } else {
                screen = 80;
            }
        } else {
            // Fallback
            screen = 60;
        }

        // Generic fallback for LCD vs OLED based on 'lite'
        if (isLite) screen = Math.max(40, screen - 30);

        if (screen > 0) add('screen', { quality: 'service-pack-original' }, screen, 45);
        add('battery', {}, battery, 30);
        add('charging', {}, charging, 45);
        add('back_glass', {}, isRedmi ? 15 : 30, 45);

        return records;
    }, []);

    // NEW: OnePlus Generator
    const generateOnePlusDefaults = useCallback((deviceId: string): RepairPriceRecord[] => {
        const timestamp = new Date().toISOString();
        const records: RepairPriceRecord[] = [];
        const add = (i: string, v: Record<string, string>, p: number, labor: number) => {
            if (p > 0) records.push(createPriceRecord(deviceId, i, v, p, labor, timestamp));
        };

        const isPro = deviceId.includes('pro');
        const isNord = deviceId.includes('nord');

        let screen = 0;
        let battery = 30;
        const charging = 30;

        if (isNord) {
            screen = 60;
            battery = 25;
        } else if (isPro) {
            screen = 140;
            battery = 35;
        } else {
            screen = 90;
        }

        add('screen', { quality: 'service-pack-original' }, screen, 45);
        add('battery', {}, battery, 30);
        add('charging', {}, charging, 45);
        add('back_glass', {}, 30, 45);

        return records;
    }, []);

    // NEW: Oppo Generator
    const generateOppoDefaults = useCallback((deviceId: string): RepairPriceRecord[] => {
        const timestamp = new Date().toISOString();
        const records: RepairPriceRecord[] = [];
        const add = (i: string, v: Record<string, string>, p: number, labor: number) => {
            if (p > 0) records.push(createPriceRecord(deviceId, i, v, p, labor, timestamp));
        };

        const isFind = deviceId.includes('find');
        const isReno = deviceId.includes('reno');
        const isA = deviceId.includes('a-series') || deviceId.match(/a\d+/);

        let screen = 0;
        let battery = 30;
        const charging = 30;

        if (isFind) {
            screen = 180; // Premium
            battery = 40;
        } else if (isReno) {
            screen = 90; // Mid-High
            battery = 35;
        } else if (isA) {
            screen = 50; // Budget
            battery = 25;
        } else {
            screen = 80;
        }

        add('screen', { quality: 'service-pack-original' }, screen, 45);
        add('battery', {}, battery, 30);
        add('charging', {}, charging, 45);
        add('back_glass', {}, 30, 45);

        return records;
    }, []);

    // NEW: Generic Fallback Generator
    const generateGenericDefaults = useCallback((deviceId: string): RepairPriceRecord[] => {
        const timestamp = new Date().toISOString();
        const records: RepairPriceRecord[] = [];
        const create = (i: string, p: number, labor: number) => createPriceRecord(deviceId, i, {}, p, labor, timestamp);

        // Very basic approximations
        records.push(create('screen', 60, 45));
        records.push(create('battery', 30, 30));
        records.push(create('charging', 30, 45));

        return records;
    }, []);


    const generateHuaweiDefaults = useCallback((deviceId: string): RepairPriceRecord[] => {
        const timestamp = new Date().toISOString();
        const records: RepairPriceRecord[] = [];
        const add = (i: string, v: Record<string, string>, p: number, labor: number) => {
            if (p > 0) records.push(createPriceRecord(deviceId, i, v, p, labor, timestamp));
        };



        const isPro = deviceId.includes('pro');
        const isLite = deviceId.includes('lite');

        const pMatch = deviceId.match(/p(\d+)/);
        const mMatch = deviceId.match(/mate[- ]?(\d+)/);

        let series = 0;
        if (pMatch) series = parseInt(pMatch[1]);
        if (mMatch) series = parseInt(mMatch[1]);

        let screen = 0;
        let battery = 30;
        let charging = 30;

        if (series >= 50) { // P50, Mate 50
            screen = 180 + (isPro ? 80 : 0);
            battery = 50;
            charging = 45;
        } else if (series >= 40) { // P40, Mate 40
            screen = 130 + (isPro ? 60 : 0);
            if (isLite) screen = 50;
            battery = 45;
            charging = 40;
        } else if (series >= 30) { // P30, Mate 30
            screen = 90 + (isPro ? 40 : 0);
            if (isLite) screen = 40;
            battery = 35;
            charging = 30;
        } else {
            screen = 40;
            battery = 25;
            charging = 25;
        }

        if (screen > 0) add('screen', { quality: 'service-pack-original' }, screen, 45);
        add('battery', {}, battery, 30);
        add('charging', {}, charging, 45);
        add('back_glass', {}, 30, 45);

        return records;
    }, []);

    const generateSonyDefaults = useCallback((deviceId: string): RepairPriceRecord[] => {
        const timestamp = new Date().toISOString();
        const records: RepairPriceRecord[] = [];
        const add = (i: string, v: Record<string, string>, p: number, labor: number) => {
            if (p > 0) records.push(createPriceRecord(deviceId, i, v, p, labor, timestamp));
        };

        // Naive detection: "sony-playstation-5" -> PS5
        const isPS5 = deviceId.includes('playstation-5') || deviceId.includes('ps5');
        const isPS4 = deviceId.includes('playstation-4') || deviceId.includes('ps4');
        const isPro = deviceId.includes('pro');

        let hdmi = 0;
        let cleaning = 0;
        let drive = 0;
        let psu = 0;

        if (isPS5) {
            hdmi = 40;
            cleaning = 30; // "Liquid Metal" handling
            drive = 60;
            psu = 80;
        } else if (isPS4) {
            hdmi = 20;
            cleaning = 10; // Thermal paste
            drive = 40;
            psu = 40;
            if (isPro) cleaning = 15;
        }

        // Xperia phones?
        const isXperia = deviceId.includes('xperia');
        if (isXperia) {
            add('screen', { quality: 'original-refurb' }, 100, 45);
            add('battery', {}, 40, 30);
        }

        if (hdmi > 0) add('hdmi', {}, hdmi, 60); // 1 hour soldering
        if (cleaning > 0) add('cleaning', {}, cleaning, 45); // Disassembly
        if (drive > 0) add('disc_drive', {}, drive, 45);
        if (psu > 0) add('power_supply', {}, psu, 45);

        return records;
    }, []);

    return {
        generateAppleDefaults,
        generateSamsungDefaults,
        generateGoogleDefaults,
        generateHuaweiDefaults,
        generateSonyDefaults,
        generateXiaomiDefaults,
        generateOnePlusDefaults,
        generateOppoDefaults,
        generateGenericDefaults
    };
};
