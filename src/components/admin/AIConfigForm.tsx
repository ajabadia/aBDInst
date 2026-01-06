'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { toast } from 'sonner';
import { Save, Bot, MessageSquare, List, Sparkles, Cpu, Terminal, History } from 'lucide-react';
import { cn } from '@/lib/utils';
import { updateSystemConfig } from '@/actions/admin';
import { fetchAvailableModels } from '@/actions/ai';
import ConfigHistoryModal from './ConfigHistoryModal';

interface AIConfigFormProps {
    fullConfigs: Record<string, any>;
}

const MODELS = [
    { value: 'gemini-2.0-flash-exp', label: 'Gemini 2.0 Flash (Experimental)' },
    { value: 'gemini-1.5-pro', label: 'Gemini 1.5 Pro' },
    { value: 'gemini-1.5-flash', label: 'Gemini 1.5 Flash' },
];

export default function AIConfigForm({ fullConfigs }: AIConfigFormProps) {
    // Extract initial values from fullConfigs
    const initialValues = Object.entries(fullConfigs).reduce((acc: any, [key, obj]: any) => {
        acc[key] = obj.value;
        return acc;
    }, {});

    const [config, setConfig] = useState(initialValues);
    const [loading, setLoading] = useState<string | null>(null);
    const [availableModels, setAvailableModels] = useState<{ value: string, label: string }[]>([]);

    // History Modal State
    const [historyModalOpen, setHistoryModalOpen] = useState(false);
    const [selectedHistoryKey, setSelectedHistoryKey] = useState<string | null>(null);

    const handleChange = (key: string, value: string) => {
        setConfig((prev: any) => ({ ...prev, [key]: value }));
    };

    const handleRefreshModels = async () => {
        setLoading('refresh_models');
        try {
            const result = await fetchAvailableModels();
            if (result.success && result.models) {
                setAvailableModels(result.models);
                toast.success(`Se encontraron ${result.models.length} modelos disponibles`);
            } else {
                toast.error('Error al obtener modelos: ' + result.error);
            }
        } catch (e) {
            toast.error('Error de conexión');
        } finally {
            setLoading(null);
        }
    };

    const handleSave = async (key: string, label: string) => {
        setLoading(key);
        try {
            const result = await updateSystemConfig(key, config[key]);
            if (result.success) {
                toast.success(`${label} actualizado`);
                // Optimistically update history in local prop copy if needed, 
                // but usually a refresh is safer or just depend on revalidatePath
            } else {
                toast.error(`Error al actualizar`);
            }
        } finally {
            setLoading(null);
        }
    };

    const openHistory = (key: string) => {
        setSelectedHistoryKey(key);
        setHistoryModalOpen(true);
    };

    const getHistory = (key: string) => {
        return fullConfigs[key]?.history || [];
    };

    return (
        <div className="space-y-10">
            <ConfigHistoryModal
                isOpen={historyModalOpen}
                onClose={() => setHistoryModalOpen(false)}
                configKey={selectedHistoryKey || ''}
                history={selectedHistoryKey ? getHistory(selectedHistoryKey) : []}
            />

            {/* --- MODEL SELECTION --- */}
            <div className="glass-panel rounded-[2rem] p-8 shadow-apple-sm overflow-hidden">
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-ios-blue/10 text-ios-blue rounded-2xl">
                            <Cpu size={24} />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold tracking-tight">Modelo Generativo</h2>
                            <p className="text-xs text-gray-400 font-medium uppercase tracking-wider mt-0.5">Motor de Inteligencia</p>
                        </div>
                    </div>
                    <Button
                        variant="ghost"
                        size="sm"
                        icon={History}
                        onClick={() => openHistory('ai_model_name')}
                        title="Ver historial de cambios"
                    />
                </div>

                <div className="space-y-6">
                    <div className="space-y-3">
                        <label className="apple-label ml-1">Modelo Activo</label>
                        <div className="flex flex-col sm:flex-row gap-4">
                            <select
                                value={config['ai_model_name'] || 'gemini-2.0-flash-exp'}
                                onChange={(e) => handleChange('ai_model_name', e.target.value)}
                                className="apple-input-field flex-1 appearance-none cursor-pointer"
                            >
                                <option value="" disabled>Seleccionar modelo...</option>
                                {MODELS.map(m => (
                                    <option key={m.value} value={m.value} className="dark:bg-black">{m.label}</option>
                                ))}
                                {availableModels.map(m => (
                                    <option key={m.value} value={m.value} className="dark:bg-black font-semibold text-blue-500">
                                        ✨ {m.label}
                                    </option>
                                ))}
                                {/* Ensure current value is shown if not in lists */}
                                {config['ai_model_name'] &&
                                    !MODELS.some(m => m.value === config['ai_model_name']) &&
                                    !availableModels.some(m => m.value === config['ai_model_name']) && (
                                        <option value={config['ai_model_name']} className="dark:bg-black">
                                            {config['ai_model_name']} (Actual)
                                        </option>
                                    )}
                            </select>
                            <Button
                                onClick={handleRefreshModels}
                                isLoading={loading === 'refresh_models'}
                                variant="secondary"
                                icon={Sparkles}
                                className="w-12 px-0"
                                title="Buscar nuevos modelos en Google AI"
                            />
                            <Button
                                onClick={() => handleSave('ai_model_name', 'Modelo')}
                                isLoading={loading === 'ai_model_name'}
                                icon={Save}
                                className="sm:w-32 shadow-apple-glow"
                            >
                                Guardar
                            </Button>
                        </div>
                        <p className="text-xs text-gray-500 font-medium px-1">
                            Este modelo procesará todas las extracciones técnicas y análisis de mercado.
                        </p>
                    </div>
                </div>
            </div>

            {/* --- SYSTEM PROMPT --- */}
            <div className="glass-panel rounded-[2rem] p-8 shadow-apple-sm overflow-hidden">
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-ios-indigo/10 text-ios-indigo rounded-2xl">
                            <Terminal size={24} />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold tracking-tight">Prompt del Sistema</h2>
                            <p className="text-xs text-gray-400 font-medium uppercase tracking-wider mt-0.5">Análisis Individual</p>
                        </div>
                    </div>
                    <Button
                        variant="ghost"
                        size="sm"
                        icon={History}
                        onClick={() => openHistory('ai_system_prompt')}
                        title="Ver historial de cambios"
                    />
                </div>

                <div className="space-y-6">
                    <div className="space-y-3">
                        <label className="apple-label ml-1">Instrucciones Maestras</label>
                        <textarea
                            rows={12}
                            value={config['ai_system_prompt'] || ''}
                            onChange={(e) => handleChange('ai_system_prompt', e.target.value)}
                            className="apple-input-field font-mono text-[11px] leading-relaxed resize-none p-6"
                            placeholder="Instrucciones para el análisis de instrumentos..."
                        />
                        <div className="flex justify-end pt-2">
                            <Button
                                onClick={() => handleSave('ai_system_prompt', 'System Prompt')}
                                isLoading={loading === 'ai_system_prompt'}
                                icon={Save}
                                className="shadow-apple-glow"
                            >
                                Actualizar Prompt
                            </Button>
                        </div>
                    </div>
                </div>
            </div>

            {/* --- BULK PROMPT --- */}
            <div className="glass-panel rounded-[2rem] p-8 shadow-apple-sm overflow-hidden">
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-ios-teal/10 text-ios-teal rounded-2xl">
                            <List size={24} />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold tracking-tight">Prompt de Importación</h2>
                            <p className="text-xs text-gray-400 font-medium uppercase tracking-wider mt-0.5">Procesamiento Masivo</p>
                        </div>
                    </div>
                    <Button
                        variant="ghost"
                        size="sm"
                        icon={History}
                        onClick={() => openHistory('ai_bulk_prompt')}
                        title="Ver historial de cambios"
                    />
                </div>

                <div className="space-y-6">
                    <div className="space-y-3">
                        <label className="apple-label ml-1">Lógica de Parseo CSV/JSON</label>
                        <textarea
                            rows={6}
                            value={config['ai_bulk_prompt'] || ''}
                            onChange={(e) => handleChange('ai_bulk_prompt', e.target.value)}
                            className="apple-input-field font-mono text-[11px] leading-relaxed resize-none p-6"
                            placeholder="Instrucciones para importaciones masivas..."
                        />
                        <div className="flex justify-end pt-2">
                            <Button
                                onClick={() => handleSave('ai_bulk_prompt', 'Bulk Prompt')}
                                isLoading={loading === 'ai_bulk_prompt'}
                                icon={Save}
                                className="shadow-apple-glow"
                            >
                                Actualizar Lógica
                            </Button>
                        </div>
                    </div>
                </div>
            </div>

        </div>
    );
}
