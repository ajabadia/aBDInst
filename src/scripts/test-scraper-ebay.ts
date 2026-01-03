import * as cheerio from 'cheerio';

async function main() {
    console.log('Testing eBay Scraper...');
    const query = 'Yamaha DX7';
    // eBay Spain search URL
    const url = `https://www.ebay.es/sch/i.html?_nkw=${encodeURIComponent(query)}&_sacat=0&_ipg=60`;

    console.log(`Fetching ${url}`);

    try {
        const response = await fetch(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                'Accept-Language': 'es-ES'
            }
        });

        if (!response.ok) {
            console.error(`eBay failed: ${response.status}`);
            return;
        }

        const html = await response.text();
        console.log(`Received ${html.length} bytes of HTML`);

        const $ = cheerio.load(html);
        const items = $('.s-item');

        console.log(`Found ${items.length} items.`);

        if (items.length > 0) {
            let found = 0;
            items.each((i, el) => {
                if (found >= 3) return;
                const $el = $(el);
                const title = $el.find('.s-item__title').text().trim();
                if (title === 'Shop on eBay') return; // Skip "Shop on eBay" hidden item

                const price = $el.find('.s-item__price').text().trim();
                const link = $el.find('.s-item__link').attr('href');

                console.log(`Item: ${title} - ${price}`);
                found++;
            });
        }

    } catch (e) {
        console.error(e);
    }
}

main();
