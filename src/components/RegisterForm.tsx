'use client';

import { registerUser } from "@/actions/register";
import { useState } from "react";
import Link from 'next/link';
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Mail, Lock, User, Music } from 'lucide-react';
import { Input } from "./ui/Input";
import { Button } from "./ui/Button";

export default function RegisterForm() {
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setLoading(true);

        const formData = new FormData(event.currentTarget);
        const res = await registerUser(formData);

        if (res.success) {
            toast.success('Cuenta creada', { description: 'Ya puedes iniciar sesión.' });
            router.push('/login');
        } else {
            toast.error('Error', { description: res.error });
            setLoading(false);
        }
    }

    return (
        <div className="w-full max-w-md animate-in fade-in zoom-in-95 duration-500">
            <div className="glass-panel p-10 md:p-14 rounded-[3rem] shadow-apple-lg border-white/20">

                {/* Header */}
                <div className="flex flex-col items-center mb-12">
                    <div className="w-20 h-20 rounded-2xl bg-ios-indigo flex items-center justify-center mb-6 shadow-lg shadow-ios-indigo/30 scale-110">
                        <Music className="text-white w-10 h-10" strokeWidth={2.5} />
                    </div>
                    <h2 className="text-4xl font-bold tracking-tight text-gray-900 dark:text-white">
                        Crear Cuenta
                    </h2>
                    <p className="text-gray-500 dark:text-gray-400 mt-3 text-center font-medium">
                        Tu viaje como coleccionista empieza aquí.
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <Input
                        label="Nombre completo"
                        name="name"
                        type="text"
                        placeholder="Nombre y apellidos"
                        icon={User}
                        required
                    />
                    <Input
                        label="Correo electrónico"
                        name="email"
                        type="email"
                        placeholder="tu@email.com"
                        icon={Mail}
                        required
                    />
                    <Input
                        label="Establecer contraseña"
                        name="password"
                        type="password"
                        placeholder="••••••••"
                        icon={Lock}
                        required
                    />
                    <Input
                        label="Repetir contraseña"
                        name="confirmPassword"
                        type="password"
                        placeholder="••••••••"
                        icon={Lock}
                        required
                    />

                    <div className="pt-6">
                        <Button type="submit" variant="primary" isLoading={loading} className="w-full py-4 text-lg bg-ios-indigo hover:bg-ios-indigo/90 shadow-ios-indigo/20">
                            Registrarse
                        </Button>
                    </div>
                </form>

                <div className="mt-12 text-center">
                    <p className="text-sm text-gray-500 font-medium">
                        ¿Ya tienes una cuenta?{' '}
                        <Link href="/login" className="text-ios-indigo font-bold hover:underline decoration-2 underline-offset-4">
                            Inicia sesión
                        </Link>
                    </p>
                </div>
            </div>

            <p className="mt-10 text-center text-[11px] text-gray-400 font-bold uppercase tracking-[0.2em] px-10 leading-relaxed opacity-60">
                Privacidad absoluta • Sin anuncios
            </p>
        </div>
    );
}
