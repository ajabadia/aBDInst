'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface CommandPaletteContextType {
    isOpen: boolean;
    setIsOpen: (isOpen: boolean) => void;
    toggle: () => void;
}

const CommandPaletteContext = createContext<CommandPaletteContextType | undefined>(undefined);

export function CommandPaletteProvider({ children }: { children: ReactNode }) {
    const [isOpen, setIsOpen] = useState(false);

    const toggle = () => setIsOpen(prev => !prev);

    // Keyboard shortcut listener
    useEffect(() => {
        const down = (e: KeyboardEvent) => {
            if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
                e.preventDefault();
                setIsOpen((open) => !open);
            }
        };

        document.addEventListener('keydown', down);
        return () => document.removeEventListener('keydown', down);
    }, []);

    return (
        <CommandPaletteContext.Provider value={{ isOpen, setIsOpen, toggle }}>
            {children}
        </CommandPaletteContext.Provider>
    );
}

export function useCommandPalette() {
    const context = useContext(CommandPaletteContext);
    if (context === undefined) {
        throw new Error('useCommandPalette must be used within a CommandPaletteProvider');
    }
    return context;
}
