import { describe, it, expect } from 'vitest';
import { calculateBuybackPrice, calculateRepairPrice, PricingState, PricingData } from './pricingCalculator';

describe('Pricing Calculator Logic', () => {
    const mockData: PricingData = {
        buybackPrices: [
            { deviceId: 'apple-iphone-13', storage: '128gb', condition: 'good', price: 400, currency: 'EUR', updatedAt: '' },
            { deviceId: 'apple-iphone-13', storage: '256gb', condition: 'good', price: 450, currency: 'EUR', updatedAt: '' }
        ],
        repairPrices: {
            'screen_generic': 100,
            'screen_oled': 150,
            'screen_original': 200,
            'battery': 60,
            'back_glass': 80
        }
    };

    describe('calculateBuybackPrice', () => {
        it('should return 0 if basic params are missing', () => {
            const state: Partial<PricingState> = { type: 'buyback' };
            expect(calculateBuybackPrice(state as PricingState, mockData)).toBe(0);
        });

        it('should calculate base price correctly for matching storage', () => {
            const state: PricingState = {
                type: 'buyback',
                deviceType: 'smartphone',
                selectedBrand: 'Apple',
                selectedModel: 'iPhone 13',
                storage: '256gb',
                repairIssues: []
            };
            expect(calculateBuybackPrice(state, mockData)).toBe(450);
        });

        it('should return 0 if device does not turn on', () => {
            const state: PricingState = {
                type: 'buyback',
                deviceType: 'smartphone',
                selectedBrand: 'Apple',
                selectedModel: 'iPhone 13',
                storage: '128gb',
                turnsOn: false,
                repairIssues: []
            };
            expect(calculateBuybackPrice(state, mockData)).toBe(0);
        });

        it('should deduct battery service cost for Apple devices', () => {
            const state: PricingState = {
                type: 'buyback',
                deviceType: 'smartphone',
                selectedBrand: 'Apple',
                selectedModel: 'iPhone 13',
                storage: '128gb',
                batteryHealth: 'service',
                repairIssues: []
            };
            // 400 (base) - 60 (battery) = 340
            expect(calculateBuybackPrice(state, mockData)).toBe(340);
        });

        it('should deduct screen repair price for cracked screen', () => {
            const state: PricingState = {
                type: 'buyback',
                deviceType: 'smartphone',
                selectedBrand: 'Apple',
                selectedModel: 'iPhone 13',
                storage: '128gb',
                screenState: 'cracked',
                repairIssues: []
            };
            // Min screen price is generic (100)
            // 400 - 100 = 300
            expect(calculateBuybackPrice(state, mockData)).toBe(300);
        });
    });

    describe('calculateRepairPrice', () => {
        it('should return 0 if no issues selected', () => {
            const state: PricingState = {
                type: 'repair',
                deviceType: 'smartphone',
                selectedBrand: 'Apple',
                selectedModel: 'iPhone 13',
                storage: '128gb',
                repairIssues: []
            };
            expect(calculateRepairPrice(state, mockData)).toBe(0);
        });

        it('should calculate price for generic screen', () => {
            const state: PricingState = {
                type: 'repair',
                deviceType: 'smartphone',
                selectedBrand: 'Apple',
                selectedModel: 'iPhone 13',
                storage: '128gb',
                repairIssues: ['screen'],
                selectedScreenQuality: 'generic'
            };
            expect(calculateRepairPrice(state, mockData)).toBe(100);
        });

        it('should calculate price for multiple issues', () => {
            const state: PricingState = {
                type: 'repair',
                deviceType: 'smartphone',
                selectedBrand: 'Apple',
                selectedModel: 'iPhone 13',
                storage: '128gb',
                repairIssues: ['screen', 'battery'],
                selectedScreenQuality: 'original'
            };
            // 200 (original screen) + 60 (battery) = 260
            expect(calculateRepairPrice(state, mockData)).toBe(260);
        });

        it('should add hydrogel fee if enabled', () => {
            const state: PricingState = {
                type: 'repair',
                deviceType: 'smartphone',
                selectedBrand: 'Apple',
                selectedModel: 'iPhone 13',
                storage: '128gb',
                repairIssues: ['battery'],
                hasHydrogel: true
            };
            // 60 + 15 = 75
            expect(calculateRepairPrice(state, mockData)).toBe(75);
        });

        it('should return -1 if an issue price is missing', () => {
            const state: PricingState = {
                type: 'repair',
                deviceType: 'smartphone',
                selectedBrand: 'Apple',
                selectedModel: 'iPhone 13',
                storage: '128gb',
                repairIssues: ['unknown_issue']
            };
            expect(calculateRepairPrice(state, mockData)).toBe(-1);
        });
    });
});
