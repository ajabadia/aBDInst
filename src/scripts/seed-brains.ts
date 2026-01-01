
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

const brainsData = {
    brand: 'Behringer',
    model: 'BRAINS',
    type: 'Eurorack Module',
    subtype: 'Multi-Engine Digital Oscillator',
    description: 'Multi-engine digital oscillator based on Mutable Plaits. Features 20 synthesis engines (10 synth, 10 percussion/noise) and an integrated OLED oscilloscope.',
    genericImages: [], // Placeholder
    specs: [
        // Physical -> Especificaciones Técnicas
        { category: 'Especificaciones Técnicas', label: 'Ancho HP', value: '16 HP' },
        { category: 'Especificaciones Técnicas', label: 'Profundidad (mm)', value: '45 mm' }, /* Saving max depth as requested */

        // Power -> Especificaciones Técnicas
        { category: 'Especificaciones Técnicas', label: 'Consumo +12V', value: '130 mA' },
        { category: 'Especificaciones Técnicas', label: 'Consumo -12V', value: '10 mA' },
        { category: 'Especificaciones Técnicas', label: 'Consumo +5V', value: '0 mA' },

        // System -> Arquitectura y Voces
        { category: 'Arquitectura y Voces', label: 'Resolución', value: '16-bit / 96 kHz' },
        { category: 'Arquitectura y Voces', label: 'Procesamiento Digital', value: '32-bit floating point' },
        { category: 'Arquitectura y Voces', label: 'Pantalla', value: 'OLED Oscilloscope' },

        // Architecture -> Arquitectura y Voces
        { category: 'Arquitectura y Voces', label: 'Motores de Síntesis', value: '20 Total (10 Synth, 10 Percussion)' },
        { category: 'Arquitectura y Voces', label: 'Bancos', value: '2 (A/B)' },
        { category: 'Arquitectura y Voces', label: 'Motores Synth', value: 'VA, Waveshaper, FM, Grains, Additive, Chords, Speech, Karplus, Hypersaw, Wavetable' },
        { category: 'Arquitectura y Voces', label: 'Motores Percusión', value: 'Rain, Noise, Dust, Modal, FM Drum, Bass, Snare, Hi-Hat, Cowbell, Toms' },

        // Controls -> Controles y Rendimiento
        { category: 'Controles y Rendimiento', label: 'Parámetros Macro', value: 'Timbre, Harmonics, Morph, Frequency' },
        { category: 'Controles y Rendimiento', label: 'Nivel / VCA', value: 'Internal Low-pass Gate / VCA' },

        // I/O -> Efectos y Conectividad
        { category: 'Efectos y Conectividad', label: 'Entradas', value: 'V/Oct, FM, Timbre, Harmonics, Model, Trig, Level' },
        { category: 'Efectos y Conectividad', label: 'Salidas', value: 'Out 1 (Main), Out 2 (Aux)' },
        { category: 'Efectos y Conectividad', label: 'Nivel Salida', value: 'Max ~6.2 Vpp' },
        { category: 'Efectos y Conectividad', label: 'USB', value: 'USB-B 2.0 (Firmware Update)' }
    ]
};

async function seedBrains() {
    try {
        console.log('🔌 Connecting to MongoDB...');
        await mongoose.connect(MONGODB_URI as string);
        console.log('✅ Connected.');

        // Check if exists to avoid duplicates
        const existing = await Instrument.findOne({ brand: 'Behringer', model: 'BRAINS' });
        if (existing) {
            console.log('⚠️ Behringer BRAINS already exists. Updating specs with correct Spanish categories...');
            existing.specs = brainsData.specs;
            // Also ensure other fields are up to date just in case
            existing.description = brainsData.description;
            existing.subtype = brainsData.subtype;
            await existing.save();
            console.log('✅ Updated existing record.');
        } else {
            console.log('🆕 Creating new record for Behringer BRAINS...');
            await Instrument.create(brainsData);
            console.log('✅ Created successfully.');
        }

        console.log('🎉 Done!');
        process.exit(0);

    } catch (error) {
        console.error('❌ Seeding failed:', error);
        process.exit(1);
    }
}

seedBrains();
