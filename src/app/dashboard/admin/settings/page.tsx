import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { getSystemConfig } from '@/actions/admin';
import AdminSettingsForm from '@/components/AdminSettingsForm';
import { ShieldCheck } from 'lucide-react';

export default async function AdminSettingsPage() {
    const session = await auth();

    if (!session || (session.user as any).role !== 'admin') {
        redirect('/dashboard');
    }

    const initialPrompt = await getSystemConfig('ai_system_prompt');
    const initialModel = await getSystemConfig('ai_model_name');


    const initialProxy = await getSystemConfig('scraper_proxy_url');

    return (
        <div className="max-w-4xl mx-auto p-4 sm:p-8">
            <header className="mb-10">
                <div className="flex items-center gap-2 text-blue-600 font-bold text-xs uppercase tracking-widest mb-2">
                    <ShieldCheck size={14} />
                    Panel de Administración
                </div>
                <h1 className="text-4xl font-bold tracking-tight">Configuración del Sistema</h1>
                <p className="text-gray-500 mt-2">Ajusta los parámetros globales y el comportamiento de la IA.</p>
            </header>

            <AdminSettingsForm initialPrompt={initialPrompt} initialModel={initialModel} initialProxy={initialProxy} />
        </div>
    );
}
