'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTheme } from 'next-themes';
import { Command } from 'cmdk';
import { useVaultMode } from '@/context/VaultModeContext';
import { useCommandPalette } from '@/context/CommandPaletteContext';
import { Search, Plus, Music, LayoutDashboard, Sun, Moon, LogOut, Laptop, Shield, ShieldOff } from 'lucide-react';

export default function CommandPalette() {
    const { isOpen: open, setIsOpen: setOpen } = useCommandPalette();
    const router = useRouter();
    const { setTheme } = useTheme();
    const { isVaultMode, toggleVaultMode } = useVaultMode();

    const runCommand = (command: () => void) => {
        setOpen(false);
        command();
    };

    if (!open) return null;

    return (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-start justify-center pt-[20vh] animate-in fade-in duration-200">
            <div className="w-full max-w-2xl px-4">
                <Command className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
                    <div className="flex items-center border-b border-gray-100 dark:border-gray-800 px-3">
                        <Search className="mr-2 h-5 w-5 shrink-0 opacity-50 text-gray-500" />
                        <Command.Input
                            placeholder="¿Qué necesitas?..."
                            className="flex h-14 w-full rounded-md bg-transparent py-3 outline-none placeholder:text-gray-400 dark:text-white text-lg font-medium"
                        />
                    </div>

                    <Command.List
                        className="max-h-[300px] overflow-y-auto overflow-x-hidden p-2 [&::-webkit-scrollbar]:hidden"
                        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                    >
                        <Command.Empty className="py-6 text-center text-sm text-gray-500">
                            No se encontraron resultados.
                        </Command.Empty>

                        <Command.Group heading="Navegación" className="px-2 py-1.5 text-xs font-medium text-gray-500 dark:text-gray-400">
                            <CommandItem onSelect={() => runCommand(() => router.push('/dashboard'))}>
                                <LayoutDashboard className="mr-2 h-4 w-4" />
                                <span>Dashboard</span>
                            </CommandItem>
                            <CommandItem onSelect={() => runCommand(() => router.push('/instruments'))}>
                                <Music className="mr-2 h-4 w-4" />
                                <span>Catálogo Maestro</span>
                            </CommandItem>
                            <CommandItem onSelect={() => runCommand(() => router.push('/dashboard/collection'))}>
                                <Music className="mr-2 h-4 w-4" />
                                <span>Mi Colección</span>
                            </CommandItem>
                        </Command.Group>

                        <Command.Group heading="Acciones" className="px-2 py-1.5 text-xs font-medium text-gray-500 dark:text-gray-400 mt-2">
                            <CommandItem onSelect={() => runCommand(() => router.push('/instruments/new'))}>
                                <Plus className="mr-2 h-4 w-4" />
                                <span>Añadir Nuevo Instrumento</span>
                            </CommandItem>
                            <CommandItem onSelect={() => runCommand(() => toggleVaultMode())}>
                                {isVaultMode ? <ShieldOff className="mr-2 h-4 w-4" /> : <Shield className="mr-2 h-4 w-4" />}
                                <span>{isVaultMode ? 'Desactivar Modo Bóveda' : 'Activar Modo Bóveda (Ocultar Precios)'}</span>
                            </CommandItem>
                        </Command.Group>

                        <Command.Group heading="Tema" className="px-2 py-1.5 text-xs font-medium text-gray-500 dark:text-gray-400 mt-2">
                            <CommandItem onSelect={() => runCommand(() => setTheme('light'))}>
                                <Sun className="mr-2 h-4 w-4" />
                                <span>Modo Claro</span>
                            </CommandItem>
                            <CommandItem onSelect={() => runCommand(() => setTheme('dark'))}>
                                <Moon className="mr-2 h-4 w-4" />
                                <span>Modo Oscuro</span>
                            </CommandItem>
                            <CommandItem onSelect={() => runCommand(() => setTheme('system'))}>
                                <Laptop className="mr-2 h-4 w-4" />
                                <span>Sistema</span>
                            </CommandItem>
                        </Command.Group>
                    </Command.List>

                    <div className="border-t border-gray-100 dark:border-gray-800 py-2 px-4 text-[10px] text-gray-400 flex justify-between items-center bg-gray-50 dark:bg-gray-900/50">
                        <span>Navega con ↑↓</span>
                        <div className="flex gap-2">
                            <span className="bg-gray-200 dark:bg-gray-800 rounded px-1.5 py-0.5">↵ Enter</span>
                            <span className="bg-gray-200 dark:bg-gray-800 rounded px-1.5 py-0.5">Esc</span>
                        </div>
                    </div>
                </Command>
            </div>
        </div>
    );
}

function CommandItem({ children, onSelect }: { children: React.ReactNode, onSelect: () => void }) {
    return (
        <Command.Item
            onSelect={onSelect}
            className="relative flex cursor-pointer select-none items-center rounded-lg px-3 py-3 text-sm outline-none data-[selected=true]:bg-blue-600 data-[selected=true]:text-white data-[selected=true]:shadow-md transition-all text-gray-700 dark:text-gray-200"
        >
            {children}
        </Command.Item>
    );
}
