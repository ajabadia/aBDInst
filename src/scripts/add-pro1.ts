
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import Instrument from '../models/Instrument';
import User from '../models/User';
import { SPEC_CATEGORIES } from '../lib/spec-constants';

dotenv.config({ path: '.env.local' });

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
    console.error('MONGODB_URI is not defined in environment variables');
    process.exit(1);
}

async function main() {
    try {
        await mongoose.connect(MONGODB_URI as string);
        console.log('Connected to MongoDB');

        // Find an admin user to assign as creator
        const admin = await User.findOne({ role: 'admin' });
        if (!admin) {
            console.error('No admin user found. Please run seed-admin.ts first.');
            process.exit(1);
        }

        const instrumentData = {
            brand: 'Behringer',
            model: 'PRO-1',
            type: 'synthesizer',
            subtype: 'Analógico Mono/Parafónico (Desktop/Eurorack)',
            version: 'Mk I',
            years: ['2019'], // Approx release year
            description: 'Sintetizador analógico mono/parafónico de 2 VCO basado en el Sequential Pro-One, con secuenciador, arpegiador y patchbay Eurorack.',
            createdBy: admin._id,
            specs: [
                // Identificación y Hardware
                { category: SPEC_CATEGORIES.BASIC, label: 'Formato', value: 'Desktop / Eurorack (80 HP)' },
                { category: SPEC_CATEGORIES.TECH_SPECS, label: 'Dimensiones', value: '95 × 424 × 136 mm' },
                { category: SPEC_CATEGORIES.TECH_SPECS, label: 'Peso', value: '1.8 kg' },
                { category: SPEC_CATEGORIES.TECH_SPECS, label: 'Alimentación', value: 'Adaptador 12 V DC (incluido)' },

                // Arquitectura de Voz
                { category: SPEC_CATEGORIES.ARCH_VOICE, label: 'Número de Voces', value: '1 voz (Mono), Parafónico (2 notas)' },
                { category: SPEC_CATEGORIES.ARCH_VOICE, label: 'Poly-Chain', value: 'Hasta 16 unidades para 16 voces' },

                // Osciladores
                { category: SPEC_CATEGORIES.OSC, label: 'Osciladores', value: '2 × VCO (CEM3340)' },
                { category: SPEC_CATEGORIES.OSC, label: 'Formas de onda VCO A', value: 'Sawtooth, Pulse' },
                { category: SPEC_CATEGORIES.OSC, label: 'Formas de onda VCO B', value: 'Sawtooth, Triangle, Pulse' },
                { category: SPEC_CATEGORIES.OSC, label: 'PWM', value: 'Manual y Modulable (LFO, Osc B)' },
                { category: SPEC_CATEGORIES.OSC, label: 'Sync', value: 'Hard Sync (A -> B)' },
                { category: SPEC_CATEGORIES.OSC, label: 'Modo LFO Osc B', value: 'Low freq (key tracking off)' },
                { category: SPEC_CATEGORIES.OSC, label: 'Noise Generator', value: 'Sí' },

                // Filtro, VCA y Envolventes
                { category: SPEC_CATEGORIES.FILTER_AMP, label: 'VCF', value: 'Low-pass 24 dB/Oct (4 polos)' },
                { category: SPEC_CATEGORIES.FILTER_AMP, label: 'Resonancia', value: 'Auto-oscilante' },
                { category: SPEC_CATEGORIES.FILTER_AMP, label: 'Controles VCF', value: 'Cutoff, Res, Env Amount, Key Track' },
                { category: SPEC_CATEGORIES.FILTER_AMP, label: 'VCA', value: 'Analógico controlado por ADSR' },
                { category: SPEC_CATEGORIES.ENV_MOD, label: 'Envolventes', value: '2 × ADSR (Filter, Amp)' },

                // LFO y Modulación
                { category: SPEC_CATEGORIES.ENV_MOD, label: 'LFO Dedicado', value: 'Saw, Triangle, Square; Rango Audio/Lento' },
                { category: SPEC_CATEGORIES.ENV_MOD, label: 'Mod Buses', value: '2 Buses (Source, Dest, Amount)' },
                { category: SPEC_CATEGORIES.ENV_MOD, label: 'Destinos Mod', value: 'Pitch, Filter, PWM' },

                // Secuenciador y Arpegiador
                { category: SPEC_CATEGORIES.CONTROLS, label: 'Secuenciador', value: '2 secuencias, hasta 64 pasos' },
                { category: SPEC_CATEGORIES.CONTROLS, label: 'Arpegiador', value: 'Up, Down (sincronizable)' },

                // Patchbay / Eurorack
                { category: SPEC_CATEGORIES.EFFECTS_CONN, label: 'Eurorack', value: 'Compatible 80 HP' },
                { category: SPEC_CATEGORIES.EFFECTS_CONN, label: 'Patch Points', value: '3.5mm CV/Gate/Audio In-Out' },

                // Control y Conectividad
                { category: SPEC_CATEGORIES.CONTROLS, label: 'Poly-Chain', value: 'Soportado (MIDI)' },
                { category: SPEC_CATEGORIES.EFFECTS_CONN, label: 'Salida Principal', value: '6.3 mm TS (Mono)' },
                { category: SPEC_CATEGORIES.EFFECTS_CONN, label: 'Auriculares', value: '3.5 mm Estéreo' },
                { category: SPEC_CATEGORIES.EFFECTS_CONN, label: 'Audio In', value: 'Mono (procesamiento externo)' },
                { category: SPEC_CATEGORIES.EFFECTS_CONN, label: 'MIDI', value: 'In, Thru (5-pin DIN)' },
                { category: SPEC_CATEGORIES.EFFECTS_CONN, label: 'USB', value: 'USB 2.0 (MIDI Class Compliant)' },
            ]
        };

        // Check if exists
        const exists = await Instrument.findOne({
            brand: instrumentData.brand,
            model: instrumentData.model
        });

        if (exists) {
            console.log(`Updating existing instrument: ${instrumentData.brand} ${instrumentData.model}`);
            Object.assign(exists, instrumentData);
            await exists.save();
            console.log('Instrument updated successfully');
        } else {
            const newInstrument = await Instrument.create(instrumentData);
            console.log(`Created new instrument: ${newInstrument.brand} ${newInstrument.model}`);
        }

        console.log('Done!');
        process.exit(0);

    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
}

main();
