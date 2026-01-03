import { ReverbScraper } from '../lib/scrapers/ReverbScraper';

async function main() {
    console.log('Testing Reverb Scraper...');
    const scraper = new ReverbScraper();
    const query = 'Yamaha DX7';
    console.log(`Searching for: ${query}`);

    try {
        const results = await scraper.search(query);
        console.log(`Found ${results.length} results.`);
        if (results.length > 0) {
            console.log('Sample Result:', results[0]);
        } else {
            console.log('No results found. Selectors might be outdated.');
        }
    } catch (error) {
        console.error('Error running scraper:', error);
    }
}

main();
