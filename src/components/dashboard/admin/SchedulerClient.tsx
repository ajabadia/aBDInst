'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { ChevronLeft, ChevronRight, Calendar, Newspaper, Trophy, Museum } from 'lucide-react';
import { cn } from '@/lib/utils';
import Link from 'next/link';

export default function SchedulerClient({ initialData, month, year }: any) {
    const router = useRouter();
    const [currentMonth, setCurrentMonth] = useState(month);
    const [currentYear, setCurrentYear] = useState(year);

    const handleMonthChange = (delta: number) => {
        let newMonth = currentMonth + delta;
        let newYear = currentYear;

        if (newMonth > 11) {
            newMonth = 0;
            newYear++;
        } else if (newMonth < 0) {
            newMonth = 11;
            newYear--;
        }

        setCurrentMonth(newMonth);
        setCurrentYear(newYear);
        router.push(`?month=${newMonth}&year=${newYear}`);
    };

    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    const monthName = new Date(currentYear, currentMonth).toLocaleString('es-ES', { month: 'long', year: 'numeric' });

    // Helper to check if an event is active on a specific day
    const getEventsForDay = (day: number) => {
        const date = new Date(currentYear, currentMonth, day);
        const dayEvents: any[] = [];

        // Check slots
        initialData.slots.forEach((s: any) => {
            const start = new Date(s.startDate);
            const end = s.endDate ? new Date(s.endDate) : new Date(2099, 0, 1); // Assume forever if null
            // Check overlap
            if (date >= new Date(start.setHours(0, 0, 0, 0)) && date <= new Date(end.setHours(23, 59, 59, 999))) {
                dayEvents.push({ type: 'slot', data: s });
            }
        });

        // Check exhibitions
        initialData.exhibitions.forEach((e: any) => {
            const start = new Date(e.startDate);
            const end = e.endDate ? new Date(e.endDate) : new Date(2099, 0, 1);
            if (date >= new Date(start.setHours(0, 0, 0, 0)) && date <= new Date(end.setHours(23, 59, 59, 999))) {
                dayEvents.push({ type: 'exhibition', data: e });
            }
        });

        return dayEvents;
    };

    return (
        <div className="space-y-6">
            {/* Controls */}
            <div className="flex items-center justify-between bg-white dark:bg-white/5 p-4 rounded-2xl border border-gray-200 dark:border-white/10">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" onClick={() => handleMonthChange(-1)}>
                        <ChevronLeft />
                    </Button>
                    <h2 className="text-xl font-bold capitalize w-48 text-center">{monthName}</h2>
                    <Button variant="ghost" size="icon" onClick={() => handleMonthChange(1)}>
                        <ChevronRight />
                    </Button>
                </div>
                <div className="flex gap-2">
                    {/* Add Event Buttons (Mock for now, would link to create forms) */}
                    <Link href="/dashboard/admin/cover">
                        <Button variant="secondary" size="sm"><Newspaper size={14} className="mr-2" /> Portada</Button>
                    </Link>
                    <Link href="/dashboard/admin/exhibitions/new">
                        <Button className="bg-purple-600 hover:bg-purple-700 text-white" size="sm">
                            <Museum size={14} className="mr-2" /> Nueva Expo
                        </Button>
                    </Link>
                </div>
            </div>

            {/* Calendar Grid */}
            <div className="bg-white dark:bg-white/5 rounded-2xl border border-gray-200 dark:border-white/10 overflow-hidden shadow-sm">
                <div className="grid grid-cols-7 border-b border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5">
                    {['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'].map(d => (
                        <div key={d} className="p-3 text-center text-xs font-bold text-gray-500 uppercase">{d}</div>
                    ))}
                </div>

                <div className="grid grid-cols-7 auto-rows-[minmax(120px,auto)] divide-x divide-gray-200 dark:divide-white/10 border-b border-gray-200 dark:border-white/10 last:border-0">
                    {/* Empty cells for start/padding logic simplified: rendering 1 to daysInMonth using basic grid */}
                    {/* NOTE: Real calendar needs exact day alignment (start of week). For MVP simplicity, just rendering days 1..30 in grid. */}

                    {Array.from({ length: daysInMonth }).map((_, i) => {
                        const day = i + 1;
                        const events = getEventsForDay(day);
                        return (
                            <div key={day} className="p-2 min-h-[120px] hover:bg-gray-50 dark:hover:bg-white/5 transition-colors group relative border-b border-gray-200 dark:border-white/10">
                                <span className="text-sm font-bold text-gray-400 group-hover:text-ios-blue">{day}</span>

                                <div className="mt-2 space-y-1.5">
                                    {events.map((ev, idx) => {
                                        if (ev.type === 'slot') {
                                            const isHero = ev.data.slot === 'hero_article';
                                            return (
                                                <div key={idx} className={cn(
                                                    "text-[10px] p-1.5 rounded truncate font-medium flex items-center gap-1",
                                                    isHero ? "bg-blue-100 text-blue-700" : "bg-yellow-100 text-yellow-700"
                                                )}>
                                                    {isHero ? <Newspaper size={10} /> : <Trophy size={10} />}
                                                    {ev.data.referenceId?.title || ev.data.referenceId?.brand + ' ' + ev.data.referenceId?.model}
                                                </div>
                                            );
                                        } else {
                                            return (
                                                <div key={idx} className="text-[10px] p-1.5 rounded truncate font-medium flex items-center gap-1 bg-purple-100 text-purple-700">
                                                    <Museum size={10} />
                                                    {ev.data.title}
                                                </div>
                                            );
                                        }
                                    })}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
