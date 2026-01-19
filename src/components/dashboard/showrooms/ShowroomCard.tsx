'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Eye, Edit, Layout } from 'lucide-react';

interface ShowroomCardProps {
    showroom: any;
}

export default function ShowroomCard({ showroom }: ShowroomCardProps) {
    return (
        <div className="group apple-card bg-white dark:bg-white/5 overflow-hidden flex flex-col h-full hover:shadow-apple-lg transition-all duration-300">
            {/* Preview Banner */}
            <div className={`h-32 w-full ${showroom.theme === 'dark' ? 'bg-gray-900' : 'bg-gray-100'} relative flex items-center justify-center overflow-hidden`}>
                {showroom.coverImage ? (
                    <div className="absolute inset-0">
                        {/* We use standard img for simple cards or Next Image with fill */}
                        <img src={showroom.coverImage} alt={showroom.name} className="w-full h-full object-cover" />
                    </div>
                ) : (
                    <Layout className="text-black/10 dark:text-white/10 w-16 h-16" />
                )}

                {showroom.items && showroom.items.length > 0 && (
                    <div className="absolute bottom-3 right-3 bg-black/50 text-white text-xs font-bold px-2 py-1 rounded-full backdrop-blur-md z-10">
                        {showroom.items.length} ítems
                    </div>
                )}
            </div>

            <div className="p-6 flex-grow space-y-4">
                <div>
                    <h3 className="text-xl font-bold truncate">{showroom.name}</h3>
                    <p className="text-sm text-gray-500 line-clamp-2 min-h-[2.5em]">
                        {showroom.description || "Sin descripción"}
                    </p>
                </div>

                <div className="flex items-center gap-3 pt-4 text-xs text-gray-400 font-medium border-t border-gray-100 dark:border-white/5">
                    <span className="flex items-center gap-1"><Eye size={14} /> {showroom.stats?.views || 0} vistas</span>
                    <span className="flex items-center gap-1 ml-auto">
                        {new Date(showroom.createdAt).toLocaleDateString()}
                    </span>
                </div>
            </div>

            <div className="p-4 bg-gray-50 dark:bg-black/20 flex items-center gap-2">
                <Link href={`/s/${showroom.slug}`} target="_blank" className="flex-1">
                    <Button variant="secondary" className="w-full text-xs h-9 justify-center" icon={Eye}>
                        Ver
                    </Button>
                </Link>
                <Link href={`/dashboard/showrooms/${showroom._id}`} className="flex-1">
                    <Button className="w-full text-xs h-9 justify-center" icon={Edit}>
                        Editar
                    </Button>
                </Link>
            </div>
        </div>
    );
}
