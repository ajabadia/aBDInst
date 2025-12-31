
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
            model: 'PRO-800',
            type: 'synthesizer',
            subtype: 'Analógico Polifónico (Desktop/Eurorack)',
            version: 'Mk I',
            years: ['2023'], // Approx release year
            description: 'Sintetizador analógico polifónico de 8 voces basado en el Prophet‑600, con 16 VCO CEM, filtro de 4 polos, secuenciador y 400 memorias en formato desktop/Eurorack.',
            createdBy: admin._id,
            specs: [
                // Identificación y Hardware
                { category: SPEC_CATEGORIES.BASIC, label: 'Formato', value: 'Desktop / Eurorack (80 HP)' },
                { category: SPEC_CATEGORIES.TECH_SPECS, label: 'Dimensiones', value: '424 × 136 × 97 mm' },
                { category: SPEC_CATEGORIES.TECH_SPECS, label: 'Peso', value: '1.65 kg' },
                { category: SPEC_CATEGORIES.TECH_SPECS, label: 'Alimentación', value: 'Adaptador 12 V DC, 2 A (incluido)' },

                // Arquitectura de Voz
                { category: SPEC_CATEGORIES.ARCH_VOICE, label: 'Número de Voces', value: '8 voces polifónicas' },
                { category: SPEC_CATEGORIES.ARCH_VOICE, label: 'Osciladores por Voz', value: '2 × VCO tipo 3340 (16 total)' },
                { category: SPEC_CATEGORIES.OSC, label: 'Rango de frecuencia VCO', value: '32.70 Hz a 8372.02 Hz (4 rangos)' },
                { category: SPEC_CATEGORIES.OSC, label: 'Formas de onda', value: 'Saw, Triangle, Pulse/Square (independientes)' },
                { category: SPEC_CATEGORIES.OSC, label: 'PWM', value: 'Manual y por LFO' },
                { category: SPEC_CATEGORIES.OSC, label: 'Sync', value: 'Hard sync (Osc B -> Osc A)' },
                { category: SPEC_CATEGORIES.OSC, label: 'Noise Generator', value: 'Sí (nivel ajustable)' },
                { category: SPEC_CATEGORIES.OSC, label: 'Glide', value: 'Polyphonic glide ajustable' },

                // Filtro, VCA y Envolventes
                { category: SPEC_CATEGORIES.FILTER_AMP, label: 'VCF', value: 'Paso bajo 4 polos (24 dB/oct), auto-resonante' },
                { category: SPEC_CATEGORIES.FILTER_AMP, label: 'Controles VCF', value: 'Cutoff, Res, Env Amount, Key Track, Ext CV' },
                { category: SPEC_CATEGORIES.FILTER_AMP, label: 'Envolventes', value: '2 x ADSR (VCF, VCA)' },

                // LFO y Modulación
                { category: SPEC_CATEGORIES.ENV_MOD, label: 'LFO Principal', value: '0.08 Hz - 20 Hz, 6 formas de onda' },
                { category: SPEC_CATEGORIES.ENV_MOD, label: 'Formas LFO', value: 'Pulse, Triangle, Saw, Ramp, S&H, etc.' },
                { category: SPEC_CATEGORIES.ENV_MOD, label: 'Destinos LFO', value: 'Pitch A/B, PWM A/B, VCF Cutoff' },
                { category: SPEC_CATEGORIES.ENV_MOD, label: 'Vibrato LFO', value: 'Dedicado (controlado por rueda mod)' },
                { category: SPEC_CATEGORIES.ENV_MOD, label: 'Poly-Mod', value: 'Modulación de Freq Osc A y Cutoff por Env Filtro y Osc B' },

                // Modos y Comportamiento
                { category: SPEC_CATEGORIES.CONTROLS, label: 'Modos de Voz', value: 'Poly, Mono, Unison, Chord' },
                { category: SPEC_CATEGORIES.CONTROLS, label: 'Unison Mode', value: 'Apila 8 voces (16 VCOs)' },
                { category: SPEC_CATEGORIES.CONTROLS, label: 'Voice Priority', value: 'Last/Low/High (ajustable)' },
                { category: SPEC_CATEGORIES.CONTROLS, label: 'Detune', value: 'Ajustable en menú' },

                // Memoria y Secuenciador
                { category: SPEC_CATEGORIES.CONTROLS, label: 'Memorias', value: '400 User/Factory' },
                { category: SPEC_CATEGORIES.CONTROLS, label: 'Arpegiador', value: 'Up, Down, U/D, Assign, Swing' },
                { category: SPEC_CATEGORIES.CONTROLS, label: 'Secuenciador', value: 'Polifónico 2 pistas, tiempo real' },

                // Controles Físicos
                { category: SPEC_CATEGORIES.CONTROLS, label: 'Controles', value: 'Completo por función (Freq, Level, Cutoff, ADSR...)' },
                { category: SPEC_CATEGORIES.CONTROLS, label: 'Ruedas', value: 'Pitch Bend, Mod Wheel (asignable)' },
                { category: SPEC_CATEGORIES.CONTROLS, label: 'Teclado/MIDI', value: 'Velocity y Poly Aftertouch soportados' },

                // Conectividad
                { category: SPEC_CATEGORIES.EFFECTS_CONN, label: 'Salida Audio', value: 'Main Mono 6.3mm, Auriculares 3.5mm' },
                { category: SPEC_CATEGORIES.EFFECTS_CONN, label: 'MIDI', value: 'In/Out (Thru en algunos), 5-pin DIN' },
                { category: SPEC_CATEGORIES.EFFECTS_CONN, label: 'USB', value: 'USB 2.0 Tipo B, Class Compliant' },
                { category: SPEC_CATEGORIES.EFFECTS_CONN, label: 'Sync In', value: '3.5mm TS (1, 2, 24, 48 PPQ)' },
                { category: SPEC_CATEGORIES.EFFECTS_CONN, label: 'Filter CV In', value: '0-10V' },
                { category: SPEC_CATEGORIES.EFFECTS_CONN, label: 'Footswitch', value: 'Sustain/Hold/Seq' },

                // Parámetros de Menú / Extra
                { category: SPEC_CATEGORIES.CONTROLS, label: 'Oscillator Pot Mode', value: 'Jump, Catch, Scale' },
                { category: SPEC_CATEGORIES.CONTROLS, label: 'VCF Ext CV Amount', value: '0–65535' },
                { category: SPEC_CATEGORIES.EFFECTS_CONN, label: 'MIDI Config', value: 'Clock, Channel, Pitch Range, Curves' },
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
