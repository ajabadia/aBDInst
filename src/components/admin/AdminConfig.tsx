'use client';

import { useState } from 'react';
import { updateSystemConfig } from '@/actions/admin';
import { Button } from '@/components/ui/Button';
import { toast } from 'sonner';
import { Save, Bot, Cpu, Globe, RotateCcw } from 'lucide-react';

interface AdminConfigProps {
    configs: any[];
}

export default function AdminConfig({ configs }: AdminConfigProps) {
    const getValue = (key: string, def: string) => configs.find(c => c.key === key)?.value || def;

    const DEFAULT_SYSTEM = `As a world-class musical instrument expert and data archivist, analyze the provided input (image or text) to extract an EXHAUSTIVE technical profile...`;
    const DEFAULT_BULK = "You are an expert instrument appraiser. Parse the raw list into a JSON ARRAY of objects with brand, model, type, year, description.";

    const [modelName, setModelName] = useState(getValue('ai_model_name', 'gemini-1.5-flash'));
    const [systemPrompt, setSystemPrompt] = useState(getValue('ai_system_prompt', DEFAULT_SYSTEM));
    const [bulkPrompt, setBulkPrompt] = useState(getValue('ai_bulk_prompt', DEFAULT_BULK));
    const [scraperProxy, setScraperProxy] = useState(getValue('scraper_proxy_url', ''));
    const [loading, setLoading] = useState(false);

    const handleSave = async () => {
        setLoading(true);
        try {
            await Promise.all([
                updateSystemConfig('ai_model_name', modelName),
                updateSystemConfig('ai_system_prompt', systemPrompt),
                updateSystemConfig('ai_bulk_prompt', bulkPrompt),
                updateSystemConfig('scraper_proxy_url', scraperProxy)
            ]);
            toast.success('Configuración guardada');
        } catch (error) {
            toast.error('Error al guardar');
        } finally {
            setLoading(false);
        }
    };

    const resetDefaults = () => {
        setSystemPrompt(DEFAULT_SYSTEM);
        setBulkPrompt(DEFAULT_BULK);
        setModelName('gemini-1.5-flash');
        setScraperProxy('');
    };

    return (
        <div className="p-8 space-y-10">
            
            {/* Scraping Proxy Section */}
            <section className="space-y-4">
                <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 bg-ios-blue/10 text-ios-blue rounded-xl">
                        <Globe size={18} />
                    </div>
                    <h3 className="text-lg font-bold tracking-tight">Proxy & Conectividad</h3>
                </div>
                
                <div className="bg-ios-blue/5 border border-ios-blue/10 rounded-2xl p-6">
                    <label className="apple-label !mb-3">Proxy de Scraping (Anti-Bloqueo)</label>
                    <input
                        type="text"
                        value={scraperProxy}
                        onChange={(e) => setScraperProxy(e.target.value)}
                        className="apple-input-field font-mono text-xs mb-3"
                        placeholder="http://user:pass@host:port"
                    />
                    <p className="text-xs text-ios-blue font-medium">
                        Necesario para actualizaciones automáticas de precio en Reverb y eBay sin ser bloqueado.
                    </p>
                </div>
            </section>

            {/* AI Model Section */}
            <section className="space-y-6">
                <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 bg-ios-indigo/10 text-ios-indigo rounded-xl">
                        <Cpu size={18} />
                    </div>
                    <h3 className="text-lg font-bold tracking-tight">Modelo de Lenguaje</h3>
                </div>

                <div className="grid grid-cols-1 gap-8">
                    <div className="space-y-3">
                        <label className="apple-label">Motor Gemini</label>
                        <input
                            type="text"
                            value={modelName}
                            onChange={(e) => setModelName(e.target.value)}
                            className="apple-input-field font-mono text-sm"
                            placeholder="gemini-1.5-flash"
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-3">
                            <label className="apple-label">Prompt del Sistema (Análisis)</label>
                            <textarea
                                value={systemPrompt}
                                onChange={(e) => setSystemPrompt(e.target.value)}
                                className="apple-input-field min-h-[300px] font-mono text-[11px] leading-relaxed resize-none"
                            />
                        </div>
                        <div className="space-y-3">
                            <label className="apple-label">Prompt de Importación Masiva</label>
                            <textarea
                                value={bulkPrompt}
                                onChange={(e) => setBulkPrompt(e.target.value)}
                                className="apple-input-field min-h-[300px] font-mono text-[11px] leading-relaxed resize-none"
                            />
                        </div>
                    </div>
                </div>
            </section>

            {/* Footer Actions */}
            <div className="flex justify-between items-center pt-8 border-t border-black/5 dark:border-white/5">
                <Button
                    onClick={resetDefaults}
                    variant="ghost"
                    icon={RotateCcw}
                    className="text-gray-400 hover:text-ios-red"
                >
                    Restablecer valores
                </Button>
                
                <div className="flex gap-3">
                    <Button
                        onClick={handleSave}
                        isLoading={loading}
                        icon={Save}
                        className="shadow-apple-glow"
                    >
                        {loading ? 'Guardando...' : 'Guardar Cambios'}
                    </Button>
                </div>
            </div>
        </div>
    );
}
