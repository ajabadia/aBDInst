'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { signOut } from 'next-auth/react';
import { useState, useEffect } from 'react';

import SettingsModal from './SettingsModal';
import { Music, LayoutDashboard, Search, Menu, X, User, LogOut, Command, Settings, ChevronDown, Heart, Activity, Wrench } from 'lucide-react';
import NotificationBell from './notifications/NotificationBell';
import { Shield } from 'lucide-react';
import { useVaultMode } from '@/context/VaultModeContext';
import { useCommandPalette } from '@/context/CommandPaletteContext';

export default function Navbar({ session }: { session: any }) {
    const router = useRouter();
    const { isVaultMode } = useVaultMode();
    const { toggle: toggleCommandPalette } = useCommandPalette();
    // ...
    const pathname = usePathname();
    const [isOpen, setIsOpen] = useState(false);
    const [userMenuOpen, setUserMenuOpen] = useState(false);
    const [settingsOpen, setSettingsOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);

    // Efecto para cambiar el estilo al hacer scroll
    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 20);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const navLinks = [
        { name: 'Catálogo', href: '/instruments', icon: Music },
        { name: 'Mi Colección', href: '/dashboard', icon: LayoutDashboard, authRequired: true },
        { name: 'Wishlist', href: '/dashboard/wishlist', icon: Heart, authRequired: true },
        { name: 'Feed', href: '/dashboard/feed', icon: Activity, authRequired: true },
        { name: 'Mantenimiento', href: '/dashboard/maintenance', icon: Wrench, authRequired: true },
    ];

    return (
        <nav className={`fixed top-0 z-50 w-full transition-all duration-300 pointer-events-none ${scrolled
            ? 'bg-white/70 dark:bg-black/70 backdrop-blur-xl border-b border-gray-200/50 dark:border-white/10 py-2'
            : 'bg-transparent py-4'
            }`}>
            <div className="max-w-7xl mx-auto px-6 flex items-center justify-between h-12 pointer-events-auto">

                {/* LOGO */}
                <Link href="/" className="flex items-center gap-2 group">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-blue-600 to-purple-600 flex items-center justify-center shadow-lg shadow-blue-500/20 group-hover:scale-105 transition-transform">
                        <Music className="w-5 h-5 text-white" strokeWidth={2.5} />
                    </div>
                    <span className="text-lg font-semibold tracking-tighter text-gray-900 dark:text-white">
                        Instrument<span className="text-gray-400 dark:text-gray-500 font-normal">Collector</span>
                    </span>
                </Link>

                {/* DESKTOP NAV */}
                <div className="hidden md:flex items-center gap-8">
                    <div className="flex items-center gap-1">
                        {navLinks.map((link) => {
                            if (link.authRequired && !session) return null;
                            const isActive = pathname === link.href;
                            return (
                                <Link
                                    key={link.href}
                                    href={link.href}
                                    className={`px-4 py-2 text-sm font-medium rounded-full transition-all ${isActive
                                        ? 'text-blue-600 dark:text-blue-400 bg-blue-50/50 dark:bg-blue-900/20'
                                        : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100'
                                        }`}
                                >
                                    {link.name}
                                </Link>
                            );
                        })}
                    </div>

                    <div className="h-4 w-[1px] bg-gray-200 dark:bg-gray-800" />

                    <div className="flex items-center gap-4">



                        {isVaultMode && (
                            <div title="Modo Bóveda: Precios Ocultos" className="flex items-center gap-2 px-3 py-1 bg-amber-50 text-amber-600 dark:bg-amber-900/20 dark:text-amber-500 rounded-full text-xs font-bold border border-amber-200 dark:border-amber-800 animate-in fade-in">
                                <Shield size={14} />
                            </div>
                        )}

                        {session && <NotificationBell />}

                        {/* COMMAND PALETTE TRIGGER */}
                        <button
                            onClick={toggleCommandPalette}
                            className="hidden md:flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white bg-gray-100 dark:bg-white/5 hover:bg-gray-200 dark:hover:bg-white/10 rounded-md transition-colors mr-2 border border-gray-200 dark:border-white/5"
                            title="Abrir Comandos (Cmd+K)"
                        >
                            <Command size={14} />
                            <span>Buscar</span>
                            <kbd className="hidden lg:inline-flex h-5 items-center gap-1 rounded border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 px-1.5 font-mono text-[10px] font-medium text-gray-500 dark:text-gray-400">
                                <span className="text-xs">⌘</span>K
                            </kbd>
                        </button>

                        {/* MOBILE TRIGGER */}
                        <button
                            onClick={toggleCommandPalette}
                            className="md:hidden p-2 text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors"
                        >
                            <Command size={20} />
                        </button>



                        {session ? (
                            <div className="relative pointer-events-auto">
                                <button
                                    onClick={() => setUserMenuOpen(!userMenuOpen)}
                                    className="flex items-center gap-3 p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-all group"
                                    aria-expanded={userMenuOpen}
                                    aria-haspopup="true"
                                    aria-label="Menú de usuario"
                                >
                                    <div className="text-right hidden sm:block">
                                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-none mb-1">Usuario</p>
                                        <p className="text-sm font-bold text-gray-900 dark:text-white leading-none">{session.user.name}</p>
                                    </div>
                                    <div className="w-10 h-10 rounded-full border-2 border-white dark:border-gray-800 shadow-sm overflow-hidden bg-gray-100 flex items-center justify-center group-hover:border-blue-500 transition-all">
                                        {session.user.image ? (
                                            <img src={session.user.image} alt="" className="w-full h-full object-cover" />
                                        ) : (
                                            <User size={20} className="text-gray-400" />
                                        )}
                                    </div>
                                </button>

                                {/* Dropdown Menu */}
                                {userMenuOpen && (
                                    <>
                                        <div
                                            className="fixed inset-0 z-40"
                                            onClick={() => setUserMenuOpen(false)}
                                        />
                                        <div className="absolute right-0 top-full mt-3 w-64 bg-white dark:bg-gray-900 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-800 p-2 z-50 animate-in fade-in zoom-in-95 duration-200">
                                            <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-800 mb-2">
                                                <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{session.user?.email}</p>
                                            </div>

                                            <Link
                                                href={`/profile/${(session.user as any).id}`}
                                                onClick={() => setUserMenuOpen(false)}
                                                className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-xl transition-colors font-bold"
                                            >
                                                <User size={14} />
                                                Mi Perfil Público
                                            </Link>

                                            <Link
                                                href="/dashboard"
                                                onClick={() => setUserMenuOpen(false)}
                                                className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-xl transition-colors"
                                            >
                                                <LayoutDashboard className="w-4 h-4" />
                                                Mi Colección
                                            </Link>

                                            {/* Link to profile if it existed, otherwise just dashboard or disabled for now */}
                                            <hr className="border-gray-50 dark:border-gray-800 my-1" />

                                            {(session.user as any).role === 'admin' && (
                                                <button
                                                    onClick={() => {
                                                        setUserMenuOpen(false);
                                                        router.push('/admin');
                                                    }}
                                                    className="w-full flex items-center gap-2 px-4 py-2.5 text-xs font-bold text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                                                >
                                                    <Shield size={14} />
                                                    Administración (IA & Config)
                                                </button>
                                            )}

                                            <Link
                                                href="/dashboard/settings"
                                                onClick={() => setUserMenuOpen(false)}
                                                className="w-full flex items-center gap-2 px-4 py-2.5 text-xs font-bold text-gray-500 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                                            >
                                                <Settings size={14} />
                                                Ajustes de Perfil
                                            </Link>

                                            <button
                                                onClick={() => {
                                                    setUserMenuOpen(false);
                                                    signOut();
                                                }}
                                                className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/10 rounded-xl transition-colors mt-1"
                                            >
                                                <LogOut className="w-4 h-4" />
                                                Cerrar Sesión
                                            </button>
                                        </div>
                                    </>
                                )}
                            </div>
                        ) : (
                            <div className="flex items-center gap-3">
                                <Link href="/login" className="text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-gray-900">
                                    Entrar
                                </Link>
                                <Link
                                    href="/register"
                                    className="px-5 py-2 text-sm font-semibold text-white bg-blue-600 rounded-full hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/25 active:scale-95"
                                >
                                    Empezar
                                </Link>
                            </div>
                        )}
                    </div>
                </div>

                {/* MOBILE MENU BUTTON */}
                <div className="md:hidden flex items-center gap-4">
                    <button
                        onClick={() => setIsOpen(!isOpen)}
                        className="p-2 rounded-xl bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800"
                        aria-label={isOpen ? "Cerrar menú" : "Abrir menú"}
                        aria-expanded={isOpen}
                    >
                        {isOpen ? <X size={24} /> : <Menu size={24} />}
                    </button>
                </div>
            </div>

            {/* MOBILE MENU OVERLAY */}
            {isOpen && (
                <div className="md:hidden absolute top-full left-0 w-full bg-white/95 dark:bg-black/95 backdrop-blur-2xl border-b border-gray-200 dark:border-gray-800 animate-in slide-in-from-top duration-300 pointer-events-auto">
                    <div className="px-6 py-8 space-y-6">
                        {navLinks.map((link) => {
                            if (link.authRequired && !session) return null;
                            const Icon = link.icon;
                            return (
                                <Link
                                    key={link.href}
                                    href={link.href}
                                    onClick={() => setIsOpen(false)}
                                    className="flex items-center gap-4 text-2xl font-semibold tracking-tight text-gray-900 dark:text-white"
                                >
                                    <Icon className="w-6 h-6 text-blue-500" />
                                    {link.name}
                                </Link>
                            );
                        })}
                        <hr className="border-gray-100 dark:border-gray-800" />
                        {!session && (
                            <div className="flex flex-col gap-4">
                                <Link href="/login" className="text-lg font-medium">Entrar</Link>
                                <Link href="/register" className="w-full py-4 bg-blue-600 text-white text-center rounded-2xl font-bold">Empezar ahora</Link>
                            </div>
                        )}
                    </div>
                </div>
            )}

            <SettingsModal open={settingsOpen} onOpenChange={setSettingsOpen} />
        </nav>
    );
}
