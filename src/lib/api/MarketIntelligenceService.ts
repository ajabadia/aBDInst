
import { reverbService } from './reverb';
import { ebayService } from './ebay';
import { wallapopService } from './wallapop';

export interface UnifiedListing {
    source: 'reverb' | 'ebay' | 'wallapop' | 'mercadolibre';
    id: string;
    title: string;
    price: number;
    currency: string;
    url: string;
    imageUrl?: string;
    condition?: string;
    location?: string;
    timestamp: Date;
}

export interface MarketMetrics {
    min: number;
    max: number;
    avg: number;
    currency: string;
    count: number;
    lastUpdated: Date;
}

export class MarketIntelligenceService {

    /**
     * Aggregates listings from all available sources
     */
    async fetchAllListings(query: string): Promise<UnifiedListing[]> {
        const [reverb, ebay, wallapop] = await Promise.all([
            reverbService.searchListings(query).catch(() => []),
            ebayService.searchListings(query).catch(() => []),
            wallapopService.searchListings(query).catch(() => [])
        ]);

        const normalized: UnifiedListing[] = [
            ...(reverb || []).map(l => ({
                ...l,
                source: 'reverb' as const,
                price: typeof l.price === 'object' ? (l as any).price.amount : l.price,
                currency: typeof l.price === 'object' ? (l as any).price.currency : (l as any).currency || 'EUR',
                timestamp: l.date || new Date()
            })),
            ...(ebay || []).map(l => ({ ...l, source: 'ebay' as const, price: l.price.amount, currency: l.price.currency })),
            ...(wallapop || []).map(l => ({ ...l, source: 'wallapop' as const, price: l.price.amount, currency: l.price.currency }))
        ];

        // 1. Blacklist for accessories (only if the title is PRIMARILY the accessory)
        const accessoryKeywords = ['cable', 'patch', 'patching', 'decksaver', 'manual', 'skin', 'sticker', 'dust cover', 'replacement', 'button', 'knob', 'rack ear', 'power supply', 'adapter', 'transformador'];

        // 2. Normalization helper
        const normalize = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, '');

        const queryWords = query.toLowerCase().split(/\s+/).filter(w => w.length > 1); // Allow shorter words like 'MS'

        const filtered = normalized.filter(l => {
            const title = l.title.toLowerCase();
            const titleNormalized = normalize(l.title);

            // Smarter Accessory Check: 
            // If the title starts with "Case for" or "Cable for", it's an accessory.
            // If it just "contains" the word "case", it might be "Instrument with Case".
            const titleWords = title.split(/\s+/);
            const isAccessory = accessoryKeywords.some(acc => {
                const accWords = acc.split(/\s+/);
                // Check if the accessory keyword is a significant part of the title start
                if (titleWords.slice(0, 3).some(w => accWords.includes(w))) return true;
                // Or if it's "for [Instrument]" e.g. "Case for Korg MS20"
                if (title.includes(`${acc} for`) || title.includes(`${acc} para`)) return true;
                return false;
            });

            if (isAccessory) return false;

            // Flexible word check: handles "MS-20" vs "MS20"
            const matchesWords = queryWords.every(word => {
                const normWord = normalize(word);
                if (normWord.length <= 1) return true; // Skip single letters in match
                return title.includes(word) || titleNormalized.includes(normWord);
            });
            if (!matchesWords) return false;

            // Price Floor: 
            // Be more lenient - if it's under 20 (not 50), it's probably a part/cable.
            // 20 is a safer floor than 50 for some gear.
            if (l.price < 20) return false;

            return true;
        });

        // Price Outlier Removal (Interquartile Range)
        if (filtered.length >= 4) {
            const sortedPrices = [...filtered].map(l => l.price).sort((a, b) => a - b);
            const q1 = sortedPrices[Math.floor(sortedPrices.length * 0.25)];
            const q3 = sortedPrices[Math.floor(sortedPrices.length * 0.75)];
            const iqr = q3 - q1;
            const minAllowed = q1 - 1.5 * iqr;
            const maxAllowed = q3 + 1.5 * iqr;

            return filtered.filter(l => l.price >= minAllowed && l.price <= maxAllowed)
                .sort((a, b) => {
                    const timeA = a.timestamp?.getTime?.() || 0;
                    const timeB = b.timestamp?.getTime?.() || 0;
                    return timeB - timeA;
                });
        }

        return filtered.sort((a, b) => {
            const timeA = a.timestamp?.getTime?.() || 0;
            const timeB = b.timestamp?.getTime?.() || 0;
            return timeB - timeA;
        });
    }

    /**
     * Calculates market metrics from a set of listings
     */
    calculateMetrics(listings: UnifiedListing[]): MarketMetrics | null {
        if (listings.length === 0) return null;

        const prices = listings
            .map(l => l.price)
            .filter(p => p > 0)
            .sort((a, b) => a - b);

        if (prices.length === 0) return null;

        const min = prices[0];
        const max = prices[prices.length - 1];
        const avg = prices.reduce((a, b) => a + b, 0) / prices.length;

        return {
            min: Math.round(min),
            max: Math.round(max),
            avg: Math.round(avg),
            currency: listings[0].currency,
            count: listings.length,
            lastUpdated: new Date()
        };
    }
}

export const marketIntelligence = new MarketIntelligenceService();
