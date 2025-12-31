
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import Instrument from '../models/Instrument';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

async function list911() {
    try {
        await mongoose.connect(process.env.MONGODB_URI!);
        console.log('Connected to DB');

        const instruments = await Instrument.find({
            brand: 'Behringer',
            model: { $regex: /911/i }
        }).select('brand model _id createdAt specs updatedAt');

        console.log(`Found ${instruments.length} '911' instruments:`);
        instruments.forEach(inst => {
            console.log(`--- [${inst._id}] ---`);
            console.log(`Model: ${inst.model}`);
            console.log(`Created: ${inst.createdAt}`);
            console.log(`Updated: ${inst.updatedAt}`);
            console.log(`Specs count: ${inst.specs?.length || 0}`);
        });

    } catch (error) {
        console.error(error);
    } finally {
        await mongoose.disconnect();
    }
}

list911();
