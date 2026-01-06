'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Send, Mail, User, MessageSquare, Headphones, Globe, Clock, ShieldCheck, ArrowRight } from 'lucide-react';
import { submitContactRequest } from '@/actions/contact';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import Link from 'next/link';

interface ContactFormProps {
    initialSession: any; // We pass session from server to avoid wait
    hasRequests: boolean;
}

export default function ContactForm({ initialSession, hasRequests }: ContactFormProps) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        subject: '',
        message: ''
    });

    const isAuth = !!initialSession?.user;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        const result = await submitContactRequest({
            name: isAuth ? undefined : formData.name,
            email: isAuth ? undefined : formData.email,
            subject: formData.subject,
            message: formData.message
        });

        setLoading(false);

        if (result.success) {
            toast.success('Mensaje enviado', { description: 'Te responderemos a la brevedad.' });
            setFormData({ name: '', email: '', subject: '', message: '' });
            if (isAuth) {
                router.push('/dashboard/requests');
            }
        } else {
            toast.error('Error', { description: result.error });
        }
    };

    return (
        <div className="max-w-7xl mx-auto px-6 py-12 lg:py-24">

            {/* Split Layout: Info (Left) & Form (Right) */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 lg:gap-24 items-start">

                {/* --- Left Column: Hero & Info --- */}
                <div className="lg:col-span-5 space-y-12 animate-in fade-in slide-in-from-left-4 duration-700">
                    <div className="space-y-6">
                        <div className="inline-flex items-center gap-2 px-3 py-1 bg-ios-blue/10 text-ios-blue rounded-full text-[10px] font-bold uppercase tracking-widest">
                            <Headphones size={12} /> Soporte de Sistemas
                        </div>
                        <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-gray-900 dark:text-white leading-[1.1]">
                            Estamos aquí para <span className="text-ios-blue">ayudarte</span>.
                        </h1>
                        <p className="text-xl text-gray-500 dark:text-gray-400 font-medium leading-relaxed">
                            ¿Tienes preguntas sobre el catálogo maestro o necesitas asistencia técnica con tu bóveda? Nuestro equipo está a tu disposición.
                        </p>

                        {/* HAS REQUESTS LINK */}
                        {hasRequests && (
                            <Link
                                href="/dashboard/requests"
                                className="inline-flex items-center gap-3 px-6 py-4 bg-white dark:bg-white/5 border border-black/5 dark:border-white/10 rounded-2xl shadow-sm hover:border-ios-blue/30 transition-all group"
                            >
                                <div className="p-2 bg-ios-blue/10 text-ios-blue rounded-lg">
                                    <MessageSquare size={20} />
                                </div>
                                <div className="text-left">
                                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Tus Consultas</p>
                                    <p className="text-sm font-bold text-gray-900 dark:text-white group-hover:text-ios-blue transition-colors">
                                        Ver historial de mensajes
                                    </p>
                                </div>
                                <ArrowRight size={16} className="ml-auto text-gray-300 group-hover:text-ios-blue group-hover:translate-x-1 transition-all" />
                            </Link>
                        )}
                    </div>

                    {/* Support Cards */}
                    <div className="space-y-4">
                        <div className="glass-panel p-6 rounded-2xl flex items-center gap-4 border-black/5 dark:border-white/5">
                            <div className="w-12 h-12 rounded-xl bg-ios-green/10 text-ios-green flex items-center justify-center">
                                <Clock size={24} />
                            </div>
                            <div>
                                <p className="text-sm font-bold">Respuesta Rápida</p>
                                <p className="text-xs text-gray-500">Normalmente en menos de 24h.</p>
                            </div>
                        </div>
                        <div className="glass-panel p-6 rounded-2xl flex items-center gap-4 border-black/5 dark:border-white/5">
                            <div className="w-12 h-12 rounded-xl bg-ios-indigo/10 text-ios-indigo flex items-center justify-center">
                                <ShieldCheck size={24} />
                            </div>
                            <div>
                                <p className="text-sm font-bold">Privacidad Garantizada</p>
                                <p className="text-xs text-gray-500">Tus datos nunca se comparten.</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* --- Right Column: The Form --- */}
                <div className="lg:col-span-7 relative group animate-in fade-in slide-in-from-right-4 duration-700 delay-150">
                    {/* Decorative background glow */}
                    <div className="absolute inset-0 bg-gradient-to-tr from-ios-blue/10 to-ios-indigo/10 blur-[100px] rounded-full opacity-50 -z-10 group-hover:opacity-70 transition-opacity duration-1000" />

                    <div className="glass-panel rounded-[2.5rem] p-8 md:p-12 shadow-apple-lg border-white/20 relative z-10 overflow-hidden">
                        <form onSubmit={handleSubmit} className="space-y-8">

                            {!isAuth && (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <Input
                                        label="Nombre completo"
                                        placeholder="Tu nombre"
                                        icon={<User />}
                                        required
                                        value={formData.name}
                                        onChange={e => setFormData({ ...formData, name: e.target.value })}
                                    />
                                    <Input
                                        label="Correo electrónico"
                                        type="email"
                                        placeholder="tu@email.com"
                                        icon={<Mail />}
                                        required
                                        value={formData.email}
                                        onChange={e => setFormData({ ...formData, email: e.target.value })}
                                    />
                                </div>
                            )}

                            <Input
                                label="Asunto de la consulta"
                                placeholder="Ej: Problema con la importación..."
                                required
                                value={formData.subject}
                                onChange={e => setFormData({ ...formData, subject: e.target.value })}
                            />

                            <div className="space-y-2">
                                <label className="apple-label ml-1">Mensaje detallado</label>
                                <div className="relative group">
                                    <div className="absolute left-4 top-4 text-gray-400 group-focus-within:text-ios-blue transition-colors">
                                        <MessageSquare size={18} className="stroke-[2.2]" />
                                    </div>
                                    <textarea
                                        required
                                        rows={8}
                                        value={formData.message}
                                        onChange={e => setFormData({ ...formData, message: e.target.value })}
                                        className="apple-input-field pl-12 resize-none leading-relaxed"
                                        placeholder="Explícanos con detalle cómo podemos ayudarte..."
                                    />
                                </div>
                            </div>

                            <div className="pt-4">
                                <Button
                                    type="submit"
                                    className="w-full h-16 text-lg shadow-apple-glow"
                                    isLoading={loading}
                                    icon={<Send />}
                                >
                                    Enviar mensaje al equipo
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>

            {/* Footer / Sub-info */}
            <div className="mt-24 pt-12 border-t border-black/5 dark:border-white/5 flex flex-col md:flex-row justify-between items-center gap-8 opacity-50">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest">
                    <Globe size={14} /> Soporte Global • 24/7
                </div>
                <p className="text-[11px] font-bold text-gray-400 uppercase tracking-[0.2em]">
                    © {new Date().getFullYear()} Instrument Collector Team
                </p>
            </div>
        </div>
    );
}
