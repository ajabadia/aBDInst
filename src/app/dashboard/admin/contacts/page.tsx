import { getAdminContactRequests } from '@/actions/contact';
import Link from 'next/link';
import { Mail, MessageCircle, Clock, CheckCircle, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/Button';

// Temporary type definition since we can't import full mongoose document type easily in SC
type RequestItem = {
    _id: string;
    subject: string;
    status: 'open' | 'replied' | 'closed';
    sender: { name: string; email: string; userId?: string };
    updatedAt: string;
    thread: any[];
};

export default async function AdminContactsPage() {
    const requests = await getAdminContactRequests('all') as RequestItem[];

    return (
        <div className="max-w-6xl mx-auto space-y-8 p-6">
            <header className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Buzón de Contacto</h1>
                    <p className="text-gray-500 mt-1">Gestiona las consultas de usuarios e invitados.</p>
                </div>
            </header>

            <div className="grid gap-4">
                {requests.length === 0 ? (
                    <div className="p-12 text-center text-gray-400 bg-white dark:bg-white/5 rounded-2xl border border-dashed border-gray-200 dark:border-white/10">
                        <Mail className="mx-auto mb-4 opacity-50" size={48} />
                        <p>No hay mensajes pendientes.</p>
                    </div>
                ) : (
                    requests.map((req) => (
                        <Link key={req._id} href={`/dashboard/admin/contacts/${req._id}`}>
                            <div className="apple-card p-6 bg-white dark:bg-white/5 hover:bg-gray-50 dark:hover:bg-white/10 transition-colors flex items-center justify-between group">
                                <div className="flex items-start gap-4">
                                    <div className={cn(
                                        "p-3 rounded-full",
                                        req.status === 'open' ? "bg-blue-100 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400" :
                                            req.status === 'replied' ? "bg-green-100 text-green-600 dark:bg-green-500/20 dark:text-green-400" :
                                                "bg-gray-100 text-gray-500"
                                    )}>
                                        {req.status === 'open' ? <AlertCircle size={20} /> :
                                            req.status === 'replied' ? <MessageCircle size={20} /> :
                                                <CheckCircle size={20} />}
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-lg group-hover:text-blue-600 transition-colors">
                                            {req.subject}
                                        </h3>
                                        <div className="flex items-center gap-2 text-sm text-gray-500 mt-1">
                                            <span className="font-medium text-gray-900 dark:text-gray-300">{req.sender.name}</span>
                                            <span>&bull;</span>
                                            <span>{req.sender.email}</span>
                                            {req.sender.userId && (
                                                <span className="px-1.5 py-0.5 rounded-md bg-purple-100 text-purple-700 text-[10px] font-bold">USER</span>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <div className="text-right">
                                    <div className="flex items-center gap-1.5 text-xs text-gray-400 mb-2 justify-end">
                                        <Clock size={12} />
                                        {new Date(req.updatedAt).toLocaleDateString()}
                                    </div>
                                    <div className="px-3 py-1 bg-black/5 dark:bg-white/10 rounded-full text-xs font-bold inline-block">
                                        {req.thread.length} mensajes
                                    </div>
                                </div>
                            </div>
                        </Link>
                    ))
                )}
            </div>
        </div>
    );
}
