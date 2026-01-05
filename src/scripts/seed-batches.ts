
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

const instruments = [
    {
        brand: 'Behringer',
        model: 'PRO-1',
        type: 'Synthesizer',
        subtype: 'Analog Desktop',
        version: 'Standard',
        description: 'Clon auténtico del clásico Sequential Circuits Pro-One. Sintetizador analógico monofónico con osciladores duales 3340, filtro de 4 polos y una amplia matriz de modulación.',
        specs: [
            { category: 'Información Básica', label: 'Formato', value: 'Desktop / Eurorack (80HP)' },
            { category: 'Información Básica', label: 'Síntesis', value: 'Analógica (VCO 3340)' },
            { category: 'Arquitectura y Voces', label: 'Polifonía', value: 'Monofónico / Polichain (16 voces)' },
            { category: 'Arquitectura y Voces', label: 'Parafónico', value: 'Sí' },
            { category: 'Sección de Osciladores', label: 'Osciladores', value: '2 VCOs (3340 Chip)' },
            { category: 'Sección de Osciladores', label: 'Formas de Onda', value: 'Sawtooth, Pulse/Square' },
            { category: 'Filtros y Amplificador', label: 'Filtro', value: 'Low-Pass 24dB/oct (4-Pole)' },
            { category: 'Envolturas y Modulación', label: 'Envolturas', value: '2 x ADSR' },
            { category: 'Envolturas y Modulación', label: 'LFO', value: '1 (Triangle, Saw, Square)' },
            { category: 'Efectos y Conectividad', label: 'Patch Points', value: 'Gato para modulación' },
            { category: 'Efectos y Conectividad', label: 'MIDI/USB', value: 'MIDI In/Out/Thru, USB' }
        ]
    },
    {
        brand: 'Behringer',
        model: 'PRO-800',
        type: 'Synthesizer',
        subtype: 'Analog Polyphonic',
        version: 'Standard',
        description: 'Reproducción del clásico Prophet-600. Sintetizador polifónico analógico de 8 voces con 2 VCOs por voz, capacidad de almacenamiento de parches y control total MIDI.',
        specs: [
            { category: 'Información Básica', label: 'Formato', value: 'Desktop / Eurorack (80HP)' },
            { category: 'Información Básica', label: 'Síntesis', value: 'Analógica Polifónica' },
            { category: 'Arquitectura y Voces', label: 'Polifonía', value: '8 Voces' },
            { category: 'Sección de Osciladores', label: 'Osciladores', value: '2 VCOs por voz' },
            { category: 'Sección de Osciladores', label: 'Formas de Onda', value: 'Saw, Triangle, Pulse, Noise' },
            { category: 'Filtros y Amplificador', label: 'Filtro', value: 'Low-Pass 24dB/oct' },
            { category: 'Envolturas y Modulación', label: 'Envolturas', value: '2 x ADSR (Filter, Amp)' },
            { category: 'Envolturas y Modulación', label: 'LFO', value: '1 (routing flexible via Poly Poly Mod)' },
            { category: 'Controles y Rendimiento', label: 'Memorias', value: '400 Patches de Usuario' },
            { category: 'Efectos y Conectividad', label: 'MIDI/USB', value: 'MIDI In/Out/Thru, USB-MIDI' }
        ]
    },
    {
        brand: 'Behringer',
        model: 'Crave',
        type: 'Synthesizer',
        subtype: 'Semi-Modular Analog',
        version: 'Standard',
        description: 'Sintetizador semi-modular analógico que combina el oscilador del Prophet-5 con el filtro ladder de Moog. Ideal como punto de entrada al mundo modular.',
        specs: [
            { category: 'Información Básica', label: 'Formato', value: 'Desktop Semi-Modular' },
            { category: 'Información Básica', label: 'Síntesis', value: 'Analógica (3340 VCO)' },
            { category: 'Arquitectura y Voces', label: 'Polifonía', value: 'Monofónico / Polichain' },
            { category: 'Sección de Osciladores', label: 'Osciladores', value: '1 VCO (Saw, Pulse)' },
            { category: 'Filtros y Amplificador', label: 'Filtro', value: 'Ladder LP/HP 24dB/oct' },
            { category: 'Envolturas y Modulación', label: 'Envolturas', value: '1 x ADS (Decay/Release conmutable)' },
            { category: 'Envolturas y Modulación', label: 'LFO', value: '1 (Triangle, Square)' },
            { category: 'Efectos y Conectividad', label: 'Patchbay', value: '18 puntos de parcheo' },
            { category: 'Controles y Rendimiento', label: 'Secuenciador', value: '32 Pasos con Arpegiador' }
        ]
    },
    {
        brand: 'Behringer',
        model: 'Neutron',
        type: 'Synthesizer',
        subtype: 'Semi-Modular Analog',
        version: 'Red / Standard',
        description: 'Potente sintetizador semi-modular parafónico con dos osciladores 3340, filtro multimodo, overdrive, delay BBD y un extenso patchbay de 56 puntos.',
        specs: [
            { category: 'Información Básica', label: 'Formato', value: 'Desktop / Eurorack (80HP)' },
            { category: 'Información Básica', label: 'Síntesis', value: 'Analógica Parafónica' },
            { category: 'Arquitectura y Voces', label: 'Polifonía', value: 'Parafónico (2 voces)' },
            { category: 'Sección de Osciladores', label: 'Osciladores', value: '2 VCOs (3340) con Morphing' },
            { category: 'Filtros y Amplificador', label: 'Filtro', value: 'Multimodo 12dB (Moffatt)' },
            { category: 'Envolturas y Modulación', label: 'Envolturas', value: '2 x ADSR' },
            { category: 'Envolturas y Modulación', label: 'LFO', value: '1 con 5 formas de onda' },
            { category: 'Efectos y Conectividad', label: 'Efectos', value: 'Overdrive, BBD Delay' },
            { category: 'Efectos y Conectividad', label: 'Patchbay', value: '56 puntos (Semi-Modular)' }
        ]
    },
    {
        brand: 'Behringer',
        model: 'Proton',
        type: 'Synthesizer',
        subtype: 'Semi-Modular Analog',
        version: 'Standard',
        description: 'Sintetizador semi-modular estilo "West Coast" con osciladores complejos, wavefolding, filtros duales multimodo y envolturas looping.',
        specs: [
            { category: 'Información Básica', label: 'Formato', value: 'Desktop / Eurorack (80HP)' },
            { category: 'Información Básica', label: 'Síntesis', value: 'Analógica (Wavefolding)' },
            { category: 'Arquitectura y Voces', label: 'Polifonía', value: 'Parafónico' },
            { category: 'Sección de Osciladores', label: 'Osciladores', value: '2 VCOs complejos' },
            { category: 'Sección de Osciladores', label: 'Formas de Onda', value: 'Saw, Pulse, Tri, Sine, Folded' },
            { category: 'Filtros y Amplificador', label: 'Filtro', value: 'Dual 12dB Multimode (serie/paralelo)' },
            { category: 'Envolturas y Modulación', label: 'Envolturas', value: '2 x ADSR + 2 x Looping ASR' },
            { category: 'Envolturas y Modulación', label: 'LFO', value: '2 LFOs' },
            { category: 'Efectos y Conectividad', label: 'Patchbay', value: '64 puntos (Modular profundo)' }
        ]
    },
    {
        brand: 'Behringer',
        model: 'DeepMind 12D',
        type: 'Synthesizer',
        subtype: 'Analog Polyphonic',
        version: 'Desktop',
        description: 'Versión de escritorio del DeepMind 12. Monstruo analógico de 12 voces con 4 motores de efectos TC Electronic/Klark Teknik y matriz de modulación profunda.',
        specs: [
            { category: 'Información Básica', label: 'Formato', value: 'Desktop / Rackmountable' },
            { category: 'Información Básica', label: 'Síntesis', value: 'Analógica Polifónica' },
            { category: 'Arquitectura y Voces', label: 'Polifonía', value: '12 Voces' },
            { category: 'Sección de Osciladores', label: 'Osciladores', value: '2 DCOs por voz' },
            { category: 'Filtros y Amplificador', label: 'Filtro', value: 'LP 12/24dB + HP Global' },
            { category: 'Envolturas y Modulación', label: 'Envolturas', value: '3 Envelopes (VCA, VCF, Mod)' },
            { category: 'Envolturas y Modulación', label: 'LFO', value: '2 LFOs por voz' },
            { category: 'Envolturas y Modulación', label: 'Matriz Mod', value: '8 Bus Mod Matrix' },
            { category: 'Efectos y Conectividad', label: 'Efectos', value: '4 Motores FX Digitales' },
            { category: 'Efectos y Conectividad', label: 'WiFi', value: 'Control remoto vía App' }
        ]
    },
    {
        brand: 'Behringer',
        model: 'ABACUS',
        type: 'Eurorack Module',
        subtype: 'Math Processor',
        version: 'Standard',
        description: 'Procesador matemático analógico (clon de Make Noise Maths) para generar funciones complejas, LFOs, envolturas y procesamiento de señales CV.',
        specs: [
            { category: 'Información Básica', label: 'Formato', value: 'Eurorack (20HP)' },
            { category: 'Información Básica', label: 'Función', value: 'Generador de Funciones / Procesador CV' },
            { category: 'Arquitectura y Voces', label: 'Voces', value: '0 (Módulo de Utilidad)' },
            { category: 'Sección de Osciladores', label: 'Osciladores', value: 'Auto-oscilación (capaz de audio)' },
            { category: 'Controles y Rendimiento', label: 'Funciones', value: 'Rise, Fall, Log/Exp response' },
            { category: 'Controles y Rendimiento', label: 'Lógica', value: 'SUM, OR, INV, EOR, EOC' },
            { category: 'Efectos y Conectividad', label: 'Patchbay', value: 'Entradas/Salidas CV completas' },
            { category: 'Especificaciones Técnicas', label: 'Consumo', value: '+12V: 60mA / -12V: 50mA' }
        ]
    }
];

async function seedBatch() {
    try {
        console.log('🔌 Connecting to MongoDB...');
        await mongoose.connect(MONGODB_URI as string);
        console.log('✅ Connected.');

        for (const inst of instruments) {
            const existing = await Instrument.findOne({ brand: inst.brand, model: inst.model });
            if (existing) {
                console.log(`⚠️ Updating ${inst.model}...`);
                existing.specs = inst.specs;
                existing.description = inst.description;
                existing.type = inst.type;
                existing.subtype = inst.subtype;
                await existing.save();
                console.log(`✅ Updated ${inst.model}.`);
            } else {
                console.log(`🆕 Creating ${inst.model}...`);
                await Instrument.create(inst);
                console.log(`✅ Created ${inst.model}.`);
            }
        }

        console.log('🎉 All instruments processed!');
        process.exit(0);

    } catch (error) {
        console.error('❌ Batch seeding failed:', error);
        process.exit(1);
    }
}

seedBatch();
