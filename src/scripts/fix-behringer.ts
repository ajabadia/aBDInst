
import fs from 'fs';
import path from 'path';

async function main() {
    // 1. Load Environment Variables
    const envPath = path.resolve(process.cwd(), '.env.local');
    if (fs.existsSync(envPath)) {
        const envConfig = fs.readFileSync(envPath, 'utf8');
        envConfig.split('\n').forEach(line => {
            const [key, ...rest] = line.split('=');
            if (key && rest.length > 0) {
                let val = rest.join('=').trim();
                // Strip quotes
                if (val.startsWith('"') && val.endsWith('"')) val = val.slice(1, -1);
                if (val.startsWith("'") && val.endsWith("'")) val = val.slice(1, -1);
                process.env[key.trim()] = val;
            }
        });
    }

    // 2. Import dependencies
    const { default: dbConnect } = await import('@/lib/db');
    const { default: CatalogMetadata } = await import('@/models/CatalogMetadata');
    const { CloudinaryProvider } = await import('@/lib/storage-providers/cloudinary');

    await dbConnect();
    console.log('Connected to DB');

    // 3. Setup Cloudinary Provider (Fallback manual config since we are in script)
    const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
    const apiKey = process.env.CLOUDINARY_API_KEY;
    const apiSecret = process.env.CLOUDINARY_API_SECRET;

    if (!cloudName || !apiKey || !apiSecret) {
        throw new Error("Missing Cloudinary credentials in .env.local");
    }

    const provider = new CloudinaryProvider({ cloudName, apiKey, apiSecret });

    // 4. Upload SVG
    const svgPath = path.resolve(process.cwd(), 'behringer_icon.svg');
    if (!fs.existsSync(svgPath)) {
        throw new Error("behringer_icon.svg not found!");
    }

    // Read as buffer
    const buffer = fs.readFileSync(svgPath);

    // Mock user ID for folder structure (admin id or 'system')
    const userId = 'system';

    console.log('Uploading SVG...');
    // We pass custom path to match what the action does
    const url = await provider.upload(buffer, userId, 'instrument-collector/metadata');
    console.log('Uploaded URL:', url);

    // 5. Update Database
    const key = 'behringer';
    const result = await CatalogMetadata.findOneAndUpdate(
        { key },
        {
            $set: {
                assetUrl: url,
                label: 'Behringer' // Ensure label is set
            }
        },
        { new: true }
    );

    console.log('Database Updated:', result);
    process.exit(0);
}

main().catch(console.error);
