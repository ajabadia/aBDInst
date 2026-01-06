
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
                if (val.startsWith('"') && val.endsWith('"')) val = val.slice(1, -1);
                if (val.startsWith("'") && val.endsWith("'")) val = val.slice(1, -1);
                process.env[key.trim()] = val;
            }
        });
    }

    const { default: dbConnect } = await import('@/lib/db');
    const { default: CatalogMetadata } = await import('@/models/CatalogMetadata');

    await dbConnect();
    console.log('Connected to DB');

    const meta = await CatalogMetadata.findOne({ key: 'novation' });
    console.log('Novation Metadata:', meta);

    process.exit(0);
}

main().catch(console.error);
