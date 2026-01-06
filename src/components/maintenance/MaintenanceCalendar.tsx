'use client';

import Link from 'next/link';
import { formatDistanceToNow, isPast, isSameMonth } from 'date-fns';
import { es } from 'date-fns/locale';
import { Wrench, AlertCircle, CheckCircle, Clock, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

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
    const isSameDate = (d1: Date, d2: Date) => 
        d1.getFullYear() === d2.getFullYear() &&
        d1.getMonth() === d2.getMonth() &&
        d1.getDate() === d2.getDate();

    const overdue = items.filter(i => isPast(new Date(i.nextMaintenanceDate)) && !isSameDate(new Date(i.nextMaintenanceDate), new Date()));
    const upcoming = items.filter(i => !isPast(new Date(i.nextMaintenanceDate)) || isSameDate(new Date(i.nextMaintenanceDate), new Date()));

    const renderItem = (item: MaintenanceItem, status: 'overdue' | 'upcoming') => {
        const date = new Date(item.nextMaintenanceDate);
        return (
            <Link
                href={`/dashboard/collection/${item._id}`}
                key={item._id}
                className={cn(
                    "apple-card p-5 flex items-center gap-5 group hover:border-ios-blue/30",
                    status === 'overdue' ? "bg-ios-red/[0.03] border-ios-red/10" : "bg-white dark:bg-white/5"
                )}
            >
                {/* Icon Circle */}
                <div className={cn(
                    "w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 transition-transform group-hover:rotate-12",
                    status === 'overdue' 
                        ? "bg-ios-red text-white shadow-lg shadow-ios-red/20" 
                        : "bg-ios-orange/10 text-ios-orange"
                )}>
                    <Wrench size={24} />
                </div>

                <div className="flex-1 min-w-0">
                    <h4 className="font-bold text-gray-900 dark:text-white truncate text-lg tracking-tight">
                        {item.instrumentId.brand} {item.instrumentId.model}
                    </h4>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5 line-clamp-1 font-medium">
                        {item.maintenanceNotes || "Revisión técnica periódica"}
                    </p>
                    
                    <div className="flex items-center gap-3 mt-3">
                        <div className={cn(
                            "flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider",
                            status === 'overdue' ? "bg-ios-red text-white" : "bg-black/5 dark:bg-white/10 text-gray-500"
                        )}>
                            <Clock size={12} />
                            {formatDistanceToNow(date, { addSuffix: true, locale: es })}
                        </div>
                        
                        {item.maintenanceInterval && item.maintenanceInterval !== 'none' && (
                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-2 py-1 bg-black/5 dark:bg-white/10 rounded-full">
                                Cada {item.maintenanceInterval}
                            </span>
                        )}
                    </div>
                </div>

                <ChevronRight className="text-gray-300 group-hover:text-ios-blue group-hover:translate-x-1 transition-all" size={20} />
            </Link>
        );
    };

    return (
        <div className="p-8 space-y-16">
            {/* Overdue Section */}
            {overdue.length > 0 && (
                <section>
                    <div className="flex items-center gap-3 mb-8">
                        <AlertCircle className="text-ios-red" size={22} />
                        <h3 className="text-2xl font-bold tracking-tight text-ios-red">Vencidos</h3>
                        <div className="h-[2px] flex-1 bg-ios-red/5" />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {overdue.map(i => renderItem(i, 'overdue'))}
                    </div>
                </section>
            )}

            {/* Upcoming Section */}
            <section>
                <div className="flex items-center gap-3 mb-8">
                    <CheckCircle className="text-ios-green" size={22} />
                    <h3 className="text-2xl font-bold tracking-tight">Programados</h3>
                    <div className="h-[2px] flex-1 bg-black/5 dark:bg-white/5" />
                </div>
                {upcoming.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {upcoming.map(i => renderItem(i, 'upcoming'))}
                    </div>
                ) : (
                    <div className="glass-panel rounded-[2rem] py-20 text-center border-dashed border-2">
                        <Wrench className="w-12 h-12 mx-auto mb-4 text-gray-300 opacity-50" />
                        <p className="text-gray-500 font-medium text-lg">No hay mantenimientos futuros.</p>
                    </div>
                )}
            </section>
        </div>
    );
}
