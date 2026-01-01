'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';

type VaultModeContextType = {
    isVaultMode: boolean;
    toggleVaultMode: () => void;
};

const VaultModeContext = createContext<VaultModeContextType | undefined>(undefined);

export function VaultModeProvider({ children }: { children: React.ReactNode }) {
    const [isVaultMode, setIsVaultMode] = useState(false);

    useEffect(() => {
        // Hydrate from local storage on mount
        const stored = localStorage.getItem('vaultMode');
        if (stored) {
            setIsVaultMode(stored === 'true');
        }
    }, []);

    const toggleVaultMode = () => {
        setIsVaultMode(prev => {
            const next = !prev;
            localStorage.setItem('vaultMode', String(next));
            return next;
        });
    };

    return (
        <VaultModeContext.Provider value={{ isVaultMode, toggleVaultMode }}>
            {children}
        </VaultModeContext.Provider>
    );
}

export function useVaultMode() {
    const context = useContext(VaultModeContext);
    if (context === undefined) {
        throw new Error('useVaultMode must be used within a VaultModeProvider');
    }
    return context;
}
