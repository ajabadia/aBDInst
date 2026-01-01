
import mongoose from 'mongoose';
import Instrument from '../models/Instrument.js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Load environment variables
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../../.env.local') });

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
    console.error('❌ MONGODB_URI is not defined in .env.local');
    process.exit(1);
}

async function migrate() {
    try {
        console.log('🔌 Connecting to MongoDB...');
        await mongoose.connect(MONGODB_URI as string);
        console.log('✅ Connected.');

        // Update Eurorack Module
        const res1 = await Instrument.updateMany({ type: 'eurorack_module' }, { type: 'Eurorack Module' });
        console.log(`Updated ${res1.modifiedCount} eurorack modules.`);

        // Update Synthesizer
        const res2 = await Instrument.updateMany({ type: 'synthesizer' }, { type: 'Synthesizer' });
        console.log(`Updated ${res2.modifiedCount} synthesizers.`);

        // Update Drum Machine
        const res3 = await Instrument.updateMany({ type: 'drum_machine' }, { type: 'Drum Machine' });
        console.log(`Updated ${res3.modifiedCount} drum machines.`);

        // Update others if needed (guitar, etc)
        const res4 = await Instrument.updateMany({ type: 'guitar' }, { type: 'Guitar' });
        console.log(`Updated ${res4.modifiedCount} guitars.`);

        const res5 = await Instrument.updateMany({ type: 'modular' }, { type: 'Modular' });
        console.log(`Updated ${res5.modifiedCount} modulars.`);

        console.log('🎉 Migration complete!');
        process.exit(0);

    } catch (error) {
        console.error('❌ Migration failed:', error);
        process.exit(1);
    }
}

migrate();
