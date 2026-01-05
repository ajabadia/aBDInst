// @ts-nocheck

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
            model: 'DeepMind 12D',
            type: 'synthesizer',
            subtype: 'Analógico Polifónico (Desktop/Rack)',
            version: 'Mk I',
            years: ['2017'], // Approx release year
            description: 'Sintetizador analógico polifónico de 12 voces en formato desktop/rack, con 2 DCOs por voz, 4 motores de efectos y matriz de modulación.',
            createdBy: admin._id,
            specs: [
                // Identificación y Hardware
                { category: SPEC_CATEGORIES.BASIC, label: 'Formato', value: 'Desktop / Rack (5U)' },
                { category: SPEC_CATEGORIES.TECH_SPECS, label: 'Dimensiones', value: '117 × 457 × 224 mm' },
                { category: SPEC_CATEGORIES.TECH_SPECS, label: 'Peso', value: '6 kg' },
                { category: SPEC_CATEGORIES.TECH_SPECS, label: 'Alimentación', value: 'Interna (IEC)' },
                { category: SPEC_CATEGORIES.TECH_SPECS, label: 'Refrigeración', value: 'Ventiladores internos (velocidad ajustable)' },

                // Arquitectura de Voz
                { category: SPEC_CATEGORIES.ARCH_VOICE, label: 'Número de Voces', value: '12 voces' },

                // Osciladores
                { category: SPEC_CATEGORIES.OSC, label: 'Osciladores por Voz', value: '2 DCOs' },
                { category: SPEC_CATEGORIES.OSC, label: 'Formas de onda Osc 1', value: 'Saw, Square/PWM' },
                { category: SPEC_CATEGORIES.OSC, label: 'Formas de onda Osc 2', value: 'Square/Pulse (Tone Control)' },
                { category: SPEC_CATEGORIES.OSC, label: 'Sync', value: 'Hard Sync' },

                // Filtro y VCA
                { category: SPEC_CATEGORIES.FILTER_AMP, label: 'Filtro Principal', value: 'Low-pass 2/4 polos (12/24 dB)' },
                { category: SPEC_CATEGORIES.FILTER_AMP, label: 'High-Pass', value: 'Global con Boost' },
                { category: SPEC_CATEGORIES.FILTER_AMP, label: 'VCA', value: 'Analógico' },
                { category: SPEC_CATEGORIES.FILTER_AMP, label: 'Resonancia', value: 'Ajustable por voz' },

                // Envolventes y LFO
                { category: SPEC_CATEGORIES.ENV_MOD, label: 'Envolventes', value: '3 x ADSR (VCF, VCA, Mod) con curvas ajustables' },
                { category: SPEC_CATEGORIES.ENV_MOD, label: 'LFOs por Voz', value: '2 (7 formas de onda, S&H, Sync)' },
                { category: SPEC_CATEGORIES.ENV_MOD, label: 'Matriz de Modulación', value: '8 slots, >20 fuentes, >130 destinos' },

                // FX y Secuenciador
                { category: SPEC_CATEGORIES.EFFECTS_CONN, label: 'Motores FX', value: '4 simultáneos (TC Electronic, Klark Teknik)' },
                { category: SPEC_CATEGORIES.EFFECTS_CONN, label: 'Tipos FX', value: 'Reverb, Delay, Chorus, Phaser, EQ, Distortion, etc.' },
                { category: SPEC_CATEGORIES.EFFECTS_CONN, label: 'Ruteo FX', value: '10 modos (Serie/Paralelo)' },
                { category: SPEC_CATEGORIES.CONTROLS, label: 'Secuenciador de Control', value: '32 pasos (Modulable)' },
                { category: SPEC_CATEGORIES.CONTROLS, label: 'Arpegiador', value: 'Sofisticado con patrones de usuario' },

                // Modos y Memoria
                { category: SPEC_CATEGORIES.CONTROLS, label: 'Modos de Voz', value: 'Poly, Unison (Detune, Pan Spread, Drift), Chord' },
                { category: SPEC_CATEGORIES.CONTROLS, label: 'Memorias', value: '1024 Programas (8 bancos)' },
                { category: SPEC_CATEGORIES.CONTROLS, label: 'Categorías', value: 'Sí (Pad, Lead, Bass...)' },
                { category: SPEC_CATEGORIES.CONTROLS, label: 'Compare', value: 'Compare & Match' },

                // Control y Conectividad
                { category: SPEC_CATEGORIES.CONTROLS, label: 'Pantalla', value: 'LCD con encoder' },
                { category: SPEC_CATEGORIES.EFFECTS_CONN, label: 'WiFi', value: 'Integrado (Control remoto)' },
                { category: SPEC_CATEGORIES.EFFECTS_CONN, label: 'Salida Principal', value: 'L/R 6.3 mm Estéreo' },
                { category: SPEC_CATEGORIES.EFFECTS_CONN, label: 'Auriculares', value: '6.3 mm TRS' },
                { category: SPEC_CATEGORIES.EFFECTS_CONN, label: 'MIDI', value: 'In, Out, Thru (DIN)' },
                { category: SPEC_CATEGORIES.EFFECTS_CONN, label: 'USB', value: 'Tipo B (MIDI Class Compliant)' },
                { category: SPEC_CATEGORIES.EFFECTS_CONN, label: 'Pedal', value: 'Sustain/Expresión' },
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
