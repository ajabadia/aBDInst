'use client';

import * as React from 'react';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from './Button';
import { motion, AnimatePresence } from 'framer-motion';

interface DialogProps {
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
    children: React.ReactNode;
}

export function Dialog({ open, onOpenChange, children }: DialogProps) {
    return (
        <AnimatePresence>
            {open && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-6">
                    {/* Overlay */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => onOpenChange?.(false)}
                        className="absolute inset-0 bg-black/20 dark:bg-black/60 backdrop-blur-sm"
                    />
                    {/* Dialog Wrapper */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        transition={{ type: "spring", damping: 25, stiffness: 350 }}
                        className="relative z-10 w-full max-w-lg"
                    >
                        {children}
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}

export function DialogContent({ children, className, onClose }: { children: React.ReactNode; className?: string; onClose?: () => void }) {
    return (
        <div className={cn(
            "glass-panel rounded-[2.5rem] shadow-apple-lg border-white/20 dark:border-white/10 p-8 md:p-10 overflow-hidden",
            className
        )}>
            {onClose && (
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={onClose}
                    className="absolute top-6 right-6 rounded-full hover:bg-black/5 dark:hover:bg-white/5"
                >
                    <X size={20} />
                </Button>
            )}
            {children}
        </div>
    );
}

export function DialogHeader({ children, className }: { children: React.ReactNode; className?: string }) {
    return <div className={cn("flex flex-col space-y-2 text-center sm:text-left mb-8", className)}>{children}</div>;
}

export function DialogTitle({ children, className }: { children: React.ReactNode; className?: string }) {
    return <h2 className={cn("text-3xl font-bold tracking-tight text-gray-900 dark:text-white leading-tight", className)}>{children}</h2>;
}
