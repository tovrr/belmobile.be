import { describe, it, expect } from 'vitest';
import { parseRouteParams } from './route-parser';

describe('Route Parser Logic', () => {
    it('should parse a basic service slug', () => {
        const result = parseRouteParams(['reparation']);
        expect(result?.service.id).toBe('repair');
        expect(result?.location).toBeUndefined();
    });

    it('should parse service and location', () => {
        const result = parseRouteParams(['reparation', 'schaerbeek']);
        expect(result?.service.id).toBe('repair');
        expect(result?.location?.id).toBe('schaerbeek');
    });

    it('should parse service, brand, and model', () => {
        const result = parseRouteParams(['reparation', 'smartphone', 'apple', 'iphone-13']);
        // console.log('DEBUG result:', result);
        expect(result?.service.id).toBe('repair');
        expect(result?.deviceCategory).toBe('smartphone');
        expect(result?.device?.value).toBe('Apple'); // Corrected casing: findDefaultBrandCategory returns found string
        expect(result?.deviceModel).toBe('iphone-13');
    });

    it('should parse service, brand, model, and location (standalone)', () => {
        const result = parseRouteParams(['reparation', 'smartphone', 'apple', 'iphone-13', 'molenbeek']);
        expect(result?.service.id).toBe('repair');
        expect(result?.device?.value).toBe('Apple');
        expect(result?.deviceModel).toBe('iphone-13');
        expect(result?.location?.id).toBe('molenbeek');
    });

    it('should parse service and location-suffixed model', () => {
        // e.g. /reparation/smartphone/apple/iphone-13-anderlecht
        const result = parseRouteParams(['reparation', 'smartphone', 'apple', 'iphone-13-anderlecht']);
        expect(result?.service.id).toBe('repair');
        expect(result?.deviceModel).toBe('iphone-13');
        expect(result?.location?.id).toBe('anderlecht');
    });

    it('should handle buyback slugs correctly', () => {
        const result = parseRouteParams(['inkoop', 'smartphone', 'samsung']);
        expect(result?.service.id).toBe('buyback');
        expect(result?.device?.value).toBe('Samsung');
    });

    it('should return null for unknown service', () => {
        const result = parseRouteParams(['unknown-service']);
        expect(result).toBeNull();
    });

    it('should handle empty segments gracefully', () => {
        const result = parseRouteParams([]);
        expect(result).toBeNull();
    });

    it('should handle malformed slugs by returning valid parts found', () => {
        const result = parseRouteParams(['reparation', 'malformed', 'junk', 'segments']);
        expect(result?.service.id).toBe('repair');
        expect(result?.device).toBeUndefined();
        expect(result?.location).toBeUndefined();
    });
});
