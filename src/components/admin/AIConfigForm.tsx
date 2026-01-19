'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { toast } from 'sonner';
import { Save, Bot, MessageSquare, List, Sparkles, Cpu, Terminal, History, ChevronRight } from 'lucide-react';
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

const PROMPT_TYPES = [
    {
        id: 'ai_system_prompt',
        label: 'Prompt del Sistema',
        desc: 'Instrucciones maestras para análisis individual',
        icon: Terminal,
        color: 'text-ios-indigo bg-ios-indigo/10'
    },
    {
        id: 'ai_bulk_prompt',
        label: 'Prompt de Importación',
        desc: 'Lógica para procesamiento masivo (CSV/JSON)',
        icon: List,
        color: 'text-ios-teal bg-ios-teal/10'
    },
    {
        id: 'ai_user_import_prompt',
        label: 'Prompt de Asistente',
        desc: 'Wizard de creación mágica para usuarios',
        icon: Sparkles,
        color: 'text-fuchsia-600 bg-fuchsia-500/10'
    },
    {
        id: 'ai_writer_prompt',
        label: 'Prompt de Redactor',
        desc: 'Generador de contenido para blog y artículos',
        icon: MessageSquare,
        color: 'text-orange-500 bg-orange-500/10'
    },
    {
        id: 'ai_scraper_fallback_prompt',
        label: 'Prompt de Rescate (Web)',
        desc: 'Inferencia de datos cuando una URL está protegida',
        icon: Bot,
        color: 'text-red-500 bg-red-500/10'
    }
];

const DEFAULT_PROMPTS: Record<string, string> = {
    ai_system_prompt: "You are an expert instrument appraiser. Analyze the provided image/text and return a JSON object with brand, model, type, year, description, specs (array of category/label/value), originalPrice (price/currency/year), and marketValue (estimatedPrice/currency/priceRange).",

    ai_bulk_prompt: `You are an expert instrument appraiser. I will give you a raw list of instruments. 
Please parse them into a JSON ARRAY of objects.
Each object must have: brand, model, type, year (if estimable), and valid description.
If a line is garbage, ignore it.`,

    ai_user_import_prompt: `You are an expert musical instrument archivist and appraiser.
I need you to extract structured data for a specific instrument based on the rough notes and links provided below.

INPUT DATA:
Description/Notes: "{{description}}"
Technical Specs/Details: "{{specs}}"
Reference URLs: "{{urls}}"
Image URLs: "{{imageUrls}}"

TASK:
Analyze the input data. If specific details are missing, use your internal knowledge base to infer accurate technical specifications for the identified instrument model.

CRITICAL JSON FORMAT RULES:
1. Return ONLY valid JSON - no markdown formatting, no code fences, no extra text
2. Use DOUBLE QUOTES for all property names and string values
3. Do NOT use trailing commas
4. Ensure all brackets and braces are properly closed

OUTPUT SCHEMA:
{
    "brand": "string (Required, e.g., Roland)",
    "model": "string (Required, e.g., Juno-106)",
    "type": "string (Required, e.g., Synthesizer)",
    "subtype": "string (Optional, e.g., Analog Polyphonic)",
    "years": ["string"], 
    "description": "string (A comprehensive, professional description, 2-3 paragraphs)",
    "specs": [
        { "category": "string", "label": "string", "value": "string" }
    ],
    "websites": [
        { "url": "string", "isPrimary": true }
    ],
    "marketValue": {
        "original": { "price": 0, "currency": "USD", "year": 0 },
        "current": { "value": 0, "min": 0, "max": 0, "currency": "EUR" }
    }
}`,

    ai_writer_prompt: `You are an expert music journalist and instrument historian. 
Assist the user in writing a blog article. 
Tone: Professional, Passionate, Informative.
Format: Markdown.`,

    ai_scraper_fallback_prompt: `You are an expert instrument appraiser. I cannot access the website content due to privacy protection.
                    
ANALYZE ONLY THIS URL: "{{url}}"

Extract or Infer the likely Brand, Model, Type, and Year from the URL slug itself.
The URL often contains the product name (e.g., /p/brand-model...).

Return a valid JSON object with:
- brand (string)
- model (string)
- type (string)
- description (string): "Datos inferidos por IA desde el enlace (Sitio protegido)."
- specs (array of {category, label, value}): Generate likely specs for this model based on your training data.

Be accurate with the model identification.`
};

export default function AIConfigForm({ fullConfigs }: AIConfigFormProps) {
    const initialValues = Object.entries(fullConfigs).reduce((acc: any, [key, obj]: any) => {
        acc[key] = obj.value;
        return acc;
    }, {});

    // Merge with defaults for missing keys
    PROMPT_TYPES.forEach(pt => {
        if (!initialValues[pt.id]) {
            initialValues[pt.id] = DEFAULT_PROMPTS[pt.id];
        }
    });

    const [config, setConfig] = useState(initialValues);
    const [loading, setLoading] = useState<string | null>(null);
    const [availableModels, setAvailableModels] = useState<{ value: string, label: string }[]>([]);

    // UI State
    const [activePromptTab, setActivePromptTab] = useState('ai_system_prompt');
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

    const activePrompt = PROMPT_TYPES.find(p => p.id === activePromptTab)!;

    return (
        <div className="space-y-8">
            <ConfigHistoryModal
                isOpen={historyModalOpen}
                onClose={() => setHistoryModalOpen(false)}
                configKey={selectedHistoryKey || ''}
                history={selectedHistoryKey ? getHistory(selectedHistoryKey) : []}
            />

            {/* --- MODEL CONFIGURATION --- */}
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
                    <Button variant="ghost" size="sm" icon={History} onClick={() => openHistory('ai_model_name')} />
                </div>

                <div className="flex flex-col sm:flex-row gap-4 items-end">
                    <div className="flex-1 w-full space-y-2">
                        <label className="apple-label ml-1">Seleccionar Modelo</label>
                        <div className="relative">
                            <select
                                value={config['ai_model_name'] || 'gemini-2.0-flash-exp'}
                                onChange={(e) => handleChange('ai_model_name', e.target.value)}
                                className="apple-input-field w-full appearance-none cursor-pointer pr-10"
                            >
                                <option value="" disabled>Seleccionar...</option>
                                {MODELS.map(m => (
                                    <option key={m.value} value={m.value} className="dark:bg-black">{m.label}</option>
                                ))}
                                {availableModels.map(m => (
                                    <option key={m.value} value={m.value} className="dark:bg-black text-blue-500">✨ {m.label}</option>
                                ))}
                                {config['ai_model_name'] &&
                                    !MODELS.some(m => m.value === config['ai_model_name']) &&
                                    !availableModels.some(m => m.value === config['ai_model_name']) && (
                                        <option value={config['ai_model_name']} className="dark:bg-black">{config['ai_model_name']} (Actual)</option>
                                    )}
                            </select>
                        </div>
                    </div>

                    <div className="flex gap-2 w-full sm:w-auto">
                        <Button
                            onClick={handleRefreshModels}
                            isLoading={loading === 'refresh_models'}
                            variant="secondary"
                            icon={Sparkles}
                            className="flex-1 sm:flex-none"
                        >
                            Refrescar
                        </Button>
                        <Button
                            onClick={() => handleSave('ai_model_name', 'Modelo')}
                            isLoading={loading === 'ai_model_name'}
                            icon={Save}
                            className="flex-1 sm:flex-none shadow-apple-glow"
                        >
                            Guardar
                        </Button>
                    </div>
                </div>
            </div>

            {/* --- UNIFIED PROMPT EDITOR --- */}
            <div className="glass-panel rounded-[2rem] overflow-hidden shadow-apple-sm flex flex-col md:flex-row min-h-[600px]">

                {/* Sidebar / Tabs */}
                <div className="w-full md:w-80 bg-gray-50/50 dark:bg-white/5 border-b md:border-b-0 md:border-r border-gray-200 dark:border-white/10 p-4 space-y-2">
                    <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest px-4 mb-4 mt-2">Prompts del Sistema</h3>

                    {PROMPT_TYPES.map((type) => {
                        const Icon = type.icon;
                        const isActive = activePromptTab === type.id;
                        return (
                            <button
                                key={type.id}
                                onClick={() => setActivePromptTab(type.id)}
                                className={cn(
                                    "w-full text-left p-3 rounded-xl transition-all flex items-center gap-3 group relative overflow-hidden",
                                    isActive
                                        ? "bg-white dark:bg-white/10 shadow-sm ring-1 ring-black/5 dark:ring-white/10"
                                        : "hover:bg-black/5 dark:hover:bg-white/5"
                                )}
                            >
                                <div className={cn("p-2 rounded-lg shrink-0 transition-colors", type.color)}>
                                    <Icon size={18} />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className={cn("font-bold text-sm truncate", isActive ? "text-gray-900 dark:text-white" : "text-gray-600 dark:text-gray-400")}>
                                        {type.label}
                                    </div>
                                    <div className="text-[10px] text-gray-400 truncate leading-tight">
                                        {type.desc}
                                    </div>
                                </div>
                                {isActive && (
                                    <div className="absolute right-0 top-0 bottom-0 w-1 bg-ios-blue rounded-l-full" />
                                )}
                            </button>
                        );
                    })}
                </div>

                {/* Editor Area */}
                <div className="flex-1 flex flex-col bg-white dark:bg-transparent">
                    <div className="p-6 border-b border-gray-100 dark:border-white/5 flex justify-between items-center bg-white/50 dark:bg-transparent backdrop-blur-sm sticky top-0 z-10">
                        <div className="flex items-center gap-3">
                            <div className={cn("p-2 rounded-lg", activePrompt.color)}>
                                <activePrompt.icon size={20} />
                            </div>
                            <div>
                                <h1 className="font-bold text-lg text-gray-900 dark:text-white">{activePrompt.label}</h1>
                                <p className="text-xs text-gray-500">Editando configuración de {activePrompt.label.toLowerCase()}</p>
                            </div>
                        </div>
                        <div className="flex gap-2">
                            <Button variant="ghost" size="sm" icon={History} onClick={() => openHistory(activePromptTab)} />
                            <Button
                                onClick={() => handleSave(activePromptTab, activePrompt.label)}
                                isLoading={loading === activePromptTab}
                                icon={Save}
                                className="shadow-apple-glow"
                            >
                                Guardar Cambios
                            </Button>
                        </div>
                    </div>

                    <div className="flex-1 p-6 relative">
                        <textarea
                            value={config[activePromptTab] || ''}
                            onChange={(e) => handleChange(activePromptTab, e.target.value)}
                            className="w-full h-full min-h-[400px] bg-gray-50 dark:bg-black/20 rounded-xl p-6 font-mono text-xs leading-relaxed resize-none focus:outline-none focus:ring-2 focus:ring-ios-blue/50 border-0 text-gray-800 dark:text-gray-200"
                            placeholder={`Escribe aquí el ${activePrompt.label.toLowerCase()}...`}
                            spellCheck={false}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}
