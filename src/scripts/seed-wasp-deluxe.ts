
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

const waspData = {
    brand: 'Behringer',
    model: 'WASP DELUXE',
    type: 'Synthesizer',
    subtype: 'Analog/Digital Hybrid',
    version: 'Deluxe',
    description: 'Sintetizador analógico duofónico basado en el diseño clásico "Wasp Deluxe". Cuenta con osciladores digitales duales, filtro VCF analógico multimodo único y capacidades de modulación flexibles en un formato desktop compatible con Eurorack (o con teclado de 37 teclas según configuración).',
    years: ['2020', '2021', '2022', '2023'],
    genericImages: [], // Placeholder
    specs: [
        // BASIC
        { category: 'Información Básica', label: 'Formato', value: 'Desktop / Teclado 37 Teclas' },
        { category: 'Información Básica', label: 'Tipo de Síntesis', value: 'Híbrida (DCO Digital / VCF Analógico)' },

        // ARCH_VOICE
        { category: 'Arquitectura y Voces', label: 'Polifonía', value: 'Duofónico (2 notas) / Monofónico' },
        { category: 'Arquitectura y Voces', label: 'Modos de Voz', value: 'Mono, Duophonic' },
        { category: 'Arquitectura y Voces', label: 'Poly Chain', value: 'Sí (hasta 16 unidades)' },

        // OSC
        { category: 'Sección de Osciladores', label: 'Osciladores', value: '2 DCOs (OSC 1 & OSC 2)' },
        { category: 'Sección de Osciladores', label: 'Formas de Onda', value: 'Sawtooth, Square, Enhanced Tone (Buzz)' },
        { category: 'Sección de Osciladores', label: 'Ruido', value: 'Sí (Noise Generator)' },
        { category: 'Sección de Osciladores', label: 'Ajuste', value: 'Pitch Coarse, Detune OSC 2' },

        // FILTER_AMP
        { category: 'Filtros y Amplificador', label: 'Tipo de Filtro', value: 'Multimodo Wasp (LP/BP/HP/Notch) 12dB/oct' },
        { category: 'Filtros y Amplificador', label: 'Resonancia', value: 'Q variable con carácter agresivo' },
        { category: 'Filtros y Amplificador', label: 'Modulación Filtro', value: 'Env Mod, LFO Mod, Kbd Track' },

        // ENV_MOD
        { category: 'Envolturas y Modulación', label: 'Envolturas', value: '2 x ADS (VCF, VCA) estilo Wasp' },
        { category: 'Envolturas y Modulación', label: 'LFO', value: '1 (Sine, Square, Saw/Reverse, Random)' },
        { category: 'Envolturas y Modulación', label: 'Matriz Modulación', value: 'Switching simple (LFO->Pitch/VCF)' },

        // CONTROLS
        { category: 'Controles y Rendimiento', label: 'Teclado', value: '37 Teclas (Sensible a Velocidad)' },
        { category: 'Controles y Rendimiento', label: 'Arpegiador', value: 'Sí (con Sync MIDI)' },
        { category: 'Controles y Rendimiento', label: 'Control MIDI', value: 'Note On/Off, Glide' },

        // EFFECTS_CONN
        { category: 'Efectos y Conectividad', label: 'Salidas Audio', value: 'Main Out (1/4" TS), Phones (1/4" TRS)' },
        { category: 'Efectos y Conectividad', label: 'Audio In', value: 'Ext Audio Input' },
        { category: 'Efectos y Conectividad', label: 'MIDI', value: 'In/Out/Thru (DIN 5 pin), USB' },
        { category: 'Efectos y Conectividad', label: 'USB', value: 'USB 2.0 (MIDI Class Compliant)' },

        // TECH_SPECS
        { category: 'Especificaciones Técnicas', label: 'Eurorack', value: 'Compatible (80 HP aprox - orejas no incl)' },
        { category: 'Especificaciones Técnicas', label: 'Alimentación', value: '12V DC Adapter' },
    ]
};

async function seedWasp() {
    try {
        console.log('🔌 Connecting to MongoDB...');
        await mongoose.connect(MONGODB_URI as string);
        console.log('✅ Connected.');

        // Check if exists
        const existing = await Instrument.findOne({ brand: 'Behringer', model: 'WASP DELUXE' });
        if (existing) {
            console.log('⚠️ Behringer WASP DELUXE already exists. Updating...');
            existing.specs = waspData.specs;
            existing.description = waspData.description;
            existing.subtype = waspData.subtype;
            await existing.save();
            console.log('✅ Updated existing record.');
        } else {
            console.log('🆕 Creating new record for Behringer WASP DELUXE...');
            await Instrument.create(waspData);
            console.log('✅ Created successfully.');
        }

        console.log('🎉 Done!');
        process.exit(0);

    } catch (error) {
        console.error('❌ Seeding failed:', error);
        process.exit(1);
    }
}

seedWasp();
