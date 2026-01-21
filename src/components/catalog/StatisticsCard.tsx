/**
 * Reusable Statistics Card Component
 * Used across all catalog pages (artists, brands, decades, types)
 */

'use client';

import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StatisticsCardProps {
    icon: LucideIcon;
    label: string;
    value: string | number;
    subtitle?: string;
    trend?: 'up' | 'down' | 'neutral';
    className?: string;
}

export default function StatisticsCard({
    icon: Icon,
    label,
    value,
    subtitle,
    trend,
    className
}: StatisticsCardProps) {
    return (
        <div className={cn(
            "apple-card p-6 flex items-start gap-4 hover:shadow-apple-lg transition-all duration-300",
            className
        )}>
            <div className="p-3 bg-ios-blue/10 rounded-2xl">
                <Icon className="w-6 h-6 text-ios-blue" />
            </div>
            <div className="flex-1">
                <p className="text-sm text-gray-500 dark:text-gray-400 font-medium mb-1">
                    {label}
                </p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white mb-1">
                    {value}
                </p>
                {subtitle && (
                    <p className="text-xs text-gray-400 dark:text-gray-500">
                        {subtitle}
                    </p>
                )}
            </div>
            {trend && (
                <div className={cn(
                    "px-2 py-1 rounded-full text-xs font-bold",
                    trend === 'up' && "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400",
                    trend === 'down' && "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400",
                    trend === 'neutral' && "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400"
                )}>
                    {trend === 'up' ? '↑' : trend === 'down' ? '↓' : '→'}
                </div>
            )}
        </div>
    );
}
