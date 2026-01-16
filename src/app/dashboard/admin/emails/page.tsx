'use client';

import EmailTemplatesManager from '@/components/admin/EmailTemplatesManager';
import SmtpSettingsForm from '@/components/admin/SmtpSettingsForm';
import { Mail, ChevronLeft, LayoutTemplate, Server } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

export default function AdminEmailsPage() {
    const [activeTab, setActiveTab] = useState<'templates' | 'smtp'>('templates');

    return (
        <div className="max-w-7xl mx-auto px-6 space-y-8 pb-20 pt-8">
            <header className="space-y-4">
                <Link
                    href="/dashboard/admin"
                    className="inline-flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-ios-blue transition-colors group"
                >
                    <ChevronLeft size={16} className="transition-transform group-hover:-translate-x-1" />
                    Volver al Panel
                </Link>
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-ios-blue text-white rounded-2xl shadow-lg shadow-ios-blue/20">
                        <Mail size={32} />
                    </div>
                    <div>
                        <h1 className="text-4xl font-bold tracking-tight text-gray-900 dark:text-white leading-tight">Comunicaciones</h1>
                        <p className="text-gray-500 dark:text-gray-400 font-medium">Gestión de plantillas de correo y configuración del servidor de salida.</p>
                    </div>
                </div>
            </header>

            {/* Tabs Control */}
            <div className="flex justify-center">
                <div className="bg-black/5 dark:bg-white/10 p-1 rounded-2xl flex items-center shadow-inner">
                    <button
                        onClick={() => setActiveTab('templates')}
                        className={cn(
                            "flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold transition-all duration-300 relative",
                            activeTab === 'templates' ? "text-ios-blue bg-white dark:bg-black shadow-sm" : "text-gray-500 hover:text-gray-700 dark:text-gray-400"
                        )}
                    >
                        <LayoutTemplate size={16} />
                        Plantillas
                    </button>
                    <button
                        onClick={() => setActiveTab('smtp')}
                        className={cn(
                            "flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold transition-all duration-300 relative",
                            activeTab === 'smtp' ? "text-ios-blue bg-white dark:bg-black shadow-sm" : "text-gray-500 hover:text-gray-700 dark:text-gray-400"
                        )}
                    >
                        <Server size={16} />
                        Servidor SMTP
                    </button>
                </div>
            </div>

            {/* Tab Content */}
            <AnimatePresence mode="wait">
                {activeTab === 'templates' ? (
                    <motion.div
                        key="templates"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.2 }}
                    >
                        <EmailTemplatesManager />
                    </motion.div>
                ) : (
                    <motion.div
                        key="smtp"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.2 }}
                        className="max-w-3xl mx-auto"
                    >
                        <div className="glass-panel p-8 md:p-10 rounded-[2.5rem] border-black/5 dark:border-white/5 shadow-apple-sm">
                            <div className="mb-8">
                                <h3 className="text-xl font-bold text-gray-900 dark:text-white tracking-tight">Configuración SMTP</h3>
                                <p className="text-sm text-gray-500 dark:text-gray-400 font-medium mt-1">
                                    Define los parámetros de conexión para el envío de correos transaccionales.
                                </p>
                            </div>
                            <SmtpSettingsForm />
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
