import * as cheerio from 'cheerio';
import { parseFormattedPrice } from './scrapers/ReverbScraper';

export interface ScrapedMetadata {
    brand?: string;
    model?: string;
    type?: string;
    description?: string;
    year?: string;
    specs?: { category: string; label: string; value: string }[];
    images?: string[];
    price?: { value: number; currency: string };
    sourceUrl: string;
}

export async function extractFromUrl(url: string): Promise<ScrapedMetadata | null> {
    try {
        const response = await fetch(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36',
            },
            next: { revalidate: 3600 }
        });

        if (!response.ok) return null;
        const html = await response.text();
        const $ = cheerio.load(html);

        if (url.includes('reverb.com')) {
            return extractReverb($, url);
        } else if (url.includes('vintagesynth.com')) {
            return extractVintageSynth($, url);
        } else if (url.includes('wikipedia.org')) {
            return extractWikipedia($, url);
        } else if (url.includes('ebay')) {
            // Basic eBay fallback (might fail due to heavy antibot)
            return { sourceUrl: url, description: 'eBay link detected. Parsing limits apply.' };
        } else if (url.includes('wallapop')) {
            return { sourceUrl: url, description: 'Wallapop link detected.' };
        }

        return null;
    } catch (error) {
        console.error('Extraction error for ' + url, error);
        return null;
    }
}



function extractReverb($: cheerio.CheerioAPI, url: string): ScrapedMetadata {
    // Try multiple selectors for title
    const title = $('h1').first().text().trim() ||
        $('.listing-title').first().text().trim() ||
        $('[data-testid="product-title"]').text().trim();

    // Try multiple selectors for price
    const priceText = $('.price-display').first().text().trim() ||
        $('.listing-price').first().text().trim() ||
        $('[data-testid="display-price"]').first().text().trim();

    // Description
    const description = $('.listing-description').text().trim().slice(0, 1000) ||
        $('[data-testid="product-description"]').text().trim().slice(0, 1000) ||
        $('meta[name="description"]').attr('content') || '';

    const images: string[] = [];
    $('.gallery-image, .listing-image img, [data-testid="gallery-image"] img').each((_, el) => {
        const src = $(el).attr('src') || $(el).attr('data-src');
        if (src) images.push(src);
    });

    // Debug log to server console
    console.log(`[Reverb Scraper] URL: ${url}`);
    console.log(`[Reverb Scraper] Found - Title: "${title}", Price: "${priceText}", DescLen: ${description.length}, Images: ${images.length}`);

    // Heuristic for brand/model from title
    // If title is "Akai MPC500 Music Production Center", Brand=Akai, Model=MPC500...
    const parts = title.split(' ');
    const brand = parts[0] || 'Unknown';
    const model = parts.slice(1).join(' ') || 'Unknown';

    const price = priceText ? parseFormattedPrice(priceText) : undefined;

    return {
        brand,
        model,
        description,
        images: images.slice(0, 5),
        price,
        sourceUrl: url
    };
}

function extractVintageSynth($: cheerio.CheerioAPI, url: string): ScrapedMetadata {
    const title = $('h1').first().text().trim();
    const specs: { category: string; label: string; value: string }[] = [];

    // Vintage Synth typically has specs in a specific table or list
    $('.synth-specs .spec-row, .specs-table tr').each((_, el) => {
        const label = $(el).find('.spec-label, th').text().trim().replace(':', '');
        const value = $(el).find('.spec-value, td').text().trim();
        if (label && value) {
            specs.push({ category: 'Technical', label, value });
        }
    });

    const description = $('.synth-content, #main-content').text().trim().slice(0, 1500);

    return {
        model: title,
        specs,
        description,
        sourceUrl: url
    };
}

function extractWikipedia($: cheerio.CheerioAPI, url: string): ScrapedMetadata {
    const title = $('#firstHeading').text().trim();
    const specs: { category: string; label: string; value: string }[] = [];

    $('.infobox tr').each((_, el) => {
        const label = $(el).find('.infobox-label').text().trim();
        const value = $(el).find('.infobox-data').text().trim();
        if (label && value) {
            specs.push({ category: 'Wikipedia Info', label, value });
        }
    });

    return {
        model: title,
        specs,
        sourceUrl: url
    };
}
