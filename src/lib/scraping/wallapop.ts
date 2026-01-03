
import * as cheerio from 'cheerio';

interface ScrapedItem {
    title: string;
    price: number;
    currency: string;
    url: string;
    imageUrl: string;
    source: 'wallapop';
}

export class WallapopScraper {
    private baseUrl = 'https://es.wallapop.com';

    async search(query: string): Promise<ScrapedItem[]> {
        const encodedQuery = encodeURIComponent(query);
        // Wallapop's public search URL
        const url = `${this.baseUrl}/app/search?keywords=${encodedQuery}&filters_source=search_box`;

        try {
            const response = await fetch(url, {
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
                    'Accept-Language': 'es-ES,es;q=0.8,en;q=0.6'
                }
            });

            if (!response.ok) {
                console.error(`Wallapop Search Failed: ${response.status}`);
                return [];
            }

            const html = await response.text();
            const $ = cheerio.load(html);
            const items: ScrapedItem[] = [];

            // Selectors (Updating based on typical Wallapop classnames - highly volatile)
            // Wallapop uses 'ItemCard' compatible structures or 'a.ItemCardList__item'
            // NOTE: Wallapop might be fully Client-Side Rendered (CSR). If so, cheerio won't find items in initial HTML.
            // Let's assume we might find JSON in a <script> tag if HTML fails.

            // Attempt 1: Standard Selectors
            $('a.ItemCardList__item').each((_, el) => {
                const link = $(el).attr('href') || '';
                const title = $(el).find('.ItemCard__title').text().trim();
                const priceText = $(el).find('.ItemCard__price').text().trim(); // "120 €"
                const img = $(el).find('img.ItemCard__image').attr('src') || '';

                if (title && priceText) {
                    items.push({
                        title,
                        price: this.parsePrice(priceText),
                        currency: 'EUR',
                        url: link.startsWith('http') ? link : `${this.baseUrl}${link}`,
                        imageUrl: img,
                        source: 'wallapop'
                    });
                }
            });

            return items;

        } catch (error) {
            console.error("Wallapop Scraper Error:", error);
            return [];
        }
    }

    private parsePrice(priceStr: string): number {
        return parseFloat(priceStr.replace(/[^0-9,.]/g, '').replace(',', '.'));
    }
}
