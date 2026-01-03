
import { PriceSource, ScrapedItem } from './types';
import * as cheerio from 'cheerio';

export class WallapopScraper implements PriceSource {
    name = 'wallapop';
    isEnabled = true;
    private baseUrl = 'https://es.wallapop.com';

    async search(query: string): Promise<ScrapedItem[]> {
        try {
            // Lazy load config
            const { getSystemConfig } = await import('@/actions/admin');
            const proxyUrl = await getSystemConfig('scraper_proxy_url');

            const userAgents = [
                'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36',
                'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
            ];
            const randomUA = userAgents[Math.floor(Math.random() * userAgents.length)];

            let fetchOptions: any = {
                headers: {
                    'User-Agent': randomUA,
                    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
                    'Accept-Language': 'es-ES,es;q=0.8,en;q=0.6',
                    'Referer': 'https://es.wallapop.com/',
                },
                next: { revalidate: 0 }
            };

            if (proxyUrl) {
                try {
                    const { HttpsProxyAgent } = await import('https-proxy-agent');
                    const agent = new HttpsProxyAgent(proxyUrl);
                    fetchOptions.agent = agent;
                    fetchOptions.dispatcher = agent;
                } catch (e) {
                    console.error('Failed to setup proxy agent for Wallapop', e);
                }
            }

            const encodedQuery = encodeURIComponent(query);
            // Using the /app/search endpoint which returns HTML
            const searchUrl = `${this.baseUrl}/app/search?keywords=${encodedQuery}&filters_source=search_box&latitude=40.416775&longitude=-3.703790`; // Defaulting to Madrid center for location context if needed by their backend

            const response = await fetch(searchUrl, fetchOptions);

            if (!response.ok) {
                console.error(`Wallapop scraper failed: ${response.status}`);
                return [];
            }

            const html = await response.text();
            const $ = cheerio.load(html);
            const items: ScrapedItem[] = [];

            // Wallapop Selectors (These change frequently)
            // Strategy 1: Look for 'ItemCard' links
            $('a[href*="/item/"]').each((_, el) => {
                const $el = $(el);

                // Extract clean URL
                let link = $el.attr('href') || '';
                if (link && !link.startsWith('http')) link = this.baseUrl + link;

                // Title
                const title = $el.find('h3, .ItemCard__title').text().trim() || $el.attr('title') || '';

                // Price
                const priceText = $el.find('.ItemCard__price, [class*="price"]').text().trim();

                // Image
                const img = $el.find('img').attr('src') || $el.find('img').attr('data-src');

                if (title && priceText && link) {
                    // avoid duplicates within page if multiple links point to same item
                    if (!items.find(i => i.url === link)) {
                        items.push(this.parseItem(title, priceText, link, img || undefined));
                    }
                }
            });

            return items;

        } catch (error) {
            console.error("Wallapop search error:", error);
            return [];
        }
    }

    private parseItem(title: string, priceText: string, link: string, img?: string): ScrapedItem {
        const numericPrice = parseFloat(priceText.replace(/[^0-9,.]/g, '').replace(',', '.'));

        // Extract ID from URL (usually ends with -<id>)
        const matchId = link.match(/-(\d+)$/);
        const id = matchId ? matchId[1] : Math.random().toString(36).substr(2, 9);

        return {
            id,
            title,
            price: numericPrice || 0,
            currency: 'EUR',
            url: link,
            imageUrl: img,
            source: 'wallapop',
            date: new Date()
        };
    }
}
