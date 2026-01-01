
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

const rd6 = {
    brand: 'Behringer',
    model: 'RD-6-RD',
    type: 'Drum Machine',
    subtype: 'Analog',
    version: 'Red',
    description: 'Caja de ritmos analógica tipo TR‑606, con 8 voces de percusión, secuenciador de 16 pasos y distorsión analógica integrada.',
    specs: [
        // Información Básica
        { category: 'Información Básica', label: 'Formato', value: 'Desktop' },
        { category: 'Información Básica', label: 'Dimensiones', value: '56 × 305 × 165 mm' },
        { category: 'Información Básica', label: 'Peso', value: '0.9 kg' },
        { category: 'Información Básica', label: 'Alimentación', value: 'Adaptador DC externo (incluido)' },

        // Motor de Sonido (Using 'Arquitectura y Voces' or custom category? Sticking to constants)
        { category: 'Información Básica', label: 'Síntesis', value: 'Analógica' },
        { category: 'Arquitectura y Voces', label: 'Polifonía', value: '8 voces' },
        { category: 'Arquitectura y Voces', label: 'Voces', value: '8 (BD, SD, LT, HT, CY, CP, CH, OH)' },

        // Efectos
        { category: 'Efectos y Conectividad', label: 'Efectos', value: 'Distorsión Analógica (Tone, Level)' },

        // Secuenciador
        { category: 'Controles y Rendimiento', label: 'Secuenciador', value: '16 pasos' },
        { category: 'Controles y Rendimiento', label: 'Patrones', value: '32 patrones (250 compases max)' },

        // Conectividad
        { category: 'Efectos y Conectividad', label: 'Salidas Audio', value: 'Mix (1/4"), Phones, 6 x Individual (3.5mm)' },
        { category: 'Efectos y Conectividad', label: 'Trigger Outs', value: '2 x (LT, HT) (+15V)' },
        { category: 'Efectos y Conectividad', label: 'MIDI/USB', value: 'MIDI In/Out, USB-MIDI' },
        { category: 'Efectos y Conectividad', label: 'Sincronía', value: 'Internal, MIDI, USB, Clock (DIN Sync compatible)' },
    ]
};

async function seedRD6() {
    try {
        console.log('🔌 Connecting to MongoDB...');
        await mongoose.connect(MONGODB_URI as string);
        console.log('✅ Connected.');

        const existing = await Instrument.findOne({ brand: rd6.brand, model: rd6.model });
        if (existing) {
            console.log(`⚠️ Updating ${rd6.model}...`);
            existing.specs = rd6.specs;
            existing.description = rd6.description;
            existing.type = rd6.type;
            existing.subtype = rd6.subtype;
            existing.version = rd6.version; // Ensure version is updated
            await existing.save();
            console.log(`✅ Updated ${rd6.model}.`);
        } else {
            console.log(`🆕 Creating ${rd6.model}...`);
            await Instrument.create(rd6);
            console.log(`✅ Created ${rd6.model}.`);
        }

        console.log('🎉 Done!');
        process.exit(0);

    } catch (error) {
        console.error('❌ Seeding failed:', error);
        process.exit(1);
    }
}

seedRD6();
