'use client';

import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Circle, ShoppingBag, Wrench, Activity, TrendingUp, StickyNote, MapPin } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TimelineEvent {
    date: string | Date; // Date from DB comes as string often in client components if serialized
    type: string;
    title: string;
    description?: string;
}

interface ActivityTimelineProps {
    events?: TimelineEvent[];
    acquisition?: { date?: Date | string };
}

const ICONS: Record<string, any> = {
    acquisition: ShoppingBag,
    maintenance: Wrench,
    status_change: Activity,
    market_value: TrendingUp,
    note: StickyNote,
    performance: Circle,
    default: Circle
};

const COLORS: Record<string, string> = {
    acquisition: 'bg-green-100 text-green-600',
    maintenance: 'bg-orange-100 text-orange-600',
    status_change: 'bg-blue-100 text-blue-600',
    market_value: 'bg-purple-100 text-purple-600',
    note: 'bg-gray-100 text-gray-600',
    default: 'bg-gray-100 text-gray-400'
};

export default function ActivityTimeline({ events = [], acquisition }: ActivityTimelineProps) {

    // Merge real events with synthetic acquisition event if needed
    const allEvents = [...events];

    // Check if we need to synthesize acquisition event (if not already in events)
    const hasAcquisitionEvent = events.some(e => e.type === 'acquisition');
    if (!hasAcquisitionEvent && acquisition?.date) {
        allEvents.push({
            type: 'acquisition',
            title: 'Adquisición',
            date: acquisition.date,
            description: 'El instrumento entró en la colección.'
        });
    }

    // Sort by date descending (newest first)
    allEvents.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    if (allEvents.length === 0) {
        return (
            <div className="text-center py-8 text-sm text-gray-400 italic">
                No hay actividad registrada aún.
            </div>
        );
    }

    return (
        <div className="relative pl-4 border-l border-gray-200 dark:border-gray-800 space-y-8 my-6">
            {allEvents.map((event, idx) => {
                const Icon = ICONS[event.type] || ICONS['default'];
                const colorClass = COLORS[event.type] || COLORS['default'];

                // Special Icon for "Movimiento" (Location change is marked as 'note' but title is 'Movimiento')
                const DisplayIcon = (event.type === 'note' && event.title === 'Movimiento') ? MapPin : Icon;

                return (
                    <div key={idx} className="relative group">
                        {/* Dot */}
                        <div className={cn(
                            "absolute -left-[25px] mt-1 w-6 h-6 rounded-full flex items-center justify-center border-2 border-white dark:border-gray-900 shadow-sm",
                            colorClass
                        )}>
                            <DisplayIcon size={12} />
                        </div>

                        {/* Content */}
                        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-baseline gap-1">
                            <div>
                                <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100">{event.title}</h4>
                                {event.description && (
                                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{event.description}</p>
                                )}
                            </div>
                            <time className="text-[10px] text-gray-400 uppercase tracking-wider font-medium whitespace-nowrap">
                                {format(new Date(event.date), "d MMM yyyy", { locale: es })}
                            </time>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
