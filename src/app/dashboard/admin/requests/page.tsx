'use client';

import ApprovalQueue from '@/components/admin/ApprovalQueue';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function AdminRequestsPage() {
    return (
        <div className="max-w-7xl mx-auto px-6 space-y-8 pb-20 pt-12">
            <div>
                <Link href="/dashboard/admin" className="flex items-center text-gray-500 hover:text-gray-900 dark:hover:text-white mb-6 transition-colors">
                    <ArrowLeft size={16} className="mr-2" /> Volver al Panel
                </Link>
                <h1 className="text-3xl font-bold tracking-tight mb-2">Solicitudes Pendientes</h1>
                <p className="text-gray-500">Instrumentos enviados por usuarios que requieren revisión.</p>
            </div>

            <ApprovalQueue />
        </div>
    );
}
