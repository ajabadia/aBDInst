'use client';

import { useState, useEffect } from 'react';
// import { Instrument } from '@/types';
import { ArrowLeft, Search, Check, EyeOff, Edit2, Loader2, ExternalLink, Archive } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { toast } from 'sonner';
import { getAllInstrumentsAdmin, setInstrumentStatus } from '@/actions/admin';
import Image from 'next/image';

export default function AdminCatalogPage() {
    const [instruments, setInstruments] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<'all' | 'published' | 'draft'>('all');
    const [search, setSearch] = useState('');

    const loadInstruments = async () => {
        setLoading(true);
        const res = await getAllInstrumentsAdmin(filter, search);
        if (res.success && res.data) {
            setInstruments(res.data);
        } else {
            toast.error('Error cargando catálogo');
        }
        setLoading(false);
    };

    useEffect(() => {
        const timeout = setTimeout(loadInstruments, 300);
        return () => clearTimeout(timeout);
    }, [filter, search]);

    const handleStatusChange = async (id: string, newStatus: 'published' | 'draft' | 'archived') => {
        const toastId = toast.loading('Actualizando...');
        const res = await setInstrumentStatus(id, newStatus);

        if (res.success) {
            toast.success('Estado actualizado', { id: toastId });
            // Optimistic update or reload
            setInstruments(prev => prev.map(i => i._id === id ? { ...i, status: newStatus } : i));
        } else {
            toast.error(res.error || 'Error', { id: toastId });
        }
    };

    return (
        <div className="max-w-7xl mx-auto px-6 space-y-8 pb-20 pt-12">
            <div>
                <Link href="/dashboard/admin" className="flex items-center text-gray-500 hover:text-gray-900 dark:hover:text-white mb-6 transition-colors">
                    <ArrowLeft size={16} className="mr-2" /> Volver al Panel
                </Link>
                <div className="flex justify-between items-end">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight mb-2">Gestión del Catálogo</h1>
                        <p className="text-gray-500">Administra todos los instrumentos, activa borradores y modera contenido.</p>
                    </div>
                </div>
            </div>

            {/* Toolbar */}
            <div className="flex gap-4 items-center bg-white dark:bg-white/5 p-4 rounded-2xl border border-gray-200 dark:border-white/10">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input
                        type="text"
                        placeholder="Buscar por marca, modelo..."
                        className="w-full bg-transparent pl-10 pr-4 py-2 outline-none"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
                <div className="h-6 w-px bg-gray-200 dark:bg-white/10" />
                <div className="flex gap-2">
                    <Button
                        variant={filter === 'all' ? 'primary' : 'ghost'}
                        onClick={() => setFilter('all')}
                        size="sm"
                    >
                        Todos
                    </Button>
                    <Button
                        variant={filter === 'published' ? 'primary' : 'ghost'}
                        onClick={() => setFilter('published')}
                        size="sm"
                    >
                        Publicados
                    </Button>
                    <Button
                        variant={filter === 'draft' ? 'primary' : 'ghost'}
                        onClick={() => setFilter('draft')}
                        size="sm"
                    >
                        Borradores
                    </Button>
                </div>
            </div>

            {/* List */}
            <div className="bg-white dark:bg-white/5 rounded-2xl border border-gray-200 dark:border-white/10 overflow-hidden min-h-[400px]">
                {loading ? (
                    <div className="flex items-center justify-center h-64">
                        <Loader2 className="animate-spin text-gray-400" />
                    </div>
                ) : (
                    <div className="divide-y divide-gray-100 dark:divide-white/5">
                        {instruments.length === 0 ? (
                            <div className="p-12 text-center text-gray-400">No se encontraron instrumentos</div>
                        ) : (
                            instruments.map((inst) => (
                                <div key={inst._id} className="p-4 flex items-center gap-4 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors group">
                                    <div className="w-16 h-16 bg-gray-100 dark:bg-black/20 rounded-lg overflow-hidden shrink-0 relative">
                                        {inst.genericImages?.[0] ? (
                                            <Image src={inst.genericImages[0]} fill alt={inst.model} className="object-cover" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-[10px] text-gray-400">Sin img</div>
                                        )}
                                    </div>

                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${inst.status === 'published' ? 'bg-green-100 text-green-700' :
                                                inst.status === 'draft' ? 'bg-gray-100 text-gray-600' :
                                                    'bg-red-100 text-red-600'
                                                }`}>
                                                {inst.status}
                                            </span>
                                            <span className="text-xs text-gray-400">{inst.type}</span>
                                        </div>
                                        <h4 className="font-bold text-gray-900 dark:text-white truncate">{inst.brand} {inst.model}</h4>
                                        <p className="text-xs text-gray-500 truncate">ID: {inst._id}</p>
                                    </div>

                                    <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <Link href={`/instruments/${inst._id}`} target='_blank'>
                                            <Button size="sm" variant="ghost" className="h-8 w-8 p-0"><ExternalLink size={14} /></Button>
                                        </Link>

                                        <Link href={`/instruments/${inst._id}/edit`}>
                                            <Button size="sm" variant="ghost" className="h-8 w-8 p-0"><Edit2 size={14} /></Button>
                                        </Link>

                                        {inst.status === 'draft' && (
                                            <Button
                                                size="sm"
                                                className="bg-green-600 hover:bg-green-700 text-white h-8 text-xs"
                                                onClick={() => handleStatusChange(inst._id, 'published')}
                                            >
                                                <Check size={14} className="mr-1" /> Activar
                                            </Button>
                                        )}

                                        {inst.status === 'published' && (
                                            <Button
                                                size="sm"
                                                variant="secondary"
                                                className="h-8 text-xs"
                                                onClick={() => handleStatusChange(inst._id, 'draft')}
                                            >
                                                <EyeOff size={14} className="mr-1" /> Borrador
                                            </Button>
                                        )}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
