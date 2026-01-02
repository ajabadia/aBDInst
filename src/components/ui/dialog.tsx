'use client';

import * as React from 'react';
import { X } from 'lucide-react';

// Inline cn utility to avoid dependency issues if lib/utils is missing or different
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

interface DialogProps {
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
    children: React.ReactNode;
}

export function Dialog({ open, onOpenChange, children }: DialogProps) {
    if (!open) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
            {/* Overlay click to close */}
            <div
                className="absolute inset-0"
                onClick={() => onOpenChange?.(false)}
            />
            {children}
        </div>
    );
}

export function DialogContent({ children, className }: { children: React.ReactNode; className?: string }) {
    return (
        <div className={cn("relative bg-white dark:bg-gray-900 rounded-xl shadow-xl w-full max-w-lg border border-gray-200 dark:border-gray-800 p-6 animate-in zoom-in-95 duration-200", className)}>
            {children}
        </div>
    );
}

export function DialogHeader({ children, className }: { children: React.ReactNode; className?: string }) {
    return <div className={cn("flex flex-col space-y-1.5 text-center sm:text-left mb-4", className)}>{children}</div>;
}

export function DialogTitle({ children, className }: { children: React.ReactNode; className?: string }) {
    return <h2 className={cn("text-lg font-semibold leading-none tracking-tight", className)}>{children}</h2>;
}
