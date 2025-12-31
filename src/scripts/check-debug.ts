
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import Instrument from '../models/Instrument';

dotenv.config({ path: '.env.local' });

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) { console.error('No URI'); process.exit(1); }

async function check() {
    try {
        await mongoose.connect(MONGODB_URI as string);
        console.log('Connected.');

        const pro800 = await Instrument.findOne({ model: 'PRO-800' });
        console.log('PRO-800 exists?', !!pro800);

        const pro1 = await Instrument.findOne({ model: 'PRO-1' });
        console.log('PRO-1 exists?', !!pro1);

    } catch (e) {
        console.error(e);
    } finally {
        await mongoose.disconnect();
    }
}
check();
