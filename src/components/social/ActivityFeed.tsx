'use client';

import ActivityItem from './ActivityItem';
import { LayoutList } from 'lucide-react';

export default function ActivityFeed({ activities }: { activities: any[] }) {
    if (!activities || activities.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-20 text-center opacity-60">
                <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-full mb-4">
                    <LayoutList size={32} />
                </div>
                <h3 className="text-xl font-bold mb-2">Tu feed está tranquilo</h3>
                <p className="max-w-xs mx-auto">Sigue a otros usuarios para ver su actividad aquí.</p>
            </div>
        );
    }

    return (
        <div className="space-y-4 max-w-2xl mx-auto">
            {activities.map((activity) => (
                <ActivityItem key={activity._id} activity={activity} />
            ))}
        </div>
    );
}
