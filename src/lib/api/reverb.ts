import { ScrapedItem } from '@/lib/scrapers/types';

const REVERB_API_BASE = 'https://api.reverb.com/api';

export interface ReverbListing {
    id: string;
    make: string;
    model: string;
    title: string;
    price: {
        amount: string;
        currency: string;
    };
    condition: {
        display_name: string;
    };
    photos: Array<{
        _links: {
            large_crop: { href: string };
            thumbnail: { href: string };
        };
    }>;
    _links: {
        web: { href: string };
        product?: { href: string };
    };
    published_at: string;
    description?: string;
    product_specifications?: Array<{
        display_name: string;
        value: string;
    }>;
    attributes?: Record<string, any>;
}

export interface ReverbPriceGuide {
    id: string;
    make: string;
    model: string;
    title: string;
    estimated_value: {
        bottom_price: string;
        top_price: string;
        price_currency: string;
    };
    _links: {
        web: { href: string };
        photo: { href: string };
    };
}

export class ReverbApiService {
    private token: string;

    constructor() {
        this.token = process.env.REVERB_API_TOKEN || '';
    }

    private async fetch(endpoint: string, params: Record<string, string> = {}) {
        if (!this.token) {
            console.warn('⚠️ [ReverbApiService] Missing REVERB_API_TOKEN in .env.local. Market data and price guide will be skipped.');
            return null;
        }

        const url = new URL(`${REVERB_API_BASE}${endpoint}`);
        Object.keys(params).forEach(key => url.searchParams.append(key, params[key]));

        try {
            const res = await fetch(url.toString(), {
                headers: {
                    'Authorization': `Bearer ${this.token}`,
                    'Accept-Version': '3.0',
                    'Content-Type': 'application/hal+json'
                },
                next: { revalidate: 3600 } // Cache for 1 hour
            });

            if (!res.ok) {
                if (res.status === 401) console.error('❌ Reverb API Token Invalid');
                if (res.status === 429) console.error('❌ Reverb API Rate Limit Exceeded');
                return null;
            }

            return await res.json();
        } catch (error) {
            console.error('Reverb API Fetch Error:', error);
            return null;
        }
    }

    /**
     * Search for live listings on Reverb
     */
    async searchListings(query: string): Promise<ScrapedItem[]> {
        const data = await this.fetch('/listings', {
            query,
            state: 'listed',
            per_page: '10',
            sort: 'price|asc'
        });

        if (!data || !data.listings) return [];

        return data.listings.map((item: ReverbListing) => ({
            id: item.id,
            title: item.title,
            price: parseFloat(item.price.amount),
            currency: item.price.currency,
            url: item._links.web.href,
            imageUrl: item.photos?.[0]?._links?.large_crop?.href || '',
            source: 'reverb',
            date: new Date(item.published_at),
            condition: item.condition?.display_name,
            location: 'Reverb'
        }));
    }

    /**
     * Get the estimated price range from Reverb Price Guide
     */
    async getPriceGuide(query: string) {
        const data = await this.fetch('/priceguide', { query });

        if (!data || !data.price_guides || data.price_guides.length === 0) return null;

        const guide = data.price_guides[0]; // Best match

        return {
            id: guide.id,
            title: guide.title,
            min: parseFloat(guide.estimated_value?.bottom_price || '0'),
            max: parseFloat(guide.estimated_value?.top_price || '0'),
            currency: guide.estimated_value?.price_currency || 'USD',
            url: guide._links?.web?.href
        };
    }

    async getListingById(id: string): Promise<ReverbListing | null> {
        return await this.fetch(`/listings/${id}`);
    }

    /**
     * Fetch any Reverb API resource by its full URL or partial path
     */
    async getByUrl(url: string) {
        const path = url.includes(REVERB_API_BASE) ? url.split(REVERB_API_BASE)[1] : url;
        return await this.fetch(path);
    }

    /**
     * Search Reverb's product database for deep metadata
     */
    async getProductData(query: string) {
        // We use the results from price guide to get a product slug or ID if possible,
        // but Reverb doesn't always expose a direct "Product spec" API to public without specific scopes.
        // However, we can use the /listings/all/products endpoint if available or search results.
        const data = await this.fetch('/listings/all/products', { query, per_page: '1' });

        if (!data || !data.products || data.products.length === 0) {
            // Fallback: Search listings and extract common data
            const listings = await this.searchListings(query);
            if (listings && listings.length > 0) {
                const bestListing = listings[0];
                return {
                    brand: query.split(' ')[0],
                    model: query.split(' ').slice(1).join(' '),
                    description: bestListing.title, // Use title as a mini-description fallback
                    productionYears: '',
                    imageUrl: bestListing.imageUrl,
                    specs: [] as any[]
                };
            }
            return null;
        }

        const product = data.products[0];

        return {
            brand: product.make,
            model: product.model,
            description: product.description,
            productionYears: product.production_years,
            imageUrl: product._links?.photo?.href,
            specs: product.specs || []
        };
    }
}

export const reverbService = new ReverbApiService();
