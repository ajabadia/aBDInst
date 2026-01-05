import { PriceSource, ScrapedItem } from './types';
import * as cheerio from 'cheerio';

export function parseFormattedPrice(priceText: string): { value: number; currency: string } {
    // 1. Identify currency
    let currency = 'USD';
    if (priceText.includes('€')) currency = 'EUR';
    else if (priceText.includes('£')) currency = 'GBP';

    // 2. Clean the string but keep dots and commas
    // "1.250,50 €" -> "1.250,50"
    // "$1,250.50" -> "1,250.50"
    let clean = priceText.replace(/[^\d,.]/g, '');

    if (!clean) return { value: 0, currency };

    // 3. Logic to handle thousands vs decimal separators
    // If there's both a dot and a comma:
    if (clean.includes('.') && clean.includes(',')) {
        const lastDot = clean.lastIndexOf('.');
        const lastComma = clean.lastIndexOf(',');
        
        if (lastDot > lastComma) {
            // Format: 1,250.50 (US/UK) -> remove comma, keep dot
            clean = clean.replace(/,/g, '');
        } else {
            // Format: 1.250,50 (EU) -> remove dot, replace comma with dot
            clean = clean.replace(/\./g, '').replace(',', '.');
        }
    } else if (clean.includes(',')) {
        // Only comma: could be 1,250 (US thousands) or 12,50 (EU decimals)
        // Heuristic: if comma is followed by exactly 2 digits, it's likely decimal. 
        // Otherwise, it's likely a thousands separator.
        const parts = clean.split(',');
        if (parts[parts.length - 1].length === 2) {
            clean = clean.replace(',', '.');
        } else {
            clean = clean.replace(',', '');
        }
    } else if (clean.includes('.')) {
        // Only dot: could be 1.250 (EU thousands) or 12.50 (US decimals)
        const parts = clean.split('.');
        if (parts[parts.length - 1].length !== 2) {
            // Likely thousands separator like "1.250"
            clean = clean.replace(/\./g, '');
        }
    }

    return { value: parseFloat(clean) || 0, currency };
}

export class ReverbScraper implements PriceSource {
    name = 'reverb';
    isEnabled = true;
    private baseUrl = 'https://reverb.com';

    async search(query: string): Promise<ScrapedItem[]> {
        try {
            const { getSystemConfig } = await import('@/actions/admin');
            const proxyUrl = await getSystemConfig('scraper_proxy_url');

            const userAgents = [
                'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36',
                'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36'
            ];
            const randomUA = userAgents[Math.floor(Math.random() * userAgents.length)];

            let fetchOptions: any = {
                headers: {
                    'User-Agent': randomUA,
                    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
                    'Accept-Language': 'en-US,en;q=0.5',
                    'Cache-Control': 'no-cache'
                },
                next: { revalidate: 3600 } // Cache for 1 hour to avoid spamming
            };

            if (proxyUrl) {
                try {
                    const { HttpsProxyAgent } = await import('https-proxy-agent');
                    const agent = new HttpsProxyAgent(proxyUrl);
                    fetchOptions.agent = agent;
                    fetchOptions.dispatcher = agent;
                } catch (e) {
                    console.error('Proxy setup error', e);
                }
            }

            const encodedQuery = encodeURIComponent(query);
            const searchUrl = `${this.baseUrl}/marketplace?query=${encodedQuery}&sort=price_with_sale%7Casc`;

            const response = await fetch(searchUrl, fetchOptions);

            if (!response.ok) {
                if (response.status === 403) throw new Error('Reverb 403 Blocked');
                return [];
            }

            const html = await response.text();
            const $ = cheerio.load(html);
            const items: ScrapedItem[] = [];

            // Targeted extraction
            $('.tiles.tiles--four-wide-max li, li.tiles__tile, .grid-card').each((_, el) => {
                const $el = $(el);
                const title = $el.find('h4, .grid-card__title, [class*="title"]').first().text().trim();
                const priceText = $el.find('.price-display, .grid-card__price, [class*="price"]').first().text().trim();
                let link = $el.find('a').attr('href');
                const img = $el.find('img').attr('src');

                if (link && !link.startsWith('http')) link = this.baseUrl + link;

                if (title && priceText && link && priceText.match(/\d/)) {
                    const { value, currency } = parseFormattedPrice(priceText);
                    items.push({
                        id: link.split('/').pop()?.split('-')[0] || Math.random().toString(),
                        title,
                        price: value,
                        currency,
                        url: link,
                        imageUrl: img,
                        source: 'reverb',
                        date: new Date()
                    });
                }
            });

            return items;

        } catch (error) {
            console.error('Reverb Scraper Error:', error);
            return [];
        }
    }
}
