import fs from 'fs';
import path from 'path';

// Manually load environment variables
try {
    const envPath = path.resolve(process.cwd(), '.env.local');
    if (fs.existsSync(envPath)) {
        const envContent = fs.readFileSync(envPath, 'utf-8');
        envContent.split('\n').forEach(line => {
            const match = line.match(/^([^=]+)=(.*)$/);
            if (match) {
                const key = match[1].trim();
                const value = match[2].trim().replace(/^"(.*)"$/, '$1'); // Remove quotes if present
                process.env[key] = value;
            }
        });
        console.log("Env loaded manually.");
    }
} catch (e) {
    console.error("Error loading .env.local", e);
}

import dbConnect from "../lib/db";
import Instrument from "../models/Instrument";
import User from "../models/User";

async function seedProton() {
    try {
        await dbConnect();
        console.log("Creating/Updating Behringer Proton...");

        // Find a user to attribute creation to (admin)
        const admin = await User.findOne({ role: 'admin' });
        if (!admin) {
            console.error("Admin user not found. Run seed-admin.ts first.");
            process.exit(1);
        }

        const protonData = {
            type: 'Sintetizador',
            subtype: 'Semi-modular / Parafónico',
            brand: 'Behringer',
            model: 'PROTON',
            version: '1.0',
            years: ['2024'],
            description: 'Sintetizador parafónico semi-modular con 2 VCOs, 2 VCFs multimodo, wavefolder, y patchbay de 64 puntos formato Eurorack.',
            specs: {
                polyphony: 2,
                oscillators: 2,
                sequencer: false,
                midi: true,
                weight: 2.0,
                dimensions: '94 x 424 x 136 mm'
            },
            genericImages: ['https://thumbs.static-thomann.de/thumb//bdbmagic/pics/prod/596518.jpg'],
            createdBy: admin._id
        };

        // Upsert the instrument
        const result = await Instrument.findOneAndUpdate(
            { brand: 'Behringer', model: 'PROTON' },
            protonData,
            { upsert: true, new: true }
        );

        console.log(`Instrument processed: ${result.brand} ${result.model}`);

        process.exit(0);
    } catch (error) {
        console.error("Error seeding Proton:", error);
        process.exit(1);
    }
}

seedProton();
