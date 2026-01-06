import { getContactRequest } from '@/actions/contact';
import { notFound } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { User, ShieldCheck, Mail, Calendar, ArrowLeft, Lock } from 'lucide-react';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import ReplyForm from '@/components/contact/ReplyForm';
import CloseTicketButton from '@/components/contact/CloseTicketButton';

export default async function AdminContactDetailPage(props: { params: Promise<{ id: string }> }) {
    const params = await props.params;
    const request = await getContactRequest(params.id);

    if (!request) return notFound();

    return (
        <div className="max-w-7xl mx-auto px-6 py-12 lg:py-20 space-y-12">

            {/* Header with Close Button */}
            <header className="sticky top-0 z-50 glass-panel bg-white/80 dark:bg-black/80 backdrop-blur-md -mx-6 px-6 py-4 flex flex-col md:flex-row justify-between items-center gap-4 border-b border-black/5 dark:border-white/5">
                <div className="flex items-center gap-4">
                    <Link href="/dashboard/admin/contacts">
                        <Button variant="secondary" size="sm" icon={<ArrowLeft />}>Volver</Button>
                    </Link>
                    <div>
                        <div className="flex items-center gap-2">
                            <span className={cn(
                                "px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-widest border",
                                request.status === 'replied' ? "bg-ios-green/10 text-ios-green border-ios-green/20" :
                                    request.status === 'closed' ? "bg-red-50 text-red-500 border-red-100" :
                                        "bg-ios-blue/10 text-ios-blue border-ios-blue/20"
                            )}>
                                {request.status === 'replied' ? 'Respondido' : request.status === 'closed' ? 'Cerrado' : 'Abierto'}
                            </span>
                            <span className="text-xs font-mono text-gray-400">#{request._id.substring(request._id.length - 6)}</span>
                        </div>
                        <h1 className="text-lg font-bold truncate max-w-md">{request.subject}</h1>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    {request.status !== 'closed' && (
                        <CloseTicketButton requestId={request._id} isIconOnly={false} />
                    )}
                </div>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                {/* Sidebar: Sender Info */}
                <div className="lg:col-span-4 space-y-6">
                    <div className="apple-card p-6 space-y-6">
                        <h3 className="apple-label border-b pb-2 mb-4">Información del Contacto</h3>

                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-full bg-gray-100 dark:bg-white/10 flex items-center justify-center text-gray-500">
                                <User size={24} />
                            </div>
                            <div>
                                <p className="font-bold text-lg">{request.sender.name}</p>
                                <div className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-ios-blue transition-colors cursor-pointer">
                                    <Mail size={12} />
                                    <a href={`mailto:${request.sender.email}`}>{request.sender.email}</a>
                                </div>
                            </div>
                        </div>

                        {request.sender.userId && (
                            <div className="p-4 rounded-xl bg-ios-blue/5 border border-ios-blue/10">
                                <p className="text-xs text-ios-blue font-bold uppercase tracking-wider mb-1">Usuario Registrado</p>
                                <p className="text-sm font-mono text-gray-600 dark:text-gray-400">{request.sender.userId}</p>
                            </div>
                        )}

                        <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                                <span className="text-gray-400">Creado</span>
                                <span className="font-medium">{new Date(request.createdAt).toLocaleDateString()}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-400">Última actividad</span>
                                <span className="font-medium">{new Date(request.updatedAt).toLocaleDateString()}</span>
                            </div>
                            {request.closedAt && (
                                <div className="flex justify-between text-red-500">
                                    <span className="opacity-70">Cerrado</span>
                                    <span className="font-medium">{new Date(request.closedAt).toLocaleDateString()}</span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Main: Conversation */}
                <div className="lg:col-span-8 pb-32">
                    <div className="space-y-8">
                        {request.thread.map((msg: any, idx: number) => {
                            const isAdmin = msg.senderType === 'admin';
                            return (
                                <div key={idx} className={cn(
                                    "flex gap-4",
                                    isAdmin ? "flex-row-reverse" : "flex-row"
                                )}>
                                    <div className={cn(
                                        "w-8 h-8 rounded-full flex items-center justify-center shrink-0 mt-2",
                                        isAdmin ? "bg-black dark:bg-white text-white dark:text-black" : "bg-gray-100 dark:bg-white/10 text-gray-500"
                                    )}>
                                        {isAdmin ? <ShieldCheck size={14} /> : <User size={14} />}
                                    </div>
                                    <div className={cn(
                                        "max-w-[85%] p-5 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap",
                                        isAdmin
                                            ? "bg-ios-blue text-white rounded-tr-sm shadow-md"
                                            : "bg-white dark:bg-white/5 border border-black/5 dark:border-white/10 rounded-tl-sm shadow-sm"
                                    )}>
                                        <div className="flex items-center gap-2 mb-2 opacity-70 text-[10px] font-bold uppercase tracking-widest">
                                            <span>{isAdmin ? 'Tú (Admin)' : request.sender.name}</span>
                                            <span>•</span>
                                            <span className="flex items-center gap-1"><Calendar size={8} /> {new Date(msg.createdAt).toLocaleString()}</span>
                                        </div>
                                        {msg.content}
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {/* Reply Area */}
                    <div className="mt-12">
                        {request.status === 'closed' ? (
                            <div className="p-6 rounded-2xl bg-gray-50 dark:bg-white/5 border border-dashed border-gray-200 dark:border-white/10 text-center">
                                <Lock className="mx-auto text-gray-400 mb-2" size={20} />
                                <p className="text-sm font-medium text-gray-500">Ticket cerrado por {request.closedBy?.name || 'Sistema'}</p>
                            </div>
                        ) : (
                            <div className="sticky bottom-6">
                                <ReplyForm requestId={request._id} />
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
