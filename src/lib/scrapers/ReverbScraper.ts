import { PriceSource, ScrapedItem } from './types';
import * as cheerio from 'cheerio';

export class ReverbScraper implements PriceSource {
    name = 'reverb';
    isEnabled = true;
    private baseUrl = 'https://reverb.com';

    async search(query: string): Promise<ScrapedItem[]> {
        try {
            // Lazy load config to avoid import loops or perf hit
            const { getSystemConfig } = await import('@/actions/admin');
            const proxyUrl = await getSystemConfig('scraper_proxy_url');

            const userAgents = [
                'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36',
                'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
                'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:124.0) Gecko/20100101 Firefox/124.0'
            ];
            const randomUA = userAgents[Math.floor(Math.random() * userAgents.length)];

            let fetchOptions: any = {
                headers: {
                    'User-Agent': randomUA,
                    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
                    'Accept-Language': 'en-US,en;q=0.5',
                    'Accept-Encoding': 'gzip, deflate, br',
                    'DNT': '1',
                    'Connection': 'keep-alive',
                    'Upgrade-Insecure-Requests': '1',
                    'Sec-Fetch-Dest': 'document',
                    'Sec-Fetch-Mode': 'navigate',
                    'Sec-Fetch-Site': 'none',
                    'Sec-Fetch-User': '?1',
                    'Pragma': 'no-cache',
                    'Cache-Control': 'no-cache'
                },
                next: { revalidate: 0 }
            };

            if (proxyUrl) {
                console.log('Using Proxy:', proxyUrl.substring(0, 15) + '...');
                try {
                    const { HttpsProxyAgent } = await import('https-proxy-agent');
                    const agent = new HttpsProxyAgent(proxyUrl);
                    // @ts-ignore - node-fetch / older next generic support
                    fetchOptions.agent = agent;
                    // @ts-ignore - undici support (Node 18+)
                    fetchOptions.dispatcher = agent;
                } catch (e) {
                    console.error('Failed to setup proxy agent', e);
                }
            }

            const encodedQuery = encodeURIComponent(query);
            const searchUrl = `${this.baseUrl}/marketplace?query=${encodedQuery}&sort=price_with_sale%7Casc`;

            const response = await fetch(searchUrl, fetchOptions);

            if (!response.ok) {
                if (response.status === 403 || response.status === 401) {
                    console.error('Reverb 403 Blocked');
                    // We don't throw here to avoid crashing the whole alert process, but we log loud.
                    // Actually, throwing allows the UI to show the specific error.
                    throw new Error('Reverb bloqueó la conexión (403). Revisa tu Proxy.');
                }
                console.error(`Reverb scraper failed: ${response.status} ${response.statusText}`);
                return [];
            }

            const html = await response.text();
            const $ = cheerio.load(html);
            const items: ScrapedItem[] = [];

            // DOM Parsing Strategy - Tried and tested selectors
            // 1. Grid Tiles (Most common)
            $('.tiles.tiles--four-wide-max li, li.tiles__tile').each((_, el) => {
                const $el = $(el);
                const title = $el.find('h4, .grid-card__title').text().trim();
                const priceText = $el.find('.price-display, .grid-card__price').text().trim();
                let link = $el.find('a').attr('href');
                const img = $el.find('img').attr('src');

                if (link && !link.startsWith('http')) link = this.baseUrl + link;

                if (title && priceText && link) {
                    items.push(this.parseItem(title, priceText, link, img, 'Grid'));
                }
            });

            // 2. List layout fallback
            if (items.length === 0) {
                $('.r-listing-card').each((_, el) => {
                    const $el = $(el);
                    const title = $el.find('.r-listing-card__title').text().trim();
                    const priceText = $el.find('.r-listing-card__price').text().trim();
                    const link = $el.find('a').first().attr('href');
                    const img = $el.find('img').first().attr('src');

                    if (title && priceText && link) {
                        items.push(this.parseItem(title, priceText, link || '', img, 'List'));
                    }
                });
            }

            // 3. New 'div' based grid fallback (2024 structure)
            if (items.length === 0) {
                $('div[class*="grid-card"], div[class*="listing-card"]').each((_, el) => {
                    // Generic flexible search
                    const $el = $(el);
                    const title = $el.find('h4, a[class*="title"]').first().text().trim();
                    const priceText = $el.find('[class*="price"]').first().text().trim();
                    let link = $el.find('a').first().attr('href');

                    if (link && !link.startsWith('http')) link = this.baseUrl + link;

                    if (title && priceText && link && priceText.match(/\d/)) {
                        items.push(this.parseItem(title, priceText, link, undefined, 'Generic'));
                    }
                });
            }

            return items;

        } catch (error) {
            console.error('Reverb scrape error:', error);
            // Re-throw if it's our clear error
            if (error instanceof Error && error.message.includes('403')) throw error;
            return [];
        }
    }

    private parseItem(title: string, priceText: string, link: string, img: string | undefined, debugSource: string): ScrapedItem {
        const numericPrice = parseFloat(priceText.replace(/[^0-9,.]/g, '').replace(',', '.'));
        const currency = priceText.includes('€') ? 'EUR' : priceText.includes('$') ? 'USD' : 'GBP';

        return {
            id: link.split('/').pop()?.split('-')[0] || Math.random().toString(),
            title,
            price: numericPrice || 0,
            currency,
            url: link,
            imageUrl: img,
            source: 'reverb',
            date: new Date()
        };
    }
}
