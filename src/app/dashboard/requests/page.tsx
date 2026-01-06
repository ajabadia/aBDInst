import { getUserContactRequests } from '@/actions/contact';
import Link from 'next/link';
import { Mail, MessageCircle, Clock, CheckCircle2, ChevronRight, Headphones } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/Button';

export default async function UserRequestsPage() {
    const requests = await getUserContactRequests();

    return (
        <div className="max-w-7xl mx-auto px-6 py-12 lg:py-20 space-y-12">
            {/* Header */}
            <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
                <div className="space-y-2">
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 bg-ios-blue/10 text-ios-blue rounded-xl shadow-sm">
                            <Headphones className="w-6 h-6" />
                        </div>
                        <h1 className="text-4xl font-bold tracking-tight">Mis Consultas</h1>
                    </div>
                    <p className="text-gray-500 dark:text-gray-400 font-medium ml-1">
                        Historial de mensajes y tickets de soporte técnico.
                    </p>
                </div>
                <Link href="/contact">
                    <Button icon={<MessageCircle />}>Nueva Consulta</Button>
                </Link>
            </header>

            <div className="grid gap-4">
                {requests.length === 0 ? (
                    <div className="glass-panel rounded-[2.5rem] p-20 text-center border-dashed border-2 flex flex-col items-center max-w-2xl mx-auto">
                        <div className="w-20 h-20 bg-black/5 dark:bg-white/5 rounded-full flex items-center justify-center mb-6">
                            <MessageCircle className="w-10 h-10 text-gray-300" />
                        </div>
                        <h3 className="text-2xl font-bold tracking-tight mb-3">Sin mensajes activos</h3>
                        <p className="text-gray-500 dark:text-gray-400 mb-8 text-balance font-medium">
                            No tienes ninguna consulta pendiente. Si tienes dudas sobre el catálogo o tu cuenta, nuestro equipo está listo para ayudarte.
                        </p>
                        <Link href="/contact">
                            <Button size="lg" icon={<Headphones />}>Contactar Soporte</Button>
                        </Link>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {requests.map((req: any) => (
                            <Link key={req._id} href={`/dashboard/requests/${req._id}`} className="block group">
                                <div className="apple-card p-6 bg-white dark:bg-white/5 flex flex-col sm:flex-row items-center justify-between gap-6 hover:border-ios-blue/20 transition-all">
                                    <div className="flex items-center gap-5 flex-1 w-full">
                                        <div className={cn(
                                            "w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 transition-transform group-hover:scale-110",
                                            req.status === 'replied' ? "bg-ios-green/10 text-ios-green" : "bg-ios-gray/10 text-ios-gray"
                                        )}>
                                            {req.status === 'replied' ? <MessageCircle size={22} className="stroke-[2.2]" /> : <Clock size={22} className="stroke-[2.2]" />}
                                        </div>
                                        <div className="space-y-1">
                                            <h3 className="font-bold text-lg tracking-tight group-hover:text-ios-blue transition-colors">
                                                {req.subject}
                                            </h3>
                                            <p className="text-sm text-gray-500 font-medium line-clamp-1 opacity-80">
                                                {req.thread[req.thread.length - 1]?.content || 'Sin contenido'}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-6 w-full sm:w-auto shrink-0 justify-between sm:justify-end">
                                        <div className="text-right">
                                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-1.5 justify-end">
                                                <Clock size={10} />
                                                {new Date(req.updatedAt).toLocaleDateString()}
                                            </p>
                                            {req.status === 'replied' && (
                                                <span className="inline-block mt-1 px-2 py-0.5 bg-ios-blue text-white text-[9px] font-black rounded uppercase tracking-tighter shadow-sm">Nueva Respuesta</span>
                                            )}
                                        </div>
                                        <ChevronRight className="text-gray-300 group-hover:text-ios-blue group-hover:translate-x-1 transition-all" size={20} />
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
