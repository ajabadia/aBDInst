'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { Save, Lock, User as UserIcon, MapPin, Globe, Phone, FileText, Trash2, Download } from 'lucide-react';
import { toast } from 'sonner';
import { updateUserProfile, changePassword, deleteAccount } from '@/actions/user';
import { getExportData } from '@/actions/export';
import { useRouter } from 'next/navigation';

interface UserSettingsFormProps {
    user: any;
}

export default function UserSettingsForm({ user }: UserSettingsFormProps) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);

    // Profile State
    const [profile, setProfile] = useState({
        name: user.name || '',
        bio: user.bio || '',
        location: user.location || '',
        website: user.website || '',
        phone: user.phone || '',
    });

    // Sync state if props change (revalidation)
    useEffect(() => {
        setProfile({
            name: user.name || '',
            bio: user.bio || '',
            location: user.location || '',
            website: user.website || '',
            phone: user.phone || '',
        });
    }, [user]);

    const handleProfileUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await updateUserProfile(profile);
            if (res.success) {
                toast.success('Perfil actualizado correctamente');
            } else {
                toast.error(res.error || 'Error al actualizar el perfil');
            }
        } catch (error) {
            toast.error('Algo salió mal');
        } finally {
            setLoading(false);
        }
    };

    const handlePasswordChange = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);
        const formData = new FormData(e.currentTarget);
        try {
            const res = await changePassword(formData);
            if (res.success) {
                toast.success('Contraseña actualizada correctamente');
                (e.target as HTMLFormElement).reset();
            } else {
                toast.error(res.error || 'Error al cambiar la contraseña');
            }
        } catch (error) {
            toast.error('Algo salió mal');
        } finally {
            setLoading(false);
        }
    };

    const handleExport = async () => {
        setLoading(true);
        try {
            const data = await getExportData();
            if (data) {
                const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `instrument-collector-data-${new Date().toISOString().split('T')[0]}.json`;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                URL.revokeObjectURL(url);
                toast.success('Datos exportados con éxito');
            } else {
                toast.error('No se pudieron obtener los datos');
            }
        } catch (error) {
            toast.error('Error al exportar');
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteAccount = async () => {
        if (confirm('¿Estás COMPLETAMENTE seguro? Esta acción es irreversible y eliminará toda tu colección y datos personales.')) {
            const res = await deleteAccount();
            if (res.success) {
                toast.success('Cuenta eliminada con éxito. Esperamos volver a verte.');
                router.push('/');
            } else {
                toast.error(res.error);
            }
        }
    };

    return (
        <div className="space-y-12 max-w-4xl mx-auto">
            {/* Perfil */}
            <div className="bg-white/40 dark:bg-black/20 backdrop-blur-md rounded-[2.5rem] border border-gray-200/50 dark:border-white/10 p-8 shadow-xl">
                <div className="flex items-center gap-3 mb-8">
                    <div className="w-12 h-12 rounded-2xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600">
                        <UserIcon size={24} />
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold">Datos Personales</h2>
                        <p className="text-sm text-gray-500">Información pública y de contacto</p>
                    </div>
                </div>

                <form onSubmit={handleProfileUpdate} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="md:col-span-2">
                        <label className="apple-label">Nombre Completo</label>
                        <input
                            value={profile.name}
                            onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                            className="apple-input"
                            placeholder="Tu nombre"
                        />
                    </div>

                    <div>
                        <label className="apple-label">Ubicación</label>
                        <div className="relative">
                            <input
                                value={profile.location}
                                onChange={(e) => setProfile({ ...profile, location: e.target.value })}
                                className="apple-input pl-10"
                                placeholder="Ej. Madrid, España"
                            />
                            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        </div>
                    </div>

                    <div>
                        <label className="apple-label">Sitio Web</label>
                        <div className="relative">
                            <input
                                value={profile.website}
                                onChange={(e) => setProfile({ ...profile, website: e.target.value })}
                                className="apple-input pl-10"
                                placeholder="https://tuweb.com"
                            />
                            <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        </div>
                    </div>

                    <div className="md:col-span-2">
                        <label className="apple-label">Biografía</label>
                        <div className="relative">
                            <textarea
                                value={profile.bio}
                                onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                                className="w-full p-4 pl-10 font-sans text-sm bg-white/50 dark:bg-black/20 rounded-2xl border border-gray-200 dark:border-white/10 focus:ring-2 focus:ring-blue-500 outline-none transition-all resize-none min-h-[100px]"
                                placeholder="Cuéntanos un poco sobre tu pasión por los instrumentos..."
                            />
                            <FileText className="absolute left-3 top-4 w-4 h-4 text-gray-400" />
                        </div>
                        <p className="text-[10px] text-gray-400 mt-2 px-1">Máximo 500 caracteres.</p>
                    </div>

                    <div className="md:col-span-2 pt-4">
                        <Button
                            type="submit"
                            variant="primary"
                            isLoading={loading}
                            icon={Save}
                            className="w-full md:w-auto px-12"
                        >
                            Guardar Perfil
                        </Button>
                    </div>
                </form>
            </div>

            {/* Seguridad */}
            <div className="bg-white/40 dark:bg-black/20 backdrop-blur-md rounded-[2.5rem] border border-gray-200/50 dark:border-white/10 p-8 shadow-xl">
                <div className="flex items-center gap-3 mb-8">
                    <div className="w-12 h-12 rounded-2xl bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center text-purple-600">
                        <Lock size={24} />
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold">Seguridad</h2>
                        <p className="text-sm text-gray-500">Actualiza tu contraseña de acceso</p>
                    </div>
                </div>

                <form onSubmit={handlePasswordChange} className="space-y-6 max-w-md">
                    <div>
                        <label className="apple-label">Contraseña Actual</label>
                        <input name="currentPassword" type="password" required className="apple-input" />
                    </div>
                    <div>
                        <label className="apple-label">Nueva Contraseña</label>
                        <input name="newPassword" type="password" required className="apple-input" />
                        <p className="text-[10px] text-gray-400 mt-2 px-1">Mínimo 8 caracteres, una mayúscula y un número.</p>
                    </div>
                    <div className="pt-2">
                        <Button
                            type="submit"
                            variant="secondary"
                            isLoading={loading}
                            icon={Lock}
                            className="w-full md:w-auto"
                        >
                            Cambiar Contraseña
                        </Button>
                    </div>
                </form>
            </div>

            {/* Privacidad y Datos */}
            <div className="bg-white/40 dark:bg-black/20 backdrop-blur-md rounded-[2.5rem] border border-gray-200/50 dark:border-white/10 p-8 shadow-xl">
                <div className="flex flex-col md:flex-row justify-between items-center gap-6">
                    <div>
                        <h3 className="text-xl font-bold">Privacidad y Mis Datos</h3>
                        <p className="text-sm text-gray-500">Descarga una copia de toda tu colección y datos personales en formato JSON.</p>
                    </div>
                    <Button
                        variant="secondary"
                        onClick={handleExport}
                        isLoading={loading}
                        icon={Download}
                    >
                        Exportar mis Datos
                    </Button>
                </div>
            </div>

            {/* Zona Peligrosa */}
            <div className="bg-red-50/30 dark:bg-red-900/10 border border-red-100 dark:border-red-900/20 rounded-[2.5rem] p-8">
                <div className="flex flex-col md:flex-row justify-between items-center gap-6">
                    <div>
                        <h3 className="text-lg font-bold text-red-800 dark:text-red-400">Eliminar Cuenta</h3>
                        <p className="text-sm text-red-700/60 dark:text-red-400/60">Se borrarán todos tus datos de forma permanente.</p>
                    </div>
                    <Button
                        variant="secondary"
                        onClick={handleDeleteAccount}
                        icon={Trash2}
                        className="bg-red-100 hover:bg-red-200 dark:bg-red-900/30 dark:hover:bg-red-900/50 text-red-600 border-none"
                    >
                        Eliminar mi cuenta
                    </Button>
                </div>
            </div>
        </div>
    );
}
