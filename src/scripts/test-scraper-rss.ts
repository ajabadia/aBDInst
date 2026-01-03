import * as cheerio from 'cheerio';

async function main() {
    console.log('Testing Reverb RSS...');
    const query = 'Yamaha DX7';
    // Reverb Atom/RSS feed URL pattern
    const url = `https://reverb.com/rss/listings?query=${encodeURIComponent(query)}`;

    console.log(`Fetching ${url}`);

    try {
        const response = await fetch(url, {
            headers: {
                'User-Agent': 'InstrumentCollector/1.0',
                'Accept': 'application/atom+xml,application/xml,text/xml'
            }
        });

        if (!response.ok) {
            console.error(`RSS failed: ${response.status}`);
            return;
        }

        const xml = await response.text();
        console.log(`Received ${xml.length} bytes of XML`);

        // Parse XML with Cheerio
        const $ = cheerio.load(xml, { xmlMode: true });
        const items = $('entry'); // Atom feed uses <entry>
        console.log(`Found ${items.length} entries via RSS.`);

        if (items.length > 0) {
            const first = items.first();
            console.log('First Item Title:', first.find('title').text());
            console.log('First Item Price:', first.find('price').text()); // Check if price tag exists
            // Reverb RSS often puts price in <summary> or <content>
            console.log('First Item Summary preview:', first.find('summary').text().substring(0, 100));
        }

    } catch (e) {
        console.error(e);
    }
}

main();
