'use client';

import { useState } from 'react';
import { setSystemConfig } from '@/actions/admin';
import { Button } from '@/components/ui/Button';
import { toast } from 'sonner';
import { Save, Bot, Cpu } from 'lucide-react';

interface AdminConfigProps {
    configs: any[];
}

export default function AdminConfig({ configs }: AdminConfigProps) {
    const getValue = (key: string, def: string) => configs.find(c => c.key === key)?.value || def;

    const DEFAULT_SYSTEM = `As a world-class musical instrument expert and data archivist, analyze the provided input (image or text) to extract an EXHAUSTIVE technical profile.

CRITICAL RULES:
1. REFERENCE SOURCES: If "Reference Sources" are provided in the text input, treat them as the PRIMARY and AUTHORITATIVE source of truth. Prioritize data found in those links over general training data.
2. LANGUAGE: All descriptive text fields (subtype, description, label, value) MUST be in Spanish (castellano).
3. GRANULARITY: Never group physical controls. Each knob, button, slider, and switch must be an individual entry in the "specs" array.
4. LABELS: Use the exact label found on the hardware if possible (e.g., "Knob CUT OFF FREQ" instead of "Filtro").
5. WEBSITES: Identify the official manufacturer product page URL. If there are multiple relevant official URLs (support, microsite, global), include all of them in an array of objects: [{ "url": "...", "isPrimary": boolean }]. Designate the most relevant official product page as isPrimary: true.
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
        "estimatedPrice": number,
        "currency": "EUR",
        "priceRange": {
            "min": number,
            "max": number
        }
    },
    "specs": [
        { "category": "Category Name", "label": "Technical Label in Spanish", "value": "Detailed Value in Spanish" }
    ]
}`;
    const DEFAULT_BULK = "You are an expert instrument appraiser. Parse the raw list into a JSON ARRAY of objects with brand, model, type, year, description.";

    const [modelName, setModelName] = useState(getValue('ai_model_name', 'gemini-2.0-flash-exp'));
    const [systemPrompt, setSystemPrompt] = useState(getValue('ai_system_prompt', DEFAULT_SYSTEM));
    const [bulkPrompt, setBulkPrompt] = useState(getValue('ai_bulk_prompt', DEFAULT_BULK));
    const [scraperProxy, setScraperProxy] = useState(getValue('scraper_proxy_url', ''));
    const [loading, setLoading] = useState(false);

    const handleSave = async () => {
        setLoading(true);
        try {
            await Promise.all([
                setSystemConfig('ai_model_name', modelName),
                setSystemConfig('ai_system_prompt', systemPrompt),
                setSystemConfig('ai_bulk_prompt', bulkPrompt),
                setSystemConfig('scraper_proxy_url', scraperProxy)
            ]);
            toast.success('Configuración guardada correctamente');
        } catch (error) {
            toast.error('Error al guardar configuración');
        } finally {
            setLoading(false);
        }
    };

    const resetDefaults = () => {
        setSystemPrompt(DEFAULT_SYSTEM);
        setBulkPrompt(DEFAULT_BULK);
        setModelName('gemini-2.0-flash-exp');
        setScraperProxy('');
    };

    return (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center bg-gray-50 dark:bg-white/5">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-purple-100 text-purple-600 rounded-lg dark:bg-purple-900/30">
                        <Bot size={24} />
                    </div>
                    <div>
                        <h2 className="text-lg font-bold text-gray-900 dark:text-white">Configuración de IA</h2>
                        <p className="text-sm text-gray-500">Gestión de modelos y prompts del sistema.</p>
                    </div>
                </div>
            </div>

            <div className="p-6 space-y-6">

                {/* Proxy Section - Added for Visibility */}
                <div className="bg-blue-50 dark:bg-blue-900/10 p-4 rounded-xl border border-blue-100 dark:border-blue-800">
                    <label className="block text-sm font-bold text-blue-900 dark:text-blue-100 mb-2 flex items-center gap-2">
                        <span className="bg-blue-600 text-white text-[10px] px-1.5 py-0.5 rounded uppercase">Nuevo</span>
                        Proxy de Scraping (Anti-Bloqueo)
                    </label>
                    <input
                        type="text"
                        value={scraperProxy}
                        onChange={(e) => setScraperProxy(e.target.value)}
                        className="apple-input font-mono text-sm border-blue-200 focus:ring-blue-500"
                        placeholder="http://user:pass@host:port"
                    />
                    <p className="text-xs text-blue-600/80 dark:text-blue-300 mt-2">
                        Introduce aquí tu proxy para activar el rastreo de precios en Reverb/eBay.
                    </p>
                </div>

                <div className="border-t border-gray-100 dark:border-gray-800 pt-4">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                        <Cpu size={16} />
                        Modelo Gemini
                    </label>
                    <input
                        type="text"
                        value={modelName}
                        onChange={(e) => setModelName(e.target.value)}
                        className="apple-input font-mono text-sm"
                        placeholder="gemini-1.5-flash"
                    />
                    <p className="text-xs text-gray-400 mt-1">Ej: gemini-1.5-flash, gemini-2.0-flash-exp</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Prompt del Sistema (Análisis Individual)
                        </label>
                        <textarea
                            value={systemPrompt}
                            onChange={(e) => setSystemPrompt(e.target.value)}
                            className="apple-input min-h-[150px] font-mono text-xs"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Prompt de Importación Masiva
                        </label>
                        <textarea
                            value={bulkPrompt}
                            onChange={(e) => setBulkPrompt(e.target.value)}
                            className="apple-input min-h-[150px] font-mono text-xs"
                        />
                    </div>
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-gray-100 dark:border-gray-700">
                    <Button
                        onClick={resetDefaults}
                        variant="ghost"
                        className="text-gray-500"
                    >
                        Restablecer
                    </Button>
                    <Button
                        onClick={handleSave}
                        disabled={loading}
                        className="bg-purple-600 hover:bg-purple-700 text-white"
                        icon={Save}
                    >
                        {loading ? 'Guardando...' : 'Guardar Cambios'}
                    </Button>
                </div>
            </div>
        </div>
    );
}
