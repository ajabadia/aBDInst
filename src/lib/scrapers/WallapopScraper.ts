import { PriceSource, ScrapedItem } from './types';
import * as cheerio from 'cheerio';
import { parseFormattedPrice } from '../utils';

export class WallapopScraper implements PriceSource {
    name = 'wallapop';
    isEnabled = true;
    private baseUrl = 'https://es.wallapop.com';

    async search(query: string): Promise<ScrapedItem[]> {
        try {
            const { getSystemConfig } = await import('@/actions/admin');
            const proxyUrl = await getSystemConfig('scraper_proxy_url');

            const fetchOptions: any = {
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36',
                    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
                    'Accept-Language': 'es-ES,es;q=0.9',
                    'Referer': 'https://es.wallapop.com/',
                },
                next: { revalidate: 3600 }
            };

            if (proxyUrl) {
                const { HttpsProxyAgent } = await import('https-proxy-agent');
                const agent = new HttpsProxyAgent(proxyUrl);
                fetchOptions.agent = agent;
                fetchOptions.dispatcher = agent;
            }

            const encodedQuery = encodeURIComponent(query);
            const searchUrl = `${this.baseUrl}/app/search?keywords=${encodedQuery}&latitude=40.4167&longitude=-3.7037`;

            const response = await fetch(searchUrl, fetchOptions);
            if (!response.ok) return [];

            const html = await response.text();
            const $ = cheerio.load(html);
            const items: ScrapedItem[] = [];

            // Technique 1: Data Extraction from JSON (The most stable)
            const nextData = $('#__NEXT_DATA__').html();
            if (nextData) {
                try {
                    const parsed = JSON.parse(nextData);
                    // Path to search results in Wallapop's Next.js state
                    const searchItems = parsed.props?.pageProps?.searchData?.items || [];
                    
                    for (const item of searchItems) {
                        items.push({
                            id: item.id,
                            title: item.title,
                            price: item.price?.amount || 0,
                            currency: item.price?.currency || 'EUR',
                            url: `${this.baseUrl}/item/${item.webSlug}`,
                            imageUrl: item.images?.[0]?.original,
                            source: 'wallapop',
                            date: new Date()
                        });
                    }
                } catch (e) {
                    console.warn("Failed to parse Wallapop NEXT_DATA", e);
                }
            }

            // Technique 2: DOM Fallback (if JSON fails or changes)
            if (items.length === 0) {
                $('a[href*="/item/"]').each((_, el) => {
                    const $el = $(el);
                    const title = $el.find('h3, [class*="title"]').first().text().trim();
                    const priceText = $el.find('[class*="price"]').first().text().trim();
                    let link = $el.attr('href') || '';
                    if (link && !link.startsWith('http')) link = this.baseUrl + link;

                    if (title && priceText && link) {
                        const { value, currency } = parseFormattedPrice(priceText);
                        items.push({
                            id: link.split('-').pop() || Math.random().toString(),
                            title,
                            price: value,
                            currency,
                            url: link,
                            imageUrl: $el.find('img').attr('src'),
                            source: 'wallapop',
                            date: new Date()
                        });
                    }
                });
            }

            return items;
        } catch (error) {
            console.error("Wallapop scraper error:", error);
            return [];
        }
    }
}
