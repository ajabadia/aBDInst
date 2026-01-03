import * as cheerio from 'cheerio';

async function main() {
    console.log('Testing Mercasonic (Hispasonic) Scraper...');
    const query = 'Yamaha DX7';
    // Mercasonic search URL
    const url = `https://www.hispasonic.com/anuncios/buscar?query=${encodeURIComponent(query)}`;

    console.log(`Fetching ${url}`);

    try {
        const response = await fetch(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
            }
        });

        if (!response.ok) {
            console.error(`Mercasonic failed: ${response.status}`);
            return;
        }

        const html = await response.text();
        console.log(`Received ${html.length} bytes of HTML`);

        const $ = cheerio.load(html);
        const items = $('.anuncios-listado li.anuncio');
        // Need to verify selectors. 
        // Hispasonic/Mercasonic uses .anuncios-listado > li.anuncio (or similar).

        console.log(`Found ${items.length} items.`);

        if (items.length > 0) {
            items.slice(0, 3).each((i, el) => {
                const $el = $(el);
                const title = $el.find('.tim').text().trim() || $el.find('h2').text().trim();
                const price = $el.find('.price').text().trim();
                console.log(`Item ${i + 1}: ${title} - ${price}`);
            });
        } else {
            // Debug: print some classes found
            console.log('Classes found in body:', $('body').attr('class'));
            // Check if it's main listing
            console.log('Listing container?', $('.anuncios-listado').length);
        }

    } catch (e) {
        console.error(e);
    }
}

main();
