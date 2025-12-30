
import fs from 'fs';
import path from 'path';
import mongoose from 'mongoose';

// Manual env loading
const envPath = 'd:\\desarrollos\\aBDInst\\instrument-collector\\.env.local';
console.log(`Loading env from: ${envPath}`);

try {
    if (fs.existsSync(envPath)) {
        const envContent = fs.readFileSync(envPath, 'utf-8');
        envContent.split('\n').forEach(line => {
            const match = line.match(/^([^=]+)=(.*)$/);
            if (match) {
                process.env[match[1].trim()] = match[2].trim().replace(/^"(.*)"$/, '$1');
            }
        });
    } else {
        console.log("File not found");
    }
} catch (e) {
    console.error("Error reading env", e);
}

const MONGODB_URI = process.env.MONGODB_URI;

async function check() {
    if (!MONGODB_URI) {
        console.log("No MongoDB URI found in env");
        return;
    }
    try {
        console.log("Connecting to DB...");
        await mongoose.connect(MONGODB_URI);
        console.log("Connected. Searching...");
        const instrument = await mongoose.connection.db?.collection('instruments').findOne({ brand: 'Behringer', model: 'PROTON' });
        console.log(instrument ? 'FOUND_PROTON' : 'NOT_FOUND_PROTON');
        await mongoose.disconnect();
    } catch (e) {
        console.error("DB Error:", e);
    }
}
check();
