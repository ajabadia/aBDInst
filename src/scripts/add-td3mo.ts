
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
            model: 'TD-3-MO-BK',
            type: 'synthesizer',
            subtype: 'Bass Line Analógico (Modded Out)',
            version: 'Mk I',
            years: ['2021'], // Approx release year
            description: 'Sintetizador de bajo analógico "Modded Out" basado en el TB-303 con modificaciones estilo Devil Fish: Sub-oscilador, FM de filtro, Overdrive, y más.',
            createdBy: admin._id,
            specs: [
                // Identificación y Hardware
                { category: SPEC_CATEGORIES.BASIC, label: 'Formato', value: 'Desktop' },
                { category: SPEC_CATEGORIES.TECH_SPECS, label: 'Dimensiones', value: '55.9 × 304.8 × 165.1 mm' },
                { category: SPEC_CATEGORIES.TECH_SPECS, label: 'Color', value: 'Negro (BK)' },

                // Arquitectura de Voz
                { category: SPEC_CATEGORIES.ARCH_VOICE, label: 'Número de Voces', value: '1 voz (Monofónico)' },
                { category: SPEC_CATEGORIES.ARCH_VOICE, label: 'Poly-Chain', value: 'Hasta 16 unidades' },

                // Osciladores
                { category: SPEC_CATEGORIES.OSC, label: 'VCO Principal', value: 'Sawtooth, Square (Transistor shaping)' },
                { category: SPEC_CATEGORIES.OSC, label: 'Sub-Oscilador', value: 'Sí (Off/Low/High)' },

                // Filtro y Mods MO
                { category: SPEC_CATEGORIES.FILTER_AMP, label: 'Filtro', value: '4-pole Low-Pass resonant (Ladder style)' },
                { category: SPEC_CATEGORIES.FILTER_AMP, label: 'Filter FM', value: 'Sí (Audio Rate desde VCA)' },
                { category: SPEC_CATEGORIES.FILTER_AMP, label: 'Controles VCF', value: 'Cutoff, Res, Env, Decay, Accent' },
                { category: SPEC_CATEGORIES.FILTER_AMP, label: 'Overdrive', value: 'Analógico dedicado' },
                { category: SPEC_CATEGORIES.FILTER_AMP, label: 'Muffler', value: 'Distorsión suave post-VCA (2 modos)' },
                { category: SPEC_CATEGORIES.FILTER_AMP, label: 'Accent Sweep', value: '3 velocidades (Slow, Norm, Fast)' },

                // Envolventes y Control
                { category: SPEC_CATEGORIES.ENV_MOD, label: 'Envolvente', value: 'Attack/Decay (Soft Attack switch)' },
                { category: SPEC_CATEGORIES.CONTROLS, label: 'Slide', value: 'Mejorado (hasta 6x más largo)' },
                { category: SPEC_CATEGORIES.CONTROLS, label: 'Accent Manual', value: 'Botón dedicado' },

                // Secuenciador
                { category: SPEC_CATEGORIES.CONTROLS, label: 'Secuenciador', value: '16 pasos, 7 pistas' },
                { category: SPEC_CATEGORIES.CONTROLS, label: 'Patrones', value: '250 User Patterns' },
                { category: SPEC_CATEGORIES.CONTROLS, label: 'Arpegiador', value: 'Integrado (Pattern based)' },

                // Conectividad CV/Gate
                { category: SPEC_CATEGORIES.EFFECTS_CONN, label: 'CV Inputs', value: 'Filter, Filter FM, Pitch, Accent, Slide, Gate, Sync' },
                { category: SPEC_CATEGORIES.EFFECTS_CONN, label: 'CV Outputs', value: 'Filter Out (3.5mm)' },
                { category: SPEC_CATEGORIES.EFFECTS_CONN, label: 'Salida Audio', value: '1/4" TRS (Line), 3.5mm (Phones)' },
                { category: SPEC_CATEGORIES.EFFECTS_CONN, label: 'MIDI', value: 'In, Out/Thru (DIN), USB-MIDI' },
                { category: SPEC_CATEGORIES.CONTROLS, label: 'MIDI Control', value: 'Cutoff CC74, Note On/Off, Pitchbend' },
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
