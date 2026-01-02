'use server';

import dbConnect from '@/lib/db';
import Config from '@/models/Config';
import { auth } from '@/auth';
import { revalidatePath } from 'next/cache';

const DEFAULT_PROMPT = `As a world-class musical instrument expert and data archivist, analyze the provided input (image or text) to extract an EXHAUSTIVE technical profile.

CRITICAL RULES:
1. REFERENCE SOURCES: If "Reference Sources" are provided in the text input, treat them as the PRIMARY and AUTHORITATIVE source of truth. Prioritize data found in those links over general training data.
2. LANGUAGE: All descriptive text fields (subtype, description, label, value) MUST be in Spanish (castellano).
3. GRANULARITY: Never group physical controls. Each knob, button, slider, and switch must be an individual entry in the "specs" array.
4. LABELS: Use the exact label found on the hardware if possible (e.g., "Knob CUT OFF FREQ" instead of "Filtro").
5. WEBSITES: Identify the official manufacturer product page URL. If there are multiple relevant official URLs (support, microsite, global), include all of them in an array of objects: \`[{ "url": "...", "isPrimary": boolean }]\`. Designate the most relevant official product page as \`isPrimary: true\`.
6. CATEGORIES: Categorize every spec strictly into one of the following:
   - "Información Básica": Format, version, synthesis type.
   - "Sitio Web Oficial": The primary product URLs. (Note: The URLs must also be present in the root "websites" array).
   - "Arquitectura y Voces": Polyphony, multitimbrality, core engine details.
   - "Sección de Osciladores": Waveforms, tuning, sync, FM.
   - "Sección de Percusión / Voces": Drum-specific parameters and engines.
   - "Filtros y Amplificador": Filter types, resonance, VCA, drive.
   - "Envolturas y Modulación": ADSR, LFOs, mod matrix.
   - "Parámetros de Efectos": Reverb, delay, chorus, distortion settings.
   - "Secuenciador y Memoria": Patterns, steps, memory slots, tracks.
   - "Controles de Panel (Knobs/Faders)": Every physical pot, slider, and selector.
   - "Botones de Sistema / Funciones": Function buttons, keyboard buttons, mode selectors.
   - "CV / Gate y Sincronización": Voltages, triggers, clock I/O.
   - "Pantalla e Indicadores": Display type, status LEDs, meters.
   - "Efectos y Conectividad": Audio I/O, MIDI, USB, storage.
   - "Alimentación y Energía": Battery type, current draw, power requirements.
   - "Especificaciones Técnicas": Weight, dimensions, release year.
   - "Precios y Valor": Original launch price, current estimated market value (EUR/USD).

7. PRICES:
    - Original Price: Find the original launch price and year (MSRP).
    - Market Value: Estimate the current used market value (average) in EUR. Provide a min/max range based on condition.

Format output as a single JSON object:
{
    "brand": "string",
    "model": "string",
    "type": "Synthesizer | Drum Machine | Guitar | Modular | Eurorack Module | Groovebox | Effect | Mixer | Drum Kit | Workstation | Controller",
    "subtype": "Detailed subtype in Spanish",
    "description": "Rich professional description in Spanish (2-3 sentences)",
    "websites": [{ "url": "string", "isPrimary": boolean }],
    "year": "YYYY or YYYY-YYYY",
    "originalPrice": {
        "price": number,
        "currency": "USD | EUR | GBP | JPY",
        "year": number
    },
    "marketValue": {
        "current": {
             "value": number,
             "min": number,
             "max": number,
             "currency": "EUR"
        }
    },
    "specs": [
        { "category": "Category Name", "label": "Technical Label in Spanish", "value": "Detailed Value in Spanish" }
    ]
}`;

const DEFAULT_MODEL = 'gemini-3-flash-preview';

export async function getDefaultConfig() {
    console.log('getDefaultConfig called - serving V2 prompt with prices');
    return {
        prompt: DEFAULT_PROMPT,
        model: DEFAULT_MODEL
    };
}

export async function getSystemConfig(key: string) {
    try {
        const session = await auth();
        if (!session || (session.user as any).role !== 'admin') {
            throw new Error('Unauthorized');
        }

        await dbConnect();
        const config = await Config.findOne({ key });

        if (!config) {
            if (key === 'ai_system_prompt') return DEFAULT_PROMPT;
            if (key === 'ai_model_name') return DEFAULT_MODEL;
            return null;
        }

        return config.value;
    } catch (error) {
        console.error('Get Config Error:', error);
        return null;
    }
}

export async function updateSystemConfig(key: string, value: any) {
    try {
        const session = await auth();
        if (!session || (session.user as any).role !== 'admin') {
            throw new Error('Unauthorized');
        }

        await dbConnect();

        await Config.findOneAndUpdate(
            { key },
            { value },
            { upsert: true, new: true }
        );

        revalidatePath('/dashboard/admin/settings');
        return { success: true };
    } catch (error: any) {
        console.error('Update Config Error:', error);
        return { success: false, error: error.message };
    }
}
