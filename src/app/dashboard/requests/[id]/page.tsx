import { getContactRequest } from '@/actions/contact';
import { notFound } from 'next/navigation';
import { User, ShieldCheck, Calendar, ArrowLeft, Lock } from 'lucide-react';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import ReplyForm from '@/components/contact/ReplyForm';
import CloseTicketButton from '@/components/contact/CloseTicketButton';

export default async function UserRequestDetailPage(props: { params: Promise<{ id: string }> }) {
    const params = await props.params;
    const request = await getContactRequest(params.id);

    if (!request) return notFound();

    return (
        <div className="max-w-7xl mx-auto px-6 py-12 lg:py-20 space-y-12">

            {/* Header: Ticket Info */}
            <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-8 mb-16">
                <div className="space-y-3">
                    <Link href="/dashboard/requests" className="inline-flex items-center text-sm font-semibold text-ios-blue hover:underline mb-4 group">
                        <ArrowLeft size={16} className="mr-2 transition-transform group-hover:-translate-x-1" />
                        Mis Consultas
                    </Link>
                    <div className="flex items-center gap-3">
                        <span className={cn(
                            "px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border",
                            request.status === 'replied' ? "bg-ios-green/10 text-ios-green border-ios-green/20" :
                                request.status === 'closed' ? "bg-red-50 text-red-500 border-red-100 dark:bg-red-900/10 dark:text-red-400 dark:border-red-900/20" :
                                    "bg-gray-100 text-gray-500 border-gray-200 dark:bg-white/10 dark:text-gray-300 dark:border-white/10"
                        )}>
                            {request.status === 'replied' ? 'Respondido' : request.status === 'closed' ? 'Cerrado' : 'Pendiente'}
                        </span>
                        <p className="text-gray-400 text-xs font-bold uppercase tracking-widest">
                            ID: <span className="font-mono">{request._id.substring(request._id.length - 8)}</span>
                        </p>
                    </div>
                    <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-gray-900 dark:text-white leading-tight">
                        {request.subject}
                    </h1>
                </div>

                {request.status !== 'closed' && (
                    <CloseTicketButton requestId={request._id} />
                )}
            </header>

            {/* Conversation Thread: iMessage Style */}
            <div className="space-y-10 max-w-5xl mx-auto">
                {request.thread.map((msg: any, idx: number) => {
                    const isAdmin = msg.senderType === 'admin';
                    return (
                        <div key={idx} className={cn(
                            "flex gap-4 animate-in fade-in duration-500",
                            isAdmin ? "flex-row" : "flex-row-reverse"
                        )}>
                            {/* Avatar Bubble */}
                            <div className={cn(
                                "w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 shadow-sm",
                                isAdmin ? "bg-black dark:bg-white text-white dark:text-black" : "bg-white dark:bg-black/40 border border-black/5 dark:border-white/10"
                            )}>
                                {isAdmin ? <ShieldCheck size={18} /> : <User size={18} className="text-gray-400" />}
                            </div>

                            {/* Message Bubble */}
                            <div className={cn(
                                "max-w-[75%] p-6 rounded-3xl shadow-sm relative",
                                isAdmin
                                    ? "bg-white dark:bg-white/5 text-gray-800 dark:text-gray-200 rounded-tl-md border border-black/5 dark:border-white/5"
                                    : "bg-ios-blue text-white rounded-tr-md shadow-ios-blue/10"
                            )}>
                                <div className={cn(
                                    "text-[10px] font-black uppercase tracking-[0.15em] mb-2 opacity-50",
                                    isAdmin ? "text-ios-blue" : "text-white"
                                )}>
                                    {isAdmin ? 'Soporte Técnico' : 'Tú'}
                                </div>
                                <p className="text-[15px] whitespace-pre-wrap leading-relaxed font-medium">
                                    {msg.content}
                                </p>
                                <div className={cn(
                                    "mt-3 text-[9px] font-bold uppercase tracking-widest flex items-center gap-1.5 opacity-40",
                                    isAdmin ? "justify-start" : "justify-end"
                                )}>
                                    <Calendar size={10} />
                                    {new Date(msg.createdAt).toLocaleString('es-ES', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Footer: Reply or Closed Status */}
            <div className="max-w-xl mx-auto pt-16 pb-32">
                {request.status === 'closed' ? (
                    <div className="glass-panel p-8 rounded-[2rem] border-dashed border-2 text-center space-y-4">
                        <div className="w-12 h-12 rounded-full bg-red-50 dark:bg-red-900/20 text-red-500 flex items-center justify-center mx-auto">
                            <Lock size={20} />
                        </div>
                        <h3 className="font-bold text-gray-900 dark:text-gray-100">Conversación Cerrada</h3>
                        <p className="text-sm text-gray-500 font-medium leading-relaxed">
                            Este hilo ha sido finalizado. Si necesitas asistencia adicional sobre otro tema, por favor <Link href="/contact" className="text-ios-blue font-bold hover:underline">abre un nuevo ticket</Link>.
                        </p>
                    </div>
                ) : (
                    <ReplyForm requestId={request._id} />
                )}
            </div>
        </div>
    );
}
