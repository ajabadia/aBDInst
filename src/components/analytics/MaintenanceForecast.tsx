'use client';

import { Calendar, AlertCircle, CheckCircle2, Wrench } from 'lucide-react';
import { formatDistanceToNow, addDays, isPast, isFuture } from 'date-fns';
import { es } from 'date-fns/locale';
import Link from 'next/link';

interface MaintenanceForecastProps {
    collection: any[];
}

export default function MaintenanceForecast({ collection }: MaintenanceForecastProps) {
    // 1. Find items with nextMaintenanceDate
    const upcoming = collection
        .filter(item => item.nextMaintenanceDate && item.status === 'active')
        .map(item => {
            const date = new Date(item.nextMaintenanceDate);
            return {
                id: item._id,
                name: `${item.instrument?.brand} ${item.instrument?.model}`,
                date: date,
                isOverdue: isPast(date) && !new Date().toDateString().includes(date.toDateString()), // Simple check
                daysUntil: Math.ceil((date.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
            };
        })
        .sort((a, b) => a.date.getTime() - b.date.getTime())
        .slice(0, 5); // Show top 5

    if (upcoming.length === 0) {
        return (
            <div className="bg-white/40 dark:bg-black/20 backdrop-blur-md rounded-[2rem] border border-gray-200/50 dark:border-white/10 p-6 flex flex-col items-center justify-center text-center">
                <CheckCircle2 size={40} className="text-green-500 mb-2 opacity-50" />
                <h3 className="font-bold text-gray-900 dark:text-white">Todo en orden</h3>
                <p className="text-sm text-gray-500">No hay mantenimientos programados próximamente.</p>
            </div>
        );
    }

    return (
        <div className="bg-white/40 dark:bg-black/20 backdrop-blur-md rounded-[2rem] border border-gray-200/50 dark:border-white/10 p-6">
            <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                <Wrench size={20} className="text-orange-500" />
                Mantenimiento
            </h3>

            <div className="relative border-l border-gray-200 dark:border-gray-700 ml-3 space-y-6">
                {upcoming.map((item) => (
                    <div key={item.id} className="relative pl-6">
                        {/* Dot on timeline */}
                        <div className={`absolute -left-[5px] top-1.5 w-2.5 h-2.5 rounded-full border-2 border-white dark:border-black ${item.isOverdue ? 'bg-red-500' : 'bg-blue-500'}`}></div>

                        <Link href={`/instruments/${item.id}`} className="block group">
                            <div className="flex justify-between items-start">
                                <div>
                                    <p className="font-medium text-sm text-gray-900 dark:text-gray-100 group-hover:text-blue-600 transition-colors">
                                        {item.name}
                                    </p>
                                    <p className="text-xs text-gray-500">
                                        {item.date.toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' })}
                                    </p>
                                </div>

                                <span className={`text-xs font-bold px-2 py-1 rounded-full ${item.isOverdue
                                        ? 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400'
                                        : 'bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400'
                                    }`}>
                                    {item.isOverdue ? 'Vencido' : `${item.daysUntil} días`}
                                </span>
                            </div>
                        </Link>
                    </div>
                ))}
            </div>
        </div>
    );
}
