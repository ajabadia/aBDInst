'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { setFeaturedArticle } from '@/actions/home';
import { Check, Star } from 'lucide-react';
import { toast } from 'sonner';
import Image from 'next/image';

export default function FeaturedContentClient({ initialFeaturedId, articles }: any) {
    const [selectedId, setSelectedId] = useState(initialFeaturedId || '');
    const [isLoading, setIsLoading] = useState(false);

    const handleSave = async () => {
        setIsLoading(true);
        const res = await setFeaturedArticle(selectedId);
        if (res.success) {
            toast.success("Portada actualizada");
        } else {
            toast.error(res.error || "Error al actualizar");
        }
        setIsLoading(false);
    };

    return (
        <div className="space-y-8">
            <div className="bg-white dark:bg-white/5 p-6 rounded-2xl border border-gray-200 dark:border-white/10">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold flex items-center gap-2">
                        <Star className="text-ios-blue" />
                        Artículo Destacado Actual
                    </h2>
                    <Button onClick={handleSave} disabled={isLoading || selectedId === initialFeaturedId}>
                        {isLoading ? 'Guardando...' : 'Publicar en Home'}
                    </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {articles.map((article: any) => (
                        <div
                            key={article._id}
                            onClick={() => setSelectedId(article._id)}
                            className={`
                                cursor-pointer group relative overflow-hidden rounded-xl border-2 transition-all p-3 flex gap-3
                                ${selectedId === article._id
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
                            {selectedId === article._id && (
                                <div className="absolute top-2 right-2 w-5 h-5 bg-ios-blue text-white rounded-full flex items-center justify-center">
                                    <Check size={12} />
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
