import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export function cleanData(data: any): any {
    if (!data) return data;
    return JSON.parse(JSON.stringify(data));
}

/**
 * Escapes special characters in string for RegExp
 * Prevents ReDoS and NoSQL Injection via regex
 */
export function escapeRegExp(string: string): string {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Robustly parses a price string from various international formats.
 * Handles: "1.250,50 €", "$1,250.50", "£ 450", "1200.00 EUR"
 */
export function parseFormattedPrice(priceText: string): { value: number; currency: string } {
    if (!priceText) return { value: 0, currency: 'EUR' };

    // 1. Identify currency
    let currency = 'EUR';
    if (priceText.includes('$')) currency = 'USD';
    else if (priceText.includes('£')) currency = 'GBP';
    else if (priceText.includes('USD')) currency = 'USD';
    else if (priceText.includes('GBP')) currency = 'GBP';

    // 2. Extract numeric parts (digits, dots and commas)
    // Example: "EUR 1.250,50" -> "1.250,50"
    let clean = priceText.replace(/[^\d,.]/g, '');

    if (!clean) return { value: 0, currency };

    // 3. Thousands vs Decimal logic
    if (clean.includes('.') && clean.includes(',')) {
        // Both separators present
        const lastDot = clean.lastIndexOf('.');
        const lastComma = clean.lastIndexOf(',');
        
        if (lastDot > lastComma) {
            // US/UK Format: 1,250.50
            clean = clean.replace(/,/g, '');
        } else {
            // EU Format: 1.250,50
            clean = clean.replace(/\./g, '').replace(',', '.');
        }
    } else if (clean.includes(',')) {
        // Only comma: 1,250 (US thousands) OR 12,50 (EU decimal)
        const parts = clean.split(',');
        // Heuristic: if last part is 2 digits, it's likely decimal
        if (parts[parts.length - 1].length === 2) {
            clean = clean.replace(',', '.');
        } else {
            clean = clean.replace(',', '');
        }
    } else if (clean.includes('.')) {
        // Only dot: 1.250 (EU thousands) OR 12.50 (US decimal)
        const parts = clean.split('.');
        if (parts[parts.length - 1].length !== 2) {
            clean = clean.replace(/\./g, '');
        }
    }

    const value = parseFloat(clean) || 0;
    return { value, currency };
}
