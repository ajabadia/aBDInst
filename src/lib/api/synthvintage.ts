
import * as cheerio from 'cheerio';

export interface VintageSynthSpecs {
    name: string;
    description: string;
    specs: { label: string; value: string }[];
    imageUrl?: string;
    sourceUrl: string;
}

export class SynthVintageScraper {
    private baseUrl = 'https://www.vintagesynth.com';

    /**
     * Search for a synthesizer on Vintage Synth Explorer
     * Note: Since they don't have a public search API, we can either use a lucky-google search 
     * or try to guess the slug / use their directory if possible.
     * For now, we'll implement a basic search-to-spec flow.
     */
    async findSpecs(brand: string, model: string): Promise<VintageSynthSpecs | null> {
        const query = `${brand} ${model}`.toLowerCase().replace(/[^a-z0-9]+/g, '+');
        const searchUrl = `${this.baseUrl}/search/node/${query}`;

        try {
            const response = await fetch(searchUrl, {
                headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36' }
            });

            if (!response.ok) return null;
            const html = await response.text();
            const $ = cheerio.load(html);

            // Find the first result link
            const firstResult = $('ol.search-results li h3.title a').first().attr('href');
            if (!firstResult) return null;

            return await this.scrapePage(firstResult);
        } catch (error) {
            console.error('SynthVintage Scraping Error:', error);
            return null;
        }
    }

    async scrapePage(url: string): Promise<VintageSynthSpecs | null> {
        try {
            const response = await fetch(url, {
                headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36' }
            });

            if (!response.ok) return null;
            const html = await response.text();
            const $ = cheerio.load(html);

            const name = $('h1.page-title').text().trim();
            const description = $('.field-name-body').text().trim();
            const imageUrl = $('.field-name-field-image img').attr('src');

            const specs: { label: string; value: string }[] = [];

            // Vintage Synth often uses a standard table or div structure for specs
            $('.field-name-field-specifications .field-item').each((_, el) => {
                const text = $(el).text();
                // Format is usually label: value
                const parts = text.split(':');
                if (parts.length >= 2) {
                    specs.push({
                        label: parts[0].trim(),
                        value: parts.slice(1).join(':').trim()
                    });
                }
            });

            return {
                name,
                description,
                specs,
                imageUrl: imageUrl ? (imageUrl.startsWith('http') ? imageUrl : `${this.baseUrl}${imageUrl}`) : undefined,
                sourceUrl: url
            };
        } catch (error) {
            console.error('SynthVintage Detail Scraping Error:', error);
            return null;
        }
    }
}

export const synthVintageScraper = new SynthVintageScraper();
