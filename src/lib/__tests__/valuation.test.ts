import { describe, it, expect } from 'vitest'
import { calculateROI, formatCurrency } from '../valuation'

describe('Valuation Logic', () => {
    it('calculates positive ROI correctly', () => {
        // Bought: 100, Worth: 150 -> 50% gain
        expect(calculateROI(100, 150)).toBe(50)
    })

    it('calculates negative ROI correctly', () => {
        // Bought: 100, Worth: 80 -> 20% loss
        expect(calculateROI(100, 80)).toBe(-20)
    })

    it('handles zero purchase price to avoid infinity', () => {
        expect(calculateROI(0, 100)).toBe(0)
    })

    it('formats currency correctly (ES)', () => {
        // Note: Depends on Node locale, but we force es-ES in logic
        const formatted = formatCurrency(1234.56)
        // Accept standard ES format: 1.234,56 € or similar variations
        expect(formatted).toMatch(/1\.?234,56\s?€/)
    })
})
