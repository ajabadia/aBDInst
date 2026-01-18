'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { setFeaturedArticle } from '@/actions/home';
import { updateSystemConfig } from '@/actions/admin';
import { Check, Star, LayoutTemplate, MonitorPlay } from 'lucide-react';
import { toast } from 'sonner';
import Image from 'next/image';
import { Switch } from '@/components/ui/Switch'; // Assuming Switch exists, if not I'll check or make a simple one.

export default function FeaturedContentClient({ initialFeaturedId, initialSettings, articles, exhibitions }: any) {
    const [selectedArticleId, setSelectedArticleId] = useState(initialFeaturedId || '');

    // Global Landing Settings
    const [heroEnabled, setHeroEnabled] = useState(initialSettings?.heroEnabled ?? true);
    const [selectedExhibitionId, setSelectedExhibitionId] = useState(initialSettings?.featuredExhibitionId || '');

    const [isLoading, setIsLoading] = useState(false);

    const handleSave = async () => {
        setIsLoading(true);

        // 1. Save Featured Article (Legacy Action)
        const articleRes = await setFeaturedArticle(selectedArticleId);

        // 2. Save Global Settings (System Config)
        const configRes = await updateSystemConfig('landing_settings', {
            heroEnabled,
            featuredExhibitionId: selectedExhibitionId
        });

        if (articleRes.success && configRes.success) {
            toast.success("Portada actualizada correctamente");
        } else {
            toast.error("Error al actualizar la portada");
        }
        setIsLoading(false);
    };

    return (
        <div className="space-y-8 pb-20">

            {/* Action Bar */}
            <div className="sticky top-4 z-10 flex justify-end">
                <Button onClick={handleSave} disabled={isLoading} className="shadow-xl shadow-ios-blue/20">
                    {isLoading ? 'Guardando...' : 'Guardar Cambios'}
                </Button>
            </div>

            {/* 1. Global Settings (Hero) */}
            <section className="bg-white dark:bg-white/5 p-6 rounded-2xl border border-gray-200 dark:border-white/10 space-y-6">
                <h2 className="text-xl font-bold flex items-center gap-2">
                    <LayoutTemplate className="text-purple-500" />
                    Configuración Global
                </h2>

                <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-black/20 rounded-xl">
                    <div>
                        <h4 className="font-bold text-gray-900 dark:text-white">Sección Hero</h4>
                        <p className="text-sm text-gray-500">Mostrar banner principal grande en la home.</p>
                    </div>
                    {/* Placeholder for Switch if doesn't exist, using basic input checkbox style tailored */}
                    <label className="relative inline-flex items-center cursor-pointer">
                        <input
                            type="checkbox"
                            className="sr-only peer"
                            checked={heroEnabled}
                            onChange={(e) => setHeroEnabled(e.target.checked)}
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                    </label>
                </div>
            </section>

            {/* 2. Featured Exhibition */}
            <section className="bg-white dark:bg-white/5 p-6 rounded-2xl border border-gray-200 dark:border-white/10 space-y-6">
                <h2 className="text-xl font-bold flex items-center gap-2">
                    <MonitorPlay className="text-ios-green" />
                    Exhibición Principal
                </h2>
                <p className="text-sm text-gray-500 -mt-4">Selecciona una exhibición para promocionar arriba.</p>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                    <div
                        onClick={() => setSelectedExhibitionId('')}
                        className={`cursor-pointer p-4 rounded-xl border-2 flex items-center justify-center font-medium text-gray-500 transition-all ${!selectedExhibitionId ? 'border-ios-green bg-green-50 text-green-700' : 'border-dashed border-gray-200 hover:border-gray-300'}`}
                    >
                        Ninguna
                    </div>
                    {exhibitions.map((ex: any) => (
                        <div
                            key={ex._id}
                            onClick={() => setSelectedExhibitionId(ex._id)}
                            className={`
                                cursor-pointer group relative overflow-hidden rounded-xl border-2 transition-all p-3 flex gap-3 items-center
                                ${selectedExhibitionId === ex._id
                                    ? 'border-ios-green bg-ios-green/5'
                                    : 'border-transparent bg-gray-50 dark:bg-white/5 hover:border-gray-200'}
                            `}
                        >
                            <div className="w-12 h-12 bg-gray-200 rounded-lg overflow-hidden shrink-0 relative">
                                {ex.coverImage && <Image src={ex.coverImage} fill alt="cv" className="object-cover" />}
                            </div>
                            <div className="min-w-0">
                                <h4 className="font-bold text-sm truncate leading-tight">{ex.title}</h4>
                                <span className="text-xs text-gray-400 capitalize">{ex.status}</span>
                            </div>
                            {selectedExhibitionId === ex._id && (
                                <div className="absolute top-2 right-2 w-4 h-4 bg-ios-green text-white rounded-full flex items-center justify-center">
                                    <Check size={10} />
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </section>

            {/* 3. Featured Article */}
            <section className="bg-white dark:bg-white/5 p-6 rounded-2xl border border-gray-200 dark:border-white/10 space-y-6">
                <h2 className="text-xl font-bold flex items-center gap-2">
                    <Star className="text-ios-blue" />
                    Artículo Destacado
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {articles.map((article: any) => (
                        <div
                            key={article._id}
                            onClick={() => setSelectedArticleId(article._id)}
                            className={`
                                cursor-pointer group relative overflow-hidden rounded-xl border-2 transition-all p-3 flex gap-3
                                ${selectedArticleId === article._id
                                    ? 'border-ios-blue bg-ios-blue/5'
                                    : 'border-transparent bg-gray-50 dark:bg-white/5 hover:border-gray-200'}
                            `}
                        >
                            <div className="w-16 h-16 bg-gray-200 rounded-lg overflow-hidden shrink-0 relative">
                                {article.coverImage && <Image src={article.coverImage} fill alt="ci" className="object-cover" />}
                            </div>
                            <div className="min-w-0">
                                <h4 className="font-bold text-sm truncate leading-tight mb-1">{article.title}</h4>
                                <div className="flex items-center gap-2 text-xs text-gray-500">
                                    <span className={`px-1.5 py-0.5 rounded ${article.status === 'published' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                                        {article.status}
                                    </span>
                                    <span>{new Date(article.createdAt).toLocaleDateString()}</span>
                                </div>
                            </div>
                            {selectedArticleId === article._id && (
                                <div className="absolute top-2 right-2 w-5 h-5 bg-ios-blue text-white rounded-full flex items-center justify-center">
                                    <Check size={12} />
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </section>
        </div>
    );
}
