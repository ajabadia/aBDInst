import mongoose from 'mongoose';
import * as cheerio from 'cheerio';
import { HttpsProxyAgent } from 'https-proxy-agent';
import * as dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';

// Load env
dotenv.config({ path: path.resolve(process.cwd(), '.env') });
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

async function getSystemConfig(key: string) {
    if (!process.env.MONGODB_URI) return null;
    if (mongoose.connection.readyState === 0) {
        await mongoose.connect(process.env.MONGODB_URI);
    }
    const collection = mongoose.connection.collection('system_configs');
    const doc = await collection.findOne({ key });
    return doc ? doc.value : null;
}

async function main() {
    // Clear previous log
    fs.writeFileSync('debug_output.log', '');
    const log = (msg: string) => { console.log(msg); fs.appendFileSync('debug_output.log', msg + '\n'); };

    log('--- Reverb Scraper Debugger (Enhanced) ---');

    // 1. Get Proxy
    const proxyUrl = await getSystemConfig('scraper_proxy_url');
    log(`Proxy Configured: ${proxyUrl ? 'YES (' + proxyUrl + ')' : 'NO'}`);

    // 2. Setup Agent
    let agent: any = undefined;
    if (proxyUrl) {
        agent = new HttpsProxyAgent(proxyUrl);
    }

    const query = 'Roland TB-303';
    const url = `https://reverb.com/marketplace?query=${encodeURIComponent(query)}&sort=price_with_sale%7Casc`;

    log(`Fetching: ${url}`);

    try {
        const fetchOptions: any = {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
                'Accept-Language': 'en-US,en;q=0.5',
            }
        };

        if (agent) {
            fetchOptions.dispatcher = agent;
        }

        const start = Date.now();
        const res = await fetch(url, fetchOptions);
        const duration = Date.now() - start;

        log(`Response Status: ${res.status} ${res.statusText}`);
        log(`Duration: ${duration}ms`);

        const html = await res.text();
        log(`Content Length: ${html.length} chars`);

        // Save HTML for inspection
        fs.writeFileSync('debug_page.html', html);
        log('Saved HTML to debug_page.html');

        if (res.status === 403 || res.status === 401) {
            log('!!! BLOCKED (403/401) !!!');
            process.exit(1);
        }

        // 3. Parse
        const $ = cheerio.load(html);
        const title = $('title').text().trim();
        log(`Page Title: "${title}"`);

        // Check for specific blockers
        if (title.includes('Challenge') || title.includes('Cloudflare') || title.includes('Human')) {
            log('!!! CAPTCHA BLOCK DETECTED !!!');
            process.exit(1);
        }

        // 4. Test Selectors
        log('\n--- Testing Selectors ---');

        const selectors = [
            '.tiles.tiles--four-wide-max li',
            '.r-listing-card',
            'li.tiles__tile',
            'ul.grid-card-container > li',
            'div[class*="listing-card"]'
        ];

        let foundItems = 0;
        for (const sel of selectors) {
            const count = $(sel).length;
            log(`Selector "${sel}": ${count} matches`);
            if (count > 0) foundItems += count;
        }

        if (foundItems === 0) {
            log('\n!!! NO ITEMS FOUND - DUMPING CLASSES !!!');
            const classes = new Set();
            $('div, ul, li').each((_, el) => {
                const cls = $(el).attr('class');
                if (cls && (cls.includes('grid') || cls.includes('list') || cls.includes('card') || cls.includes('tile'))) {
                    classes.add(cls);
                }
            });
            log('Potential Container Classes found: ' + JSON.stringify(Array.from(classes).slice(0, 20)));
        } else {
            log('\n--- Sample Item Extraction ---');
            const $first = $('.tiles.tiles--four-wide-max li').first();
            if ($first.length) {
                log('Title: ' + $first.find('h4').text().trim());
                log('Price: ' + $first.find('.price-display').text().trim());
            }
        }

    } catch (e: any) {
        log('Fetch Error: ' + e.message);
        if (e.cause) log('Cause: ' + JSON.stringify(e.cause));
    }

    await mongoose.disconnect();
}

main();
