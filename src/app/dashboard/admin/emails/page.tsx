'use client';

import EmailTemplatesManager from '@/components/admin/EmailTemplatesManager';
import { Mail, ChevronLeft } from 'lucide-react';
import Link from 'next/link';

export default function AdminEmailsPage() {
    return (
        <div className="max-w-7xl mx-auto px-6 space-y-12 pb-20">
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
                        <h1 className="text-4xl font-bold tracking-tight text-gray-900 dark:text-white leading-tight">Gestión de Emails</h1>
                        <p className="text-gray-500 dark:text-gray-400 font-medium">Personaliza el contenido de las notificaciones automáticas.</p>
                    </div>
                </div>
            </header>

            <EmailTemplatesManager />
        </div>
    );
}
