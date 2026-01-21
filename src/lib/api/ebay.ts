
export interface EbayListing {
    source: 'ebay';
    id: string;
    title: string;
    price: { amount: number; currency: string };
    condition: string;
    url: string;
    imageUrl?: string;
    timestamp: Date;
}

export class EbayApiService {
    private appToken: string;
    private baseUrl = 'https://api.ebay.com/buy/browse/v1';

    constructor() {
        this.appToken = process.env.EBAY_ACCESS_TOKEN || '';
    }

    private async fetch(endpoint: string, params: Record<string, string> = {}) {
        if (!this.appToken) {
            console.warn('⚠️ [EbayApiService] Missing EBAY_ACCESS_TOKEN in .env.local. eBay listings will be skipped.');
            return null;
        }

        const queryParams = new URLSearchParams(params);
        const url = `${this.baseUrl}${endpoint}?${queryParams}`;

        try {
            const response = await fetch(url, {
                headers: {
                    'Authorization': `Bearer ${this.appToken}`,
                    'Content-Language': 'en-US',
                    'Accept': 'application/json'
                }
            });

            if (!response.ok) {
                const error = await response.text();
                throw new Error(`eBay API error: ${response.status} - ${error}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Error fetching from eBay API:', error);
            return null;
        }
    }

    async searchListings(query: string): Promise<EbayListing[]> {
        const data = await this.fetch('/item_summary/search', { q: query });

        if (data && data.itemSummaries) {
            return data.itemSummaries.map((item: any) => ({
                source: 'ebay',
                id: item.itemId,
                title: item.title,
                price: {
                    amount: parseFloat(item.price.value),
                    currency: item.price.currency
                },
                condition: this.mapCondition(item.condition),
                url: item.itemWebUrl,
                imageUrl: item.image?.imageUrl,
                timestamp: new Date()
            }));
        }

        return [];
    }

    private mapCondition(ebayCondition: string): string {
        const conditionMap: Record<string, string> = {
            'NEW': 'mint',
            'LIKE_NEW': 'excellent',
            'GOOD': 'good',
            'ACCEPTABLE': 'fair',
            'VERY_GOOD': 'excellent'
        };
        return conditionMap[ebayCondition] || 'good';
    }
}

export const ebayService = new EbayApiService();
