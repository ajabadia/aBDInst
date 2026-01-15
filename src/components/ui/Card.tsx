"use client";

import { cn } from "@/lib/utils";

export function Card({ className, children }: { className?: string, children: React.ReactNode }) {
    return (
        <div className={cn("apple-card p-6", className)}>
            {children}
        </div>
    );
}

export function CardHeader({ className, children }: { className?: string, children: React.ReactNode }) {
    return (
        <div className={cn("mb-4", className)}>
            {children}
        </div>
    );
}

export function CardTitle({ className, children }: { className?: string, children: React.ReactNode }) {
    return (
        <h3 className={cn("text-lg font-bold text-gray-900 dark:text-white", className)}>
            {children}
        </h3>
    );
}

export function CardContent({ className, children }: { className?: string, children: React.ReactNode }) {
    return (
        <div className={cn(className)}>
            {children}
        </div>
    );
}
