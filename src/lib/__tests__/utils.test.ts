import { describe, it, expect } from 'vitest'
import { parseFormattedPrice, escapeRegExp } from '../utils'

describe('Utility Logic', () => {
    describe('parseFormattedPrice', () => {
        it('parses Spanish format correctly (1.250,50 €)', () => {
            const result = parseFormattedPrice('1.250,50 €');
            expect(result.value).toBe(1250.50);
            expect(result.currency).toBe('EUR');
        });

        it('parses US format correctly ($1,250.50)', () => {
            const result = parseFormattedPrice('$1,250.50');
            expect(result.value).toBe(1250.50);
            expect(result.currency).toBe('USD');
        });

        it('parses simple integers (450 €)', () => {
            const result = parseFormattedPrice('450 €');
            expect(result.value).toBe(450);
        });

        it('handles complex strings from eBay (EUR 1.200,00 a EUR 1.500,00)', () => {
            const result = parseFormattedPrice('EUR 1.200,00 a EUR 1.500,00');
            expect(result.value).toBe(1200);
            expect(result.currency).toBe('EUR');
        });

        it('returns zero for garbage input', () => {
            const result = parseFormattedPrice('Contact seller');
            expect(result.value).toBe(0);
        });
    });

    describe('escapeRegExp', () => {
        it('escapes regex special characters', () => {
            expect(escapeRegExp('DX7 (Vintage)')).toBe('DX7 \\(Vintage\\)');
            expect(escapeRegExp('100% Correct')).toBe('100% Correct');
        });
    });
});
