'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';

export default function Navbar({ session }: { session: any }) {
    const pathname = usePathname();
    const [isOpen, setIsOpen] = useState(false);

    return (
        <nav className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 sticky top-0 z-50">
            <div className="container mx-auto px-4">
                <div className="flex justify-between h-16">
                    <div className="flex items-center">
                        <Link href="/" className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                            InstrumentCollector
                        </Link>
                    </div>

                    {/* Desktop Menu */}
                    <div className="hidden md:flex items-center space-x-4">
                        <Link
                            href="/instruments"
                            className={`px-3 py-2 rounded-md text-sm font-medium ${pathname === '/instruments' ? 'bg-gray-100 dark:bg-gray-800 text-blue-600' : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'}`}
                        >
                            Catálogo
                        </Link>
                        {session ? (
                            <>
                                <Link
                                    href="/dashboard"
                                    className={`px-3 py-2 rounded-md text-sm font-medium ${pathname === '/dashboard' ? 'bg-gray-100 dark:bg-gray-800 text-blue-600' : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'}`}
                                >
                                    Mi Colección
                                </Link>
                                <div className="ml-4 flex items-center gap-2">
                                    {session.user?.image && (
                                        <img src={session.user.image} className="w-8 h-8 rounded-full" />
                                    )}
                                    <span className="text-sm font-medium">{session.user?.name || session.user?.email}</span>
                                </div>
                            </>
                        ) : (
                            <Link
                                href="/api/auth/signin"
                                className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700"
                            >
                                Entrar
                            </Link>
                        )}
                    </div>

                    {/* Mobile menu button */}
                    <div className="md:hidden flex items-center">
                        <button
                            onClick={() => setIsOpen(!isOpen)}
                            className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 focus:outline-none"
                        >
                            <svg className="h-6 w-6" stroke="currentColor" fill="none" viewBox="0 0 24 24">
                                {isOpen ? (
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                ) : (
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                                )}
                            </svg>
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Menu */}
            {isOpen && (
                <div className="md:hidden border-t dark:border-gray-800">
                    <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
                        <Link
                            href="/instruments"
                            onClick={() => setIsOpen(false)}
                            className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800"
                        >
                            Catálogo
                        </Link>
                        {session ? (
                            <>
                                <Link
                                    href="/dashboard"
                                    onClick={() => setIsOpen(false)}
                                    className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800"
                                >
                                    Mi Colección
                                </Link>
                                <div className="px-3 py-2 text-sm text-gray-500">
                                    Logueado como {session.user?.email}
                                </div>
                            </>
                        ) : (
                            <Link
                                href="/api/auth/signin"
                                onClick={() => setIsOpen(false)}
                                className="block px-3 py-2 rounded-md text-base font-medium text-blue-600 hover:bg-blue-50"
                            >
                                Entrar
                            </Link>
                        )}
                    </div>
                </div>
            )}
        </nav>
    );
}
