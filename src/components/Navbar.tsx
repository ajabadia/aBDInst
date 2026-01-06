'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { signOut } from 'next-auth/react';
import { useState, useEffect } from 'react';

import SettingsModal from './SettingsModal';
import { Music, LayoutDashboard, Search, Menu, X, User, LogOut, Command, Settings, Shield, Heart, Activity, Wrench, Bell, Tag, Mail, MessageSquare } from 'lucide-react';
import NotificationBell from './notifications/NotificationBell';
import { useVaultMode } from '@/context/VaultModeContext';
import { useCommandPalette } from '@/context/CommandPaletteContext';
import UserAvatar from './UserAvatar';
import { Button } from './ui/Button';
import { cn } from '@/lib/utils';

export default function Navbar({ session }: { session: any }) {
    const router = useRouter();
    const { isVaultMode } = useVaultMode();
    const { toggle: toggleCommandPalette } = useCommandPalette();
    const pathname = usePathname();
    const [userMenuOpen, setUserMenuOpen] = useState(false);
    const [settingsOpen, setSettingsOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 10);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const navLinks = [
        { name: 'Catálogo', href: '/instruments', icon: Music },
        { name: 'Mi Colección', href: '/dashboard', icon: LayoutDashboard, authRequired: true },
        { name: 'Alertas', href: '/dashboard/alerts', icon: Bell, authRequired: true },
        { name: 'Wishlist', href: '/dashboard/wishlist', icon: Heart, authRequired: true },
        { name: 'Mantenimiento', href: '/dashboard/maintenance', icon: Wrench, authRequired: true },
        { name: 'Contacto', href: '/contact', icon: Mail },
    ];

    return (
        <nav className={cn(
            "fixed top-0 z-50 w-full transition-all duration-500",
            scrolled
                ? "py-2 bg-white/70 dark:bg-black/70 backdrop-blur-2xl border-b border-black/5 dark:border-white/10"
                : "py-5 bg-transparent"
        )}>
            <div className="max-w-7xl mx-auto px-6 flex items-center justify-between h-12">

                {/* LOGO */}
                <Link href="/" className="flex items-center gap-2.5 group">
                    <div className="w-9 h-9 rounded-xl bg-ios-blue flex items-center justify-center shadow-lg shadow-ios-blue/30 group-hover:scale-105 transition-transform duration-300">
                        <Music className="w-5 h-5 text-white" strokeWidth={2.5} />
                    </div>
                    <span className="text-xl font-bold tracking-tight text-gray-900 dark:text-white hidden sm:block">
                        Instrument<span className="text-ios-blue">Collector</span>
                    </span>
                </Link>

                {/* DESKTOP NAV */}
                <div className="hidden md:flex items-center gap-1 bg-black/5 dark:bg-white/5 p-1 rounded-2xl border border-black/5 dark:border-white/5">
                    {navLinks.map((link) => {
                        if (link.authRequired && !session) return null;
                        const isActive = pathname === link.href;
                        return (
                            <Link
                                key={link.href}
                                href={link.href}
                                className={cn(
                                    "px-4 py-2 text-[13px] font-semibold rounded-xl transition-all duration-200",
                                    isActive
                                        ? "bg-white dark:bg-white/15 text-ios-blue dark:text-white shadow-sm"
                                        : "text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                                )}
                            >
                                {link.name}
                            </Link>
                        );
                    })}
                </div>

                <div className="flex items-center gap-3">
                    {/* SEARCH TRIGGER */}
                    <button
                        onClick={toggleCommandPalette}
                        className="hidden lg:flex items-center gap-3 px-3 py-1.5 bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 rounded-xl transition-colors border border-black/5 dark:border-white/5 group"
                    >
                        <Search size={16} className="text-gray-400 group-hover:text-ios-blue transition-colors" />
                        <span className="text-sm text-gray-400 font-medium">Buscar...</span>
                        <kbd className="hidden lg:inline-flex h-5 items-center gap-1 rounded bg-black/5 dark:bg-white/10 px-1.5 font-mono text-[10px] text-gray-400">
                            ⌘K
                        </kbd>
                    </button>

                    <div className="flex items-center gap-2">
                        {isVaultMode && (
                            <div className="p-2 bg-ios-orange/10 text-ios-orange rounded-xl border border-ios-orange/20">
                                <Shield size={18} />
                            </div>
                        )}

                        {session && <NotificationBell />}

                        {session ? (
                            <div className="relative">
                                <button
                                    onClick={() => setUserMenuOpen(!userMenuOpen)}
                                    className="flex items-center gap-2 p-1 rounded-full hover:bg-black/5 dark:hover:bg-white/10 transition-all"
                                >
                                    <UserAvatar user={session.user} size={36} className="w-9 h-9 border border-black/10 dark:border-white/20 shadow-sm" />
                                    <ChevronDown size={14} className={cn("text-gray-400 transition-transform", userMenuOpen && "rotate-180")} />
                                </button>

                                {/* Dropdown Menu */}
                                {userMenuOpen && (
                                    <>
                                        <div className="fixed inset-0 z-40" onClick={() => setUserMenuOpen(false)} />
                                        <div className="absolute right-0 top-full mt-3 w-64 glass-panel rounded-2xl shadow-apple-lg p-2 z-50 animate-in fade-in zoom-in-95 duration-200">
                                            <div className="px-4 py-3 border-b border-black/5 dark:border-white/5 mb-1">
                                                <p className="text-sm font-bold truncate">{session.user.name}</p>
                                                <p className="text-[11px] text-gray-500 dark:text-gray-400 truncate uppercase tracking-wider">{session.user?.email}</p>
                                            </div>

                                            <div className="space-y-0.5">
                                                <Link href={`/profile/${session.user.id}`} onClick={() => setUserMenuOpen(false)}
                                                    className="flex items-center gap-3 px-3 py-2 text-sm text-gray-600 dark:text-gray-300 hover:bg-ios-blue hover:text-white rounded-xl transition-all font-medium">
                                                    <User size={16} /> Perfil Público
                                                </Link>
                                                <Link href="/dashboard/settings" onClick={() => setUserMenuOpen(false)}
                                                    className="flex items-center gap-3 px-3 py-2 text-sm text-gray-600 dark:text-gray-300 hover:bg-ios-blue hover:text-white rounded-xl transition-all font-medium">
                                                    <Settings size={16} /> Ajustes
                                                </Link>
                                                <Link href="/dashboard/requests" onClick={() => setUserMenuOpen(false)}
                                                    className="flex items-center gap-3 px-3 py-2 text-sm text-gray-600 dark:text-gray-300 hover:bg-ios-blue hover:text-white rounded-xl transition-all font-medium">
                                                    <MessageSquare size={16} /> Mis Consultas
                                                </Link>
                                                {session.user.role === 'admin' && (
                                                    <>
                                                        <Link href="/dashboard/admin" onClick={() => setUserMenuOpen(false)}
                                                            className="flex items-center gap-3 px-3 py-2 text-sm text-ios-red hover:bg-ios-red hover:text-white rounded-xl transition-all font-semibold">
                                                            <Shield size={16} /> Panel Admin
                                                        </Link>
                                                        <Link href="/dashboard/admin/metadata" onClick={() => setUserMenuOpen(false)}
                                                            className="flex items-center gap-3 px-3 py-2 text-sm text-gray-600 dark:text-gray-300 hover:bg-ios-blue hover:text-white rounded-xl transition-all font-medium">
                                                            <Tag size={16} /> Metadatos
                                                        </Link>
                                                        <Link href="/dashboard/admin/contacts" onClick={() => setUserMenuOpen(false)}
                                                            className="flex items-center gap-3 px-3 py-2 text-sm text-gray-600 dark:text-gray-300 hover:bg-ios-blue hover:text-white rounded-xl transition-all font-medium">
                                                            <Mail size={16} /> Buzón
                                                        </Link>
                                                    </>
                                                )}
                                                <div className="h-[1px] bg-black/5 dark:bg-white/5 my-1" />
                                                <button onClick={() => signOut()}
                                                    className="w-full flex items-center gap-3 px-3 py-2 text-sm text-gray-500 hover:bg-ios-red/10 hover:text-ios-red rounded-xl transition-all font-medium">
                                                    <LogOut size={16} /> Cerrar Sesión
                                                </button>
                                            </div>
                                        </div>
                                    </>
                                )}
                            </div>
                        ) : (
                            <div className="flex items-center gap-2">
                                <Link href="/login">
                                    <Button variant="ghost" size="sm">Entrar</Button>
                                </Link>
                                <Link href="/register">
                                    <Button size="sm">Empezar</Button>
                                </Link>
                            </div>
                        )}

                        {/* MOBILE MENU TRIGGER */}
                        <Button
                            variant="secondary"
                            size="icon"
                            className="md:hidden"
                            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                        >
                            {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
                        </Button>
                    </div>
                </div>
            </div>

            {/* MOBILE MENU */}
            {mobileMenuOpen && (
                <div className="md:hidden glass-panel border-t border-black/5 dark:border-white/10 animate-in slide-in-from-top duration-300">
                    <div className="p-6 space-y-4">
                        {navLinks.map((link) => {
                            if (link.authRequired && !session) return null;
                            const Icon = link.icon;
                            return (
                                <Link
                                    key={link.href}
                                    href={link.href}
                                    onClick={() => setMobileMenuOpen(false)}
                                    className="flex items-center gap-4 text-xl font-bold text-gray-900 dark:text-white"
                                >
                                    <div className="p-2 bg-ios-blue/10 text-ios-blue rounded-xl">
                                        <Icon size={20} />
                                    </div>
                                    {link.name}
                                </Link>
                            );
                        })}
                    </div>
                </div>
            )}

            <SettingsModal open={settingsOpen} onOpenChange={setSettingsOpen} />
        </nav>
    );
}

function ChevronDown({ size, className }: { size: number, className?: string }) {
    return (
        <svg
            width={size}
            height={size}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={className}
        >
            <path d="m6 9 6 6 6-6" />
        </svg>
    );
}
