
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

const td3Data = {
    brand: 'Behringer',
    model: 'TD-3-AM',
    type: 'Synthesizer',
    subtype: 'Analog Bass Line',
    version: 'Modded Out (Amber)',
    description: 'Versión "Modded Out" (MO) color ámbar del clásico clon TB-303. Incluye modificaciones estilo "Devil Fish" como sub-oscilador, FM de filtro, overdrive analógico, slide extendido y mayor control CV.',
    years: ['2021', '2022', '2023', '2024'], // Approximate years for the MO version
    genericImages: [], // Placeholder
    specs: [
        // BASIC
        { category: 'Información Básica', label: 'Formato', value: 'Desktop / Tabletop' },
        { category: 'Información Básica', label: 'Tipo de Síntesis', value: 'Analógica (VCO-VCF-VCA)' },

        // ARCH_VOICE
        { category: 'Arquitectura y Voces', label: 'Número de Voces (Polifonía)', value: 'Monofónico (1 Voz)' },
        { category: 'Arquitectura y Voces', label: 'Arquitectura', value: 'Analógico Puro' },
        { category: 'Arquitectura y Voces', label: 'Poly Chain', value: 'Sí (hasta 16 unidades)' },

        // OSC
        { category: 'Sección de Osciladores', label: 'Osciladores por Voz', value: '1 VCO + 1 Sub-Oscilador' },
        { category: 'Sección de Osciladores', label: 'Formas de Onda', value: 'Sawtooth, Square (con selector)' },
        { category: 'Sección de Osciladores', label: 'Sub-Oscilador', value: 'Sí (Off / Mid / Hi)' },

        // FILTER_AMP
        { category: 'Filtros y Amplificador', label: 'Tipo de Filtro', value: '4-Pole Resonant Low-Pass (24dB/oct)' },
        { category: 'Filtros y Amplificador', label: 'Modificaciones Filtro', value: 'Filter FM, Control MIDI CC' },
        { category: 'Filtros y Amplificador', label: 'Overdrive / Muffler', value: 'Sí, Analógico (Knob dedicado)' },
        { category: 'Filtros y Amplificador', label: 'Envoltura', value: 'AD (Attack/Decay) modificable' },

        // ENV_MOD
        { category: 'Envolturas y Modulación', label: 'Accent', value: 'Avanzado (3 velocidades de sweep)' },
        { category: 'Envolturas y Modulación', label: 'Slide', value: 'Extendido (hasta 6x más largo)' },
        { category: 'Envolturas y Modulación', label: 'Soft Attack', value: 'Sí (ajustable)' },

        // CONTROLS
        { category: 'Controles y Rendimiento', label: 'Secuenciador', value: '16 Pasos' },
        { category: 'Controles y Rendimiento', label: 'Patrones', value: '250 de Usuario (7 Tracks)' },
        { category: 'Controles y Rendimiento', label: 'Parámetros por Paso', value: 'Pitch, Gate, Accent, Slide, Sub, OD, Filter FM' },

        // EFFECTS_CONN
        { category: 'Efectos y Conectividad', label: 'Salidas de Audio', value: 'Line Out (1/4" TS), Phones (3.5mm)' },
        { category: 'Efectos y Conectividad', label: 'CV In', value: 'Filter FM, Filter CV, Slide In, Gate In, CV In' },
        { category: 'Efectos y Conectividad', label: 'CV Out', value: 'CV Out, Gate Out, Filter Out (FCV)' },
        { category: 'Efectos y Conectividad', label: 'MIDI', value: 'In, Out/Thru (DIN 5 pin)' },
        { category: 'Efectos y Conectividad', label: 'USB', value: 'USB 2.0 Type B (MIDI Class Compliant)' },

        // TECH_SPECS
        { category: 'Especificaciones Técnicas', label: 'Dimensiones', value: '56 x 305 x 165 mm' },
        { category: 'Especificaciones Técnicas', label: 'Alimentación', value: '9V DC (Adaptador incluido)' },
        { category: 'Especificaciones Técnicas', label: 'Color', value: 'Amber (Ámbar)' },
    ]
};

async function seedTD3() {
    try {
        console.log('🔌 Connecting to MongoDB...');
        await mongoose.connect(MONGODB_URI as string);
        console.log('✅ Connected.');

        // Check if exists
        const existing = await Instrument.findOne({ brand: 'Behringer', model: 'TD-3-AM' });
        if (existing) {
            console.log('⚠️ Behringer TD-3-AM already exists. Updating...');
            existing.specs = td3Data.specs;
            existing.description = td3Data.description;
            existing.version = td3Data.version;
            await existing.save();
            console.log('✅ Updated existing record.');
        } else {
            console.log('🆕 Creating new record for Behringer TD-3-AM...');
            await Instrument.create(td3Data);
            console.log('✅ Created successfully.');
        }

        console.log('🎉 Done!');
        process.exit(0);

    } catch (error) {
        console.error('❌ Seeding failed:', error);
        process.exit(1);
    }
}

seedTD3();
