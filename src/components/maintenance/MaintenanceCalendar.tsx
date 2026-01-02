'use client';

import Link from 'next/link';
import { formatDistanceToNow, isPast, isSameMonth, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import { Wrench, AlertCircle, CheckCircle, Clock } from 'lucide-react';

interface MaintenanceItem {
    _id: string;
    instrumentId: {
        _id: string;
        brand: string;
        model: string;
        images: string[];
        genericImages: string[];
    };
    nextMaintenanceDate: string;
    maintenanceInterval: string;
    maintenanceNotes?: string;
}

interface MaintenanceCalendarProps {
    items: MaintenanceItem[];
}

export default function MaintenanceCalendar({ items }: MaintenanceCalendarProps) {
    // Group by status
    const overdue = items.filter(i => isPast(new Date(i.nextMaintenanceDate)) && !isSameDate(new Date(i.nextMaintenanceDate), new Date()));
    const upcoming = items.filter(i => !isPast(new Date(i.nextMaintenanceDate)) || isSameDate(new Date(i.nextMaintenanceDate), new Date()));

    const renderItem = (item: MaintenanceItem, status: 'overdue' | 'upcoming') => {
        const date = new Date(item.nextMaintenanceDate);
        return (
            <Link
                href={`/dashboard/collection/${item._id}`}
                key={item._id}
                className={`flex items-start gap-4 p-4 rounded-2xl border transition-all hover:shadow-md ${status === 'overdue'
                        ? 'bg-red-50 border-red-100 dark:bg-red-900/10 dark:border-red-900/30'
                        : 'bg-white dark:bg-gray-800 border-gray-100 dark:border-gray-700'
                    }`}
            >
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${status === 'overdue' ? 'bg-red-100 text-red-600 dark:bg-red-900/50 dark:text-red-400' : 'bg-blue-100 text-blue-600 dark:bg-blue-900/50 dark:text-blue-400'
                    }`}>
                    <Wrench size={20} />
                </div>

                <div className="flex-1 min-w-0">
                    <h4 className="font-bold text-gray-900 dark:text-white truncate">
                        {item.instrumentId.brand} {item.instrumentId.model}
                    </h4>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5 line-clamp-1">
                        {item.maintenanceNotes || "Mantenimiento regular programado"}
                    </p>
                    <div className="flex items-center gap-2 mt-2 text-xs font-medium">
                        <span className={`flex items-center gap-1 ${status === 'overdue' ? 'text-red-600 dark:text-red-400' : 'text-gray-500'}`}>
                            <Clock size={12} />
                            {status === 'overdue' ? 'Venció ' : 'Vence '}
                            {formatDistanceToNow(date, { addSuffix: true, locale: es })}
                        </span>
                        {item.maintenanceInterval !== 'none' && (
                            <span className="px-2 py-0.5 bg-gray-100 dark:bg-gray-700 rounded text-gray-500">
                                Repite: {item.maintenanceInterval}
                            </span>
                        )}
                    </div>
                </div>
            </Link>
        );
    };

    return (
        <div className="space-y-8">
            {/* Overdue Section */}
            {overdue.length > 0 && (
                <div>
                    <h3 className="text-lg font-bold text-red-600 flex items-center gap-2 mb-4">
                        <AlertCircle size={20} />
                        Pendientes y Vencidos
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {overdue.map(i => renderItem(i, 'overdue'))}
                    </div>
                </div>
            )}

            {/* Upcoming Section */}
            <div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2 mb-4">
                    <CheckCircle size={20} className="text-green-500" />
                    Próximamente
                </h3>
                {upcoming.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {upcoming.map(i => renderItem(i, 'upcoming'))}
                    </div>
                ) : (
                    <div className="text-center py-12 bg-gray-50 dark:bg-gray-800/50 rounded-2xl border border-dashed border-gray-200 dark:border-gray-700">
                        <p className="text-gray-500">No hay mantenimientos programados para el futuro cercano.</p>
                    </div>
                )}
            </div>
        </div>
    );
}

function isSameDate(d1: Date, d2: Date) {
    return d1.getFullYear() === d2.getFullYear() &&
        d1.getMonth() === d2.getMonth() &&
        d1.getDate() === d2.getDate();
}
