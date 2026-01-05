import { PriceSource, ScrapedItem } from './types';
import * as cheerio from 'cheerio';
import { parseFormattedPrice } from '../utils';

export class EbayScraper implements PriceSource {
    name = 'ebay';
    isEnabled = true;
    private baseUrl = 'https://www.ebay.es';

    async search(query: string): Promise<ScrapedItem[]> {
        try {
            const { getSystemConfig } = await import('@/actions/admin');
            const proxyUrl = await getSystemConfig('scraper_proxy_url');

            const fetchOptions: any = {
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36',
                    'Accept-Language': 'es-ES,es;q=0.9',
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
            const searchUrl = `${this.baseUrl}/sch/i.html?_nkw=${encodedQuery}&_sacat=0&_ipg=60`;

            const response = await fetch(searchUrl, fetchOptions);
            if (!response.ok) return [];

            const html = await response.text();
            const $ = cheerio.load(html);
            const items: ScrapedItem[] = [];

            $('.s-item__wrapper').each((_, el) => {
                const $el = $(el);
                const title = $el.find('.s-item__title').text().trim();
                if (!title || title.includes('Shop on eBay')) return;

                const link = $el.find('.s-item__link').attr('href') || '';
                const priceText = $el.find('.s-item__price').first().text().trim();
                const img = $el.find('.s-item__image-img').attr('src');

                if (title && priceText && link) {
                    const { value, currency } = parseFormattedPrice(priceText);
                    items.push({
                        id: link.match(/\/(\d+)\?/) ? link.match(/\/(\d+)\?/)![1] : Math.random().toString(),
                        title: title.replace(/^New Listing/i, '').trim(),
                        price: value,
                        currency,
                        url: link,
                        imageUrl: img,
                        source: 'ebay',
                        date: new Date()
                    });
                }
            });

            return items;
        } catch (error) {
            console.error("eBay scraper error:", error);
            return [];
        }
    }
}
