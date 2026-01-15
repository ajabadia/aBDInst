'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useTheme } from 'next-themes';
import { Command } from 'cmdk';
import { useVaultMode } from '@/context/VaultModeContext';
import { useCommandPalette } from '@/context/CommandPaletteContext';
import { Search, Plus, Music, LayoutDashboard, Sun, Moon, Shield, ShieldOff, X, Guitar, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils';
import { getInstruments } from '@/actions/catalog';

export default function CommandPalette() {
    const { isOpen: open, setIsOpen: setOpen } = useCommandPalette();
    const router = useRouter();
    const { setTheme } = useTheme();
    const { isVaultMode: vaultActive, toggleVaultMode: toggleVault } = useVaultMode();

    const [query, setQuery] = useState('');
    const [results, setResults] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        const fetchResults = async () => {
            if (!query || query.length < 2) {
                setResults([]);
                return;
            }
            setIsLoading(true);
            try {
                const data = await getInstruments(query, null, 'brand', 'asc', 5);
                setResults(data);
            } catch (error) {
                console.error("Search error", error);
            } finally {
                setIsLoading(false);
            }
        };

        const timer = setTimeout(fetchResults, 300);
        return () => clearTimeout(timer);
    }, [query]);

    const runCommand = (command: () => void) => {
        setOpen(false);
        command();
    };

    if (!open) return null;

    return (
        <div className="fixed inset-0 z-[100] bg-black/20 dark:bg-black/60 backdrop-blur-md flex items-start justify-center pt-[15vh] animate-in fade-in duration-300 p-4">
            <div className="w-full max-w-2xl relative">

                {/* Close Button - Apple Style */}
                <div className="absolute -top-12 right-0">
                    <Button
                        variant="secondary"
                        size="icon"
                        onClick={() => setOpen(false)}
                        className="rounded-full bg-white/20 hover:bg-white/40 border-none text-white backdrop-blur-xl"
                    >
                        <X size={20} />
                    </Button>
                </div>

                <Command className="glass-panel rounded-[2rem] shadow-apple-lg overflow-hidden animate-in zoom-in-95 duration-200 border-white/20 dark:border-white/10">
                    <div className="flex items-center border-b border-black/5 dark:border-white/5 px-4 relative">
                        <Search className="mr-3 h-5 w-5 shrink-0 text-ios-blue" />
                        <Command.Input
                            placeholder="Buscar instrumentos, acciones..."
                            className="flex h-16 w-full rounded-md bg-transparent py-4 outline-none placeholder:text-gray-400 dark:text-gray-500 text-lg font-semibold tracking-tight"
                            value={query}
                            onValueChange={setQuery}
                        />
                        {isLoading && <Loader2 className="animate-spin text-gray-400 absolute right-4" size={20} />}
                    </div>

                    <Command.List
                        className="max-h-[450px] overflow-y-auto overflow-x-hidden p-3 [&::-webkit-scrollbar]:hidden"
                        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                    >
                        {!isLoading && results.length === 0 && query.length > 2 && (
                            <Command.Empty className="py-12 text-center text-sm text-gray-500 font-medium">
                                No se encontraron instrumentos.
                            </Command.Empty>
                        )}

                        {results.length > 0 && (
                            <Command.Group heading="Instrumentos encontrados" className="apple-label px-3 pt-4 pb-2">
                                {results.map((inst) => (
                                    <CommandItem
                                        key={inst.id}
                                        onSelect={() => runCommand(() => router.push(`/instruments/${inst.id}`))}
                                    >
                                        <div className="p-2 bg-gray-100 dark:bg-gray-800 rounded-lg mr-3 shadow-sm border border-black/5">
                                            {inst.genericImages?.[0] ? (
                                                <img src={inst.genericImages[0]} className="w-5 h-5 object-contain" alt="" />
                                            ) : (
                                                <Guitar size={18} className="text-gray-500" />
                                            )}
                                        </div>
                                        <div className="flex flex-col gap-0.5">
                                            <span className="font-bold">{inst.brand} {inst.model}</span>
                                            {inst.variantLabel && <span className="text-[10px] text-gray-400 font-medium uppercase tracking-wide">{inst.variantLabel}</span>}
                                        </div>
                                    </CommandItem>
                                ))}
                            </Command.Group>
                        )}

                        <Command.Group heading="Navegación" className="apple-label px-3 pt-4 pb-2">
                            <CommandItem onSelect={() => runCommand(() => router.push('/dashboard'))}>
                                <div className="p-2 bg-ios-blue/10 text-ios-blue rounded-lg mr-3">
                                    <LayoutDashboard size={18} />
                                </div>
                                <span>Dashboard</span>
                            </CommandItem>
                            <CommandItem onSelect={() => runCommand(() => router.push('/instruments'))}>
                                <div className="p-2 bg-ios-indigo/10 text-ios-indigo rounded-lg mr-3">
                                    <Music size={18} />
                                </div>
                                <span>Catálogo Maestro</span>
                            </CommandItem>
                            <CommandItem onSelect={() => runCommand(() => router.push('/dashboard/collection'))}>
                                <div className="p-2 bg-ios-teal/10 text-ios-teal rounded-lg mr-3">
                                    <Music size={18} />
                                </div>
                                <span>Mi Colección</span>
                            </CommandItem>
                        </Command.Group>

                        <Command.Group heading="Acciones rápidas" className="apple-label px-3 pt-6 pb-2">
                            <CommandItem onSelect={() => runCommand(() => router.push('/instruments/new'))}>
                                <div className="p-2 bg-ios-green/10 text-ios-green rounded-lg mr-3">
                                    <Plus size={18} />
                                </div>
                                <span>Añadir Nuevo Instrumento</span>
                            </CommandItem>
                            <CommandItem onSelect={() => runCommand(() => toggleVault())}>
                                <div className={cn(
                                    "p-2 rounded-lg mr-3",
                                    vaultActive ? "bg-ios-orange/10 text-ios-orange" : "bg-ios-gray/10 text-ios-gray"
                                )}>
                                    {vaultActive ? <ShieldOff size={18} /> : <Shield size={18} />}
                                </div>
                                <span>{vaultActive ? 'Desactivar Modo Bóveda' : 'Activar Modo Bóveda (Ocultar Precios)'}</span>
                            </CommandItem>
                        </Command.Group>

                        <Command.Group heading="Apariencia" className="apple-label px-3 pt-6 pb-2">
                            <CommandItem onSelect={() => runCommand(() => setTheme('light'))}>
                                <div className="p-2 bg-ios-yellow/10 text-ios-yellow rounded-lg mr-3">
                                    <Sun size={18} />
                                </div>
                                <span>Modo Claro</span>
                            </CommandItem>
                            <CommandItem onSelect={() => runCommand(() => setTheme('dark'))}>
                                <div className="p-2 bg-ios-indigo/10 text-ios-indigo rounded-lg mr-3">
                                    <Moon size={18} />
                                </div>
                                <span>Modo Oscuro</span>
                            </CommandItem>
                        </Command.Group>
                    </Command.List>

                    {/* Footer - Apple Style KBD */}
                    <div className="border-t border-black/5 dark:border-white/5 py-3 px-6 text-[11px] font-bold text-gray-400 flex justify-between items-center bg-black/[0.02] dark:bg-white/[0.02]">
                        <span className="uppercase tracking-widest">Navega con teclas de flecha</span>
                        <div className="flex gap-3">
                            <div className="flex items-center gap-1.5">
                                <kbd className="bg-white dark:bg-white/10 border border-black/10 dark:border-white/10 rounded-md px-1.5 py-0.5 shadow-sm text-gray-600 dark:text-gray-300">↵</kbd>
                                <span>Enter</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                                <kbd className="bg-white dark:bg-white/10 border border-black/10 dark:border-white/10 rounded-md px-1.5 py-0.5 shadow-sm text-gray-600 dark:text-gray-300">esc</kbd>
                                <span>Salir</span>
                            </div>
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
            className="group relative flex cursor-pointer select-none items-center rounded-2xl px-3 py-2.5 text-[15px] font-semibold outline-none data-[selected=true]:bg-ios-blue data-[selected=true]:text-white data-[selected=true]:shadow-lg data-[selected=true]:shadow-ios-blue/30 transition-all duration-200 text-gray-700 dark:text-gray-200 mb-1"
        >
            {children}
        </Command.Item>
    );
}
