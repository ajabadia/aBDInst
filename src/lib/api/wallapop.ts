
export interface WallapopListing {
    source: 'wallapop';
    id: string;
    title: string;
    price: { amount: number; currency: string };
    imageUrl?: string;
    url: string;
    location?: string;
    timestamp: Date;
}

export class WallapopApiService {
    private baseUrl = 'https://api.wallapop.com/api/v3/general/search';

    async searchListings(query: string): Promise<WallapopListing[]> {
        const params = new URLSearchParams({
            keywords: query,
            category_ids: '12900', // Music & Instruments usually
            order_by: 'most_relevance'
        });

        const url = `${this.baseUrl}?${params}`;

        try {
            // Note: Wallapop internal API might require specific headers or signatures 
            // but for simple public search it sometimes works or needs a legacy mobile UA.
            const response = await fetch(url, {
                headers: {
                    'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0 Mobile/15E148 Safari/604.1',
                    'Accept': 'application/json'
                }
            });

            if (!response.ok) {
                // If this fails, we gracefully return empty as it's an unofficial integration
                return [];
            }

            const data = await response.json();

            if (data && data.search_objects) {
                return data.search_objects.map((item: any) => ({
                    source: 'wallapop',
                    id: item.id,
                    title: item.title,
                    price: { amount: item.price, currency: item.currency },
                    imageUrl: item.images?.[0]?.original,
                    url: `https://es.wallapop.com/item/${item.web_slug}`,
                    location: item.location?.city,
                    timestamp: new Date()
                }));
            }

            return [];
        } catch (error) {
            console.error('Error fetching from Wallapop API:', error);
            return [];
        }
    }
}

export const wallapopService = new WallapopApiService();
