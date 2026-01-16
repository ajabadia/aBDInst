import { MongoClient } from 'mongodb';
import * as dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(process.cwd(), '.env.local') });

async function checkLegacyData() {
    const uri = process.env.MONGODB_URI;
    if (!uri) throw new Error('MONGODB_URI not found');

    const client = new MongoClient(uri);
    try {
        await client.connect();
        const db = client.db();

        const count = await db.collection('instruments').countDocuments({
            $or: [
                { condition: { $exists: true } },
                { location: { $exists: true } }
            ]
        });

        console.log(`Units with legacy physical data in 'instruments' collection: ${count}`);

        if (count > 0) {
            const sample = await db.collection('instruments').findOne({
                $or: [
                    { condition: { $exists: true } },
                    { location: { $exists: true } }
                ]
            });
            console.log('Sample legacy unit:', JSON.stringify(sample, null, 2));
        }

    } finally {
        await client.close();
    }
}

checkLegacyData().catch(console.error);
