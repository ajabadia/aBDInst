'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { updateSystemConfig } from '@/actions/admin';
import { toast } from 'sonner';
import { Save, RotateCcw, Sparkles, Smartphone } from 'lucide-react';

interface AdminSettingsFormProps {
    initialPrompt: string;
    initialModel: string;
}

export default function AdminSettingsForm({ initialPrompt, initialModel }: AdminSettingsFormProps) {
    const [prompt, setPrompt] = useState(initialPrompt);
    const [modelName, setModelName] = useState(initialModel);
    const [loading, setLoading] = useState(false);

    const handleSave = async () => {
        setLoading(true);
        try {
            const resP = await updateSystemConfig('ai_system_prompt', prompt);
            const resM = await updateSystemConfig('ai_model_name', modelName);

            if (resP.success && resM.success) {
                toast.success('Configuración actualizada correctamente');
            } else {
                toast.error('Ocurrió un error al guardar');
            }
        } catch (error) {
            toast.error('Algo salió mal');
        } finally {
            setLoading(false);
        }
    };

    const handleReset = () => {
        if (confirm('¿Restablecer configuración a valores por defecto?')) {
            setPrompt(`As a world-class musical instrument expert and data archivist, analyze the provided input (image or text) to extract an EXHAUSTIVE technical profile.

CRITICAL RULES:
1. REFERENCE SOURCES: If "Reference Sources" are provided in the text input, treat them as the PRIMARY and AUTHORITATIVE source of truth. Prioritize data found in those links over general training data.
2. LANGUAGE: All descriptive text fields (subtype, description, label, value) MUST be in Spanish (castellano).
2. GRANULARITY: Never group physical controls. Each knob, button, slider, and switch must be an individual entry in the "specs" array.
3. LABELS: Use the exact label found on the hardware if possible (e.g., "Knob CUT OFF FREQ" instead of "Filtro").
4. WEBSITES: Identify the official manufacturer product page URL. If there are multiple relevant official URLs (support, microsite, global), include all of them in an array of objects: \`[{"url": "...", "isPrimary": boolean}]\`. Designate the most relevant official product page as \`isPrimary: true\`.
5. CATEGORIES: Categorize every spec strictly into one of the following:
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

Format output as a single JSON object:
{
    "brand": "string",
    "model": "string",
    "type": "Synthesizer | Drum Machine | Guitar | Modular | Eurorack Module | Groovebox | Effect | Mixer | Drum Kit | Workstation | Controller",
    "subtype": "Detailed subtype in Spanish",
    "description": "Rich professional description in Spanish (2-3 sentences)",
    "websites": [{ "url": "string", "isPrimary": boolean }],
    "year": "YYYY or YYYY-YYYY",
    "specs": [
        { "category": "Category Name", "label": "Technical Label in Spanish", "value": "Detailed Value in Spanish" }
    ]
}`);
            setModelName('gemini-3-flash-preview');
        }
    };

    return (
        <div className="space-y-6">
            <div className="bg-white dark:bg-gray-900 rounded-3xl p-6 border border-gray-200 dark:border-gray-800 shadow-sm">
                <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600">
                        <Smartphone size={20} />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold">Motor de IA</h2>
                        <p className="text-sm text-gray-500">Identificador del modelo de Google Gemini</p>
                    </div>
                </div>

                <div className="space-y-4">
                    <div className="relative">
                        <input
                            value={modelName}
                            onChange={(e) => setModelName(e.target.value)}
                            className="apple-input font-mono text-sm"
                            placeholder="Ej: gemini-3-flash-preview"
                        />
                        <p className="text-[10px] text-gray-400 mt-2 px-1">
                            Valores sugeridos: <code className="text-purple-500">gemini-3-flash-preview</code>, <code className="text-purple-500">gemini-2.0-flash-exp</code>, <code className="text-purple-500">gemini-1.5-flash</code>
                        </p>
                    </div>
                </div>
            </div>

            <div className="bg-white dark:bg-gray-900 rounded-3xl p-6 border border-gray-200 dark:border-gray-800 shadow-sm">
                <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-xl bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center text-purple-600">
                        <Sparkles size={20} />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold">Prompt de Sistema</h2>
                        <p className="text-sm text-gray-500">Instrucciones maestras para la extracción de datos</p>
                    </div>
                </div>

                <div className="space-y-4">
                    <div className="relative">
                        <textarea
                            value={prompt}
                            onChange={(e) => setPrompt(e.target.value)}
                            rows={15}
                            className="w-full p-4 font-mono text-sm bg-gray-50 dark:bg-black rounded-2xl border border-gray-200 dark:border-gray-800 focus:ring-2 focus:ring-purple-500 outline-none transition-all resize-none"
                            placeholder="Escribe las instrucciones aquí..."
                        />
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-gray-100 dark:border-gray-800">
                        <Button
                            variant="primary"
                            onClick={handleSave}
                            isLoading={loading}
                            icon={Save}
                            className="bg-purple-600 hover:bg-purple-700 text-white flex-1"
                        >
                            Guardar Cambios
                        </Button>
                        <Button
                            variant="secondary"
                            onClick={handleReset}
                            icon={RotateCcw}
                            className="flex-1"
                        >
                            Restablecer a Defecto
                        </Button>
                    </div>
                </div>
            </div>

            <div className="p-4 bg-yellow-50 dark:bg-yellow-900/10 border border-yellow-100 dark:border-yellow-900/30 rounded-2xl">
                <div className="flex gap-3">
                    <div className="text-yellow-600 mt-0.5">⚠️</div>
                    <div>
                        <p className="text-sm font-bold text-yellow-800 dark:text-yellow-200">Consejo de Admin</p>
                        <p className="text-xs text-yellow-700/80 dark:text-yellow-300/80 leading-relaxed">
                            Asegúrate de mantener siempre el formato JSON en las instrucciones. Si cambias las claves de los objetos devueltos, podrías romper la lógica de autocompletado en los formularios.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
