import { PriceSource, ScrapedItem } from './types';
import * as cheerio from 'cheerio';

export class EbayScraper implements PriceSource {
    name = 'ebay';
    isEnabled = true;
    private baseUrl = 'https://www.ebay.es';

    async search(query: string): Promise<ScrapedItem[]> {
        try {
            // Lazy load config for Proxy
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
                    console.error('Failed to setup proxy agent for eBay', e);
                }
            }

            const encodedQuery = encodeURIComponent(query);
            // _nkw = query, _sacat = 0 (all categories), _ipg = 60 (items per page)
            const searchUrl = `${this.baseUrl}/sch/i.html?_nkw=${encodedQuery}&_sacat=0&_ipg=60`;

            const response = await fetch(searchUrl, fetchOptions);

            if (!response.ok) {
                console.error(`eBay scraper failed: ${response.status}`);
                return [];
            }

            const html = await response.text();
            const $ = cheerio.load(html);
            const items: ScrapedItem[] = [];

            // eBay Selectors
            // Items are usually in div.s-item__wrapper
            $('.s-item__wrapper').each((_, el) => {
                const $el = $(el);

                const title = $el.find('.s-item__title').text().trim();
                if (title === 'Shop on eBay') return; // Skip ad/header

                const link = $el.find('.s-item__link').attr('href') || '';

                // Price text often contains range "EUR 20.00 to EUR 30.00", we take the first one or simple one
                const priceText = $el.find('.s-item__price').first().text().trim();

                const img = $el.find('.s-item__image-img').attr('src');

                // Filter out obviously bad results or ads if title is missing
                if (title && priceText && link && !title.includes('Shop on eBay')) {
                    // Check for "Sold" or unrelated items if possible, but basic scraping just grabs list
                    // eBay often lists "New Listing" text in title span, need to be careful? 
                    // Usually .text() concatenates, "New ListingFender Strat..." -> clean it?
                    // For now simple text extraction.

                    if (!items.find(i => i.url === link)) {
                        items.push(this.parseItem(title, priceText, link, img));
                    }
                }
            });

            return items;

        } catch (error) {
            console.error("eBay search error:", error);
            return [];
        }
    }

    private parseItem(title: string, priceText: string, link: string, img?: string): ScrapedItem {
        // Clean price: "EUR 1.234,56" or "$1,234.56"
        // Remove "EUR", "USD" etc.
        // Identify currency? For now assume EUR or simple parse float.

        let numericPrice = 0;
        let currency = 'EUR';

        // Simplify parsing: remove non-numeric except . and ,
        // If comma is decimal separator (EUR style): 1.200,50 -> 1200.50
        // If dot is decimal (USD): 1,200.50 -> 1200.50

        // Quick heuristic: look for currency symbol
        if (priceText.includes('$')) currency = 'USD';
        if (priceText.includes('£')) currency = 'GBP';

        // eBay ES usually uses "1.200,00 EUR"
        // Remove known text
        const cleanPrice = priceText.replace(/[A-Za-z]/g, '').trim();

        // Heuristic for Spanish format (dots for thousands, comma for decimals)
        // If it looks like 1.234,56
        if (cleanPrice.match(/\d{1,3}(\.\d{3})*,\d{2}/)) {
            numericPrice = parseFloat(cleanPrice.replace(/\./g, '').replace(',', '.'));
        } else {
            // Fallback standard 1,234.56 or 1234.56
            numericPrice = parseFloat(cleanPrice.replace(/,/g, ''));
        }

        // Generate ID
        const matchId = link.match(/\/(\d+)\?/);
        let id = matchId ? matchId[1] : '';
        if (!id) {
            const urlParts = link.split('/');
            const lastPart = urlParts[urlParts.length - 1];
            id = lastPart ? lastPart.split('?')[0] : Math.random().toString(36).substr(2, 9);
        }

        return {
            id,
            title: title.replace(/^New Listing/i, '').trim(), // Clean common prefix
            price: numericPrice || 0,
            currency,
            url: link,
            imageUrl: img,
            source: 'ebay',
            date: new Date()
        };
    }
}
