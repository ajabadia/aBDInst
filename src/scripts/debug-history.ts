import fs from 'fs';
import path from 'path';

async function main() {
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
    const { default: SystemConfig } = await import('@/models/SystemConfig');

    await dbConnect();
    console.log('Connected to DB');

    const configs = await SystemConfig.find({});
    console.log('Found configs:', configs.length);

    for (const config of configs) {
        console.log(`Key: ${config.key}`);
        console.log(`Value: ${JSON.stringify(config.value).substring(0, 50)}...`);
        console.log(`History Length: ${config.history?.length || 0}`);
        if (config.history && config.history.length > 0) {
            console.log('Latest History Entry:', JSON.stringify(config.history[config.history.length - 1], null, 2));
        }
        console.log('-------------------');
    }

    process.exit(0);
}

main().catch(console.error);
