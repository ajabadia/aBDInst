
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
            model: 'Crave',
            type: 'synthesizer',
            subtype: 'Analógico Semia-Modular (Desktop)',
            version: 'Mk I',
            years: ['2019'], // Approx release year
            description: 'Sintetizador analógico monofónico semi-modular con 1 VCO 3340, filtro Ladder, secuenciador de 32 pasos y 18 puntos de patch Eurorack.',
            createdBy: admin._id,
            specs: [
                // Identificación y Hardware
                { category: SPEC_CATEGORIES.BASIC, label: 'Formato', value: 'Desktop / Semi-Modular' },

                // Arquitectura de Voz
                { category: SPEC_CATEGORIES.ARCH_VOICE, label: 'Número de Voces', value: '1 voz (Monofónico)' },
                { category: SPEC_CATEGORIES.ARCH_VOICE, label: 'Arquitectura', value: '1 VCO, 1 VCF, 1 VCA' },

                // Osciladores
                { category: SPEC_CATEGORIES.OSC, label: 'Oscilador', value: '1 × VCO CEM3340' },
                { category: SPEC_CATEGORIES.OSC, label: 'Formas de onda', value: 'Saw, Pulse (Mixable)' },
                { category: SPEC_CATEGORIES.OSC, label: 'PWM', value: 'Sí (vía Mod Matrix)' },
                { category: SPEC_CATEGORIES.OSC, label: 'Generador de Ruido', value: 'Sí (Mixable)' },

                // Filtro y VCA
                { category: SPEC_CATEGORIES.FILTER_AMP, label: 'Filtro', value: '24 dB/Oct Low-Pass Ladder (Moog Style)' },
                { category: SPEC_CATEGORIES.FILTER_AMP, label: 'Resonancia', value: 'Auto-oscilante' },
                { category: SPEC_CATEGORIES.FILTER_AMP, label: 'Controles VCF', value: 'Cutoff, Res, Env Amount, Key Track' },

                // Envolventes y Modulación
                { category: SPEC_CATEGORIES.ENV_MOD, label: 'Envolvente', value: '1 × ADSR (VCF/VCA)' },
                { category: SPEC_CATEGORIES.ENV_MOD, label: 'LFO', value: '1 × Asignable (formas seleccionables)' },
                { category: SPEC_CATEGORIES.ENV_MOD, label: 'Matriz Modulación', value: 'Vía Patchbay & Switches' },

                // Secuenciador y Arpegiador
                { category: SPEC_CATEGORIES.CONTROLS, label: 'Secuenciador', value: '32 pasos (Pattern Storage)' },
                { category: SPEC_CATEGORIES.CONTROLS, label: 'Parámetros Seq', value: 'Tempo, Swing, Glide, Accent, Ratchet' },
                { category: SPEC_CATEGORIES.CONTROLS, label: 'Arpegiador', value: 'Up, Down, etc.' },

                // Patchbay / Semi-Modular
                { category: SPEC_CATEGORIES.EFFECTS_CONN, label: 'Puntos de Patch', value: '18 x 3.5mm Jack' },
                { category: SPEC_CATEGORIES.EFFECTS_CONN, label: 'Tipos I/O', value: 'CV, Gate, Clock, Reset, VCF In/Out, LFO, etc.' },

                // Control y Conectividad
                { category: SPEC_CATEGORIES.CONTROLS, label: 'Glide', value: 'Sí (Portamento ajustable)' },
                { category: SPEC_CATEGORIES.EFFECTS_CONN, label: 'Salida Audio', value: 'Main Mono 6.3mm TS' },
                { category: SPEC_CATEGORIES.EFFECTS_CONN, label: 'Auriculares', value: '3.5mm TRS' },
                { category: SPEC_CATEGORIES.EFFECTS_CONN, label: 'MIDI', value: 'In, Out/Thru (DIN), USB-MIDI' },
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
