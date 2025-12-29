const path = require('path');
const fs = require('fs');

console.log('Current Directory:', process.cwd());

try {
    const envPath = path.join(process.cwd(), '.env.local');
    if (fs.existsSync(envPath)) {
        console.log('.env.local exists.');
        const content = fs.readFileSync(envPath, 'utf8');
        console.log('--- .env.local content (censored) ---');
        content.split('\n').forEach(line => {
            if (line.trim().startsWith('#')) return;
            const [key, ...val] = line.split('=');
            if (key) {
                console.log(`${key}=${val ? '******' : '(empty)'}`);
            }
        });
        console.log('-------------------------------------');
    } else {
        console.error('.env.local DOES NOT EXIST.');
    }
} catch (e) {
    console.error('Error reading .env.local:', e);
}

// Load env using next/dotenv equivalent or just simple dotenv for testing
require('dotenv').config({ path: '.env.local' });

console.log('process.env.MONGODB_URI:', process.env.MONGODB_URI);
if (!process.env.MONGODB_URI) {
    console.error('ERROR: MONGODB_URI is undefined!');
} else {
    console.log('MONGODB_URI appears to be set.');
}
