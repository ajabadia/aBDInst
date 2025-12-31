
import mongoose from 'mongoose';
import Instrument from '../models/Instrument.js'; // Note .js extension for direct node execution if type module
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

const abacusData = {
    brand: 'Behringer',
    model: 'ABACUS',
    type: 'Eurorack Module',
    subtype: 'Function Generator / CV Processor',
    description: 'Analog music computer type Maths/Buchla 257+281. Dual function generator and quad CV processor with logical outputs.',
    genericImages: [], // Placeholder
    specs: [
        // Physical
        { category: 'Physical', label: 'Width', value: '20 HP' },
        { category: 'Physical', label: 'Depth', value: '24 mm' },

        // Power
        { category: 'Power', label: '+12V Draw', value: '60 mA' },
        { category: 'Power', label: '-12V Draw', value: '50 mA' },
        { category: 'Power', label: '+5V Draw', value: '0 mA' },

        // Architecture
        { category: 'Architecture', label: 'Channels', value: '4 (2 Function Gens, 2 Utility)' },
        { category: 'Architecture', label: 'Function Generators', value: 'Ch 1 & 4 (Rise, Fall, Response)' },
        { category: 'Architecture', label: 'Attenuverters', value: 'Ch 2 & 3 (with Offset)' },

        // Features
        { category: 'Features', label: 'Response Curves', value: 'Logarithmic - Linear - Exponential' },
        { category: 'Features', label: 'Modes', value: 'AD (Envelope), Loop (LFO), Slew Limiter' },
        { category: 'Features', label: 'Logic Outputs', value: 'SUM, INVERTED SUM, OR (Max), EOR, EOC' },

        // Performance
        { category: 'Performance', label: 'Cycle Time', value: 'Up to 25 minutes' },
        { category: 'Performance', label: 'Max Frequency', value: 'Approx. 1 kHz' },

        // I/O Standards
        { category: 'Connectors', label: 'Signal Inputs', value: '±10V (33kΩ / 75kΩ)' },
        { category: 'Connectors', label: 'Trigger Inputs', value: '> 2.5V (100kΩ)' },
        { category: 'Connectors', label: 'CV Modulation', value: '±8V (Rise/Fall/Both)' },
        { category: 'Connectors', label: 'Outputs', value: '±10V (680Ω)' },
        { category: 'Connectors', label: 'Logic Outputs', value: 'Gate (EOR/EOC) 2.2kΩ' }
    ]
};

async function seedAbacus() {
    try {
        console.log('🔌 Connecting to MongoDB...');
        await mongoose.connect(MONGODB_URI as string);
        console.log('✅ Connected.');

        // Check if exists to avoid duplicates
        const existing = await Instrument.findOne({ brand: 'Behringer', model: 'ABACUS' });
        if (existing) {
            console.log('⚠️ Behringer ABACUS already exists. Updating specs...');
            existing.specs = abacusData.specs;
            existing.description = abacusData.description;
            existing.subtype = abacusData.subtype;
            await existing.save();
            console.log('✅ Updated existing record.');
        } else {
            console.log('🆕 Creating new record for Behringer ABACUS...');
            await Instrument.create(abacusData);
            console.log('✅ Created successfully.');
        }

        console.log('🎉 Done!');
        process.exit(0);

    } catch (error) {
        console.error('❌ Seeding failed:', error);
        process.exit(1);
    }
}

seedAbacus();
