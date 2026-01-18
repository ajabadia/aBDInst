
'use client';

import { useState, useEffect } from 'react';
import { getBadges, deleteBadge } from '@/actions/badge';
import { Button } from '@/components/ui/Button';
import { Plus, Trash2, Edit } from 'lucide-react';
import BadgeEditor from './BadgeEditor';
import { toast } from 'sonner';

export default function BadgeManager() {
    const [badges, setBadges] = useState<any[]>([]);
    const [isEditorOpen, setIsEditorOpen] = useState(false);
    const [selectedBadge, setSelectedBadge] = useState<any>(null);

    const loadBadges = async () => {
        const data = await getBadges();
        setBadges(data);
    };

    useEffect(() => {
        loadBadges();
    }, []);

    const handleDelete = async (id: string) => {
        if (confirm('¿Seguro que quieres borrar este trofeo?')) {
            const res = await deleteBadge(id);
            if (res.success) {
                toast.success('Borrado');
                loadBadges();
            } else {
                toast.error('Error al borrar');
            }
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold">Gestión de Trofeos</h2>
                <Button onClick={() => { setSelectedBadge(null); setIsEditorOpen(true); }} className="bg-ios-blue text-white">
                    <Plus size={16} /> Nuevo Trofeo
                </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {badges.map(badge => (
                    <div key={badge._id} className="apple-card p-4 flex items-center gap-4 group">
                        <div className="w-16 h-16 rounded-2xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center overflow-hidden shadow-inner">
                            {badge.imageUrl ? (
                                <img src={badge.imageUrl} alt={badge.name} className="w-full h-full object-cover" />
                            ) : (
                                <span className="text-2xl">🏆</span>
                            )}
                        </div>
                        <div className="flex-1">
                            <h3 className="font-bold text-gray-900 dark:text-white">{badge.name}</h3>
                            <p className="text-xs text-gray-500 truncate">{badge.description}</p>
                            <span className="text-[10px] uppercase font-mono bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 rounded text-gray-600 dark:text-gray-400 mt-1 inline-block">
                                {badge.code}
                            </span>
                        </div>
                        <div className="flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                                onClick={() => { setSelectedBadge(badge); setIsEditorOpen(true); }}
                                className="p-2 hover:bg-blue-50 dark:hover:bg-blue-900/30 text-blue-600 rounded-lg"
                            >
                                <Edit size={14} />
                            </button>
                            <button
                                onClick={() => handleDelete(badge._id)}
                                className="p-2 hover:bg-red-50 dark:hover:bg-red-900/30 text-red-600 rounded-lg"
                            >
                                <Trash2 size={14} />
                            </button>
                        </div>
                    </div>
                ))}

                {badges.length === 0 && (
                    <div className="col-span-full py-12 text-center text-gray-400">
                        No hay trofeos creados aún. ¡Crea el primero!
                    </div>
                )}
            </div>

            {isEditorOpen && (
                <BadgeEditor
                    badge={selectedBadge}
                    onClose={() => setIsEditorOpen(false)}
                    onSave={() => {
                        loadBadges(); // Reload list
                    }}
                />
            )}
        </div>
    );
}
