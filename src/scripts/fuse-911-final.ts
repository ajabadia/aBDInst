
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import Instrument from '../models/Instrument';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

async function fuse() {
    try {
        await mongoose.connect(process.env.MONGODB_URI!);
        console.log('Connected.');

        // 1. Find all matches
        const all = await Instrument.find({
            brand: 'Behringer',
            model: { $regex: /911/i }
        }).sort({ createdAt: 1 }); // Oldest first

        console.log(`Found ${all.length} candidates.`);

        if (all.length < 2) {
            console.log('No duplicates found.');
            return;
        }

        // 2. Identify Target (Oldest)
        const target = all[0];
        console.log(`Target (Oldest): ${target._id} - ${target.model} (Specs: ${target.specs?.length})`);

        // 3. Identify Source (Has most specs)
        // Sort remaining by spec count desc
        const others = all.slice(1);
        others.sort((a, b) => (b.specs?.length || 0) - (a.specs?.length || 0));

        const source = others[0];
        console.log(`Source (Best Data): ${source._id} - ${source.model} (Specs: ${source.specs?.length})`);

        // 4. Migrate Data
        if ((source.specs?.length || 0) > (target.specs?.length || 0)) {
            console.log('Migrating specs...');
            target.specs = source.specs;
            target.description = source.description;
            target.model = '911 Envelope Generator'; // Standardize name
            target.subtype = source.subtype;
            target.genericImages = source.genericImages; // specific to this case

            await target.save();
            console.log('Target updated.');
        } else {
            console.log('Target already has equal/better data. Just updating name.');
            target.model = '911 Envelope Generator';
            await target.save();
        }

        // 5. Cleanup
        const toDelete = others.map(d => d._id);
        console.log(`Deleting ${toDelete.length} duplicates...`);
        await Instrument.deleteMany({ _id: { $in: toDelete } });
        console.log('Cleanup complete.');

    } catch (error) {
        console.error(error);
    } finally {
        await mongoose.disconnect();
    }
}

fuse();
