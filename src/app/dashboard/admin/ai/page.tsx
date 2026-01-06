import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { getAllSystemConfigs } from '@/actions/admin';
import AIConfigForm from '@/components/admin/AIConfigForm';

export default async function AIAdminPage() {
    const session = await auth();
    const role = session?.user?.role;

    if (!session || !['admin', 'editor'].includes(role || '')) {
        redirect('/dashboard');
    }

    const configs = await getAllSystemConfigs();

    // Transform array to object for easier consumption, preserving history
    const configMap = configs.reduce((acc: any, curr: any) => {
        acc[curr.key] = curr;
        return acc;
    }, {});

    return (
        <div className="max-w-7xl mx-auto px-6 space-y-12 pb-20">
            <header className="space-y-2">
                <h1 className="text-4xl font-bold tracking-tight text-gray-900 dark:text-white leading-tight">Inteligencia Artificial</h1>
                <p className="text-gray-500 dark:text-gray-400 font-medium text-lg">Ajusta los parámetros del modelo Gemini y los prompts maestros del sistema.</p>
            </header>

            <AIConfigForm fullConfigs={configMap} />
        </div>
    );
}
