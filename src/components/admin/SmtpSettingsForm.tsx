'use client';

import { useState, useEffect } from 'react';
import { getEmailAccounts, updateEmailAccount, deleteEmailAccount, migrateLegacySmtp, sendTestEmail } from '@/actions/admin';
import { Button } from '../ui/Button';
import { toast } from 'sonner';
import { Mail, Server, Plus, Trash2, Check, Star, RefreshCw, Send, AlertTriangle, ShieldCheck } from 'lucide-react';

interface Account {
    _id: string;
    name: string;
    host: string;
    port: number;
    user: string;
    pass: string;
    secure: boolean;
    fromEmail: string;
    isDefault: boolean;
}

export default function SmtpSettingsForm() {
    const [accounts, setAccounts] = useState<Account[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [selectedId, setSelectedId] = useState<string | null>(null);

    // Editor data
    const [editData, setEditData] = useState<Partial<Account>>({
        name: '',
        host: '',
        port: 587,
        user: '',
        pass: '',
        secure: false,
        fromEmail: '',
        isDefault: false
    });

    useEffect(() => {
        loadAccounts();
    }, []);

    const loadAccounts = async () => {
        setLoading(true);
        try {
            const res = await getEmailAccounts();
            if (res.success) {
                setAccounts(res.data);
                if (res.data.length > 0 && !selectedId) {
                    handleSelect(res.data[0]);
                }
            }
        } catch (e) {
            toast.error('Error al cargar cuentas');
        } finally {
            setLoading(false);
        }
    };

    const handleSelect = (account: Account | null) => {
        if (account) {
            setSelectedId(account._id);
            setEditData(account);
        } else {
            setSelectedId(null);
            setEditData({
                name: 'Nueva Cuenta',
                host: '',
                port: 587,
                user: '',
                pass: '',
                secure: false,
                fromEmail: '',
                isDefault: false
            });
        }
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            const res = await updateEmailAccount(selectedId, editData);
            if (res.success) {
                toast.success('Cuenta guardada correctamente');
                await loadAccounts();
            } else {
                toast.error('Error al guardar: ' + res.error);
            }
        } catch (e) {
            toast.error('Error de conexión');
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('¿Estás seguro de que quieres eliminar esta cuenta?')) return;
        try {
            const res = await deleteEmailAccount(id);
            if (res.success) {
                toast.success('Cuenta eliminada');
                if (selectedId === id) setSelectedId(null);
                await loadAccounts();
            } else {
                toast.error(res.error);
            }
        } catch (e) {
            toast.error('Error al eliminar');
        }
    };

    const handleMigrate = async () => {
        const toastId = toast.loading('Migrando configuración antigua...');
        try {
            const res = await migrateLegacySmtp();
            if (res.success) {
                toast.success(res.message || 'Migración exitosa', { id: toastId });
                await loadAccounts();
            } else {
                toast.error(res.error, { id: toastId });
            }
        } catch (e) {
            toast.error('Error en migración', { id: toastId });
        }
    };

    const handleTest = async () => {
        const target = prompt("¿A qué email quieres enviar la prueba?", "tu@email.com");
        if (!target) return;

        const toastId = toast.loading('Enviando email de prueba...');
        try {
            const res = await sendTestEmail(selectedId, target);
            if (res.success) {
                toast.success('Email de prueba enviado correctamente', { id: toastId });
            } else {
                toast.error('Error: ' + res.error, { id: toastId });
            }
        } catch (e) {
            toast.error('Error de conexión', { id: toastId });
        }
    };

    if (loading) return <div className="p-10 text-center text-gray-400 font-medium">Cargando cuentas de email...</div>;

    return (
        <div className="space-y-6">

            {accounts.length === 0 && (
                <div className="bg-blue-50 dark:bg-blue-900/10 p-6 rounded-2xl border border-blue-100 dark:border-blue-900/20 flex flex-col items-center text-center gap-4">
                    <Mail size={40} className="text-ios-blue" />
                    <div>
                        <h4 className="text-lg font-bold">No hay cuentas configuradas</h4>
                        <p className="text-sm text-gray-500 max-w-md">Parece que aún no has configurado ninguna cuenta de email o necesitas migrar la configuración antigua.</p>
                    </div>
                    <div className="flex gap-3">
                        <Button onClick={handleMigrate} variant="secondary">
                            <RefreshCw size={16} className="mr-2" /> Migrar Config. Anterior
                        </Button>
                        <Button onClick={() => handleSelect(null)}>
                            <Plus size={16} className="mr-2" /> Crear Primera Cuenta
                        </Button>
                    </div>
                </div>
            )}

            {accounts.length > 0 && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                    {/* Sidebar: Account List */}
                    <div className="lg:col-span-1 space-y-4">
                        <div className="flex items-center justify-between mb-2">
                            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider">Cuentas</h3>
                            <Button size="sm" variant="secondary" onClick={() => handleSelect(null)}>
                                <Plus size={14} />
                            </Button>
                        </div>
                        <div className="space-y-2">
                            {accounts.map(acc => (
                                <div
                                    key={acc._id}
                                    onClick={() => handleSelect(acc)}
                                    className={`p-4 rounded-xl border transition-all cursor-pointer group ${selectedId === acc._id
                                        ? 'bg-ios-blue/5 border-ios-blue shadow-sm'
                                        : 'bg-white dark:bg-gray-900 border-gray-100 dark:border-gray-800 hover:border-ios-blue/50 outline-none'
                                        }`}
                                >
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${selectedId === acc._id ? 'bg-ios-blue text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-500'}`}>
                                                <Mail size={14} />
                                            </div>
                                            <div className="truncate pr-2">
                                                <div className="font-bold text-sm truncate">{acc.name}</div>
                                                <div className="text-xs text-gray-400 truncate">{acc.user}</div>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            {acc.isDefault && <Star size={14} className="text-yellow-500 fill-yellow-500" />}
                                            {!acc.isDefault && (
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); handleDelete(acc._id); }}
                                                    className="opacity-0 group-hover:opacity-100 p-1.5 text-gray-300 hover:text-red-500 transition-all rounded-lg hover:bg-red-50"
                                                >
                                                    <Trash2 size={14} />
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Editor Content */}
                    <div className="lg:col-span-2 space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                        <div className="bg-ios-bg-gray dark:bg-gray-900/50 p-6 rounded-2xl border border-gray-100 dark:border-gray-800 space-y-6">
                            <div className="flex items-center justify-between">
                                <h3 className="text-lg font-bold flex items-center gap-2 uppercase">
                                    <Server size={20} className="text-ios-blue" />
                                    {selectedId ? 'Configuración de Cuenta' : 'Nueva Cuenta SMTP'}
                                </h3>
                                {selectedId && (
                                    <Button size="sm" variant="secondary" onClick={handleTest}>
                                        <Send size={14} className="mr-2" /> Probar Conexión
                                    </Button>
                                )}
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-4">
                                    <div>
                                        <label className="text-xs font-bold text-gray-400 mb-1 block uppercase">Nombre descriptivo</label>
                                        <input
                                            type="text"
                                            value={editData.name}
                                            onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                                            placeholder="Ej: Soporte Técnico"
                                            className="apple-input w-full"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-xs font-bold text-gray-400 mb-1 block uppercase">Email Remitente (From)</label>
                                        <input
                                            type="text"
                                            value={editData.fromEmail}
                                            onChange={(e) => setEditData({ ...editData, fromEmail: e.target.value })}
                                            placeholder='"Nombre" <email@ejemplo.com>'
                                            className="apple-input w-full"
                                        />
                                    </div>
                                    <div className="pt-2">
                                        <label className="flex items-center gap-3 cursor-pointer group">
                                            <div className={`w-10 h-6 rounded-full transition-all relative ${editData.isDefault ? 'bg-ios-blue' : 'bg-gray-300'}`}>
                                                <input
                                                    type="checkbox"
                                                    className="hidden"
                                                    checked={editData.isDefault}
                                                    onChange={(e) => setEditData({ ...editData, isDefault: e.target.checked })}
                                                />
                                                <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${editData.isDefault ? 'left-5' : 'left-1'}`} />
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="text-sm font-bold">Cuenta por defecto</span>
                                                <span className="text-[10px] text-gray-400">Se usará si una plantilla no tiene cuenta asignada.</span>
                                            </div>
                                        </label>
                                    </div>
                                </div>

                                <div className="space-y-4 border-l border-gray-100 dark:border-gray-800 pl-0 md:pl-6">
                                    <div className="flex gap-4">
                                        <div className="flex-1">
                                            <label className="text-xs font-bold text-gray-400 mb-1 block uppercase">Host SMTP</label>
                                            <input
                                                type="text"
                                                value={editData.host}
                                                onChange={(e) => setEditData({ ...editData, host: e.target.value })}
                                                placeholder="smtp.gmail.com"
                                                className="apple-input w-full"
                                            />
                                        </div>
                                        <div className="w-24">
                                            <label className="text-xs font-bold text-gray-400 mb-1 block uppercase">Puerto</label>
                                            <input
                                                type="number"
                                                value={editData.port}
                                                onChange={(e) => setEditData({ ...editData, port: parseInt(e.target.value) })}
                                                className="apple-input w-full"
                                            />
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <input
                                            type="checkbox"
                                            checked={editData.secure}
                                            onChange={(e) => setEditData({ ...editData, secure: e.target.checked })}
                                            className="w-4 h-4 rounded border-gray-300 text-ios-blue"
                                            id="secure-check"
                                        />
                                        <label htmlFor="secure-check" className="text-xs font-bold text-gray-500 cursor-pointer">Usar SSL / Conexión Segura</label>
                                    </div>
                                    <div>
                                        <label className="text-xs font-bold text-gray-400 mb-1 block uppercase">Usuario</label>
                                        <input
                                            type="text"
                                            value={editData.user}
                                            onChange={(e) => setEditData({ ...editData, user: e.target.value })}
                                            autoComplete="off"
                                            className="apple-input w-full"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-xs font-bold text-gray-400 mb-1 block uppercase">Contraseña</label>
                                        <input
                                            type="password"
                                            value={editData.pass}
                                            onChange={(e) => setEditData({ ...editData, pass: e.target.value })}
                                            autoComplete="new-password"
                                            className="apple-input w-full"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="pt-4 border-t border-gray-100 dark:border-gray-800 flex justify-between items-center">
                                <div className="text-[10px] text-gray-400 flex items-center gap-1.5 italic">
                                    <ShieldCheck size={12} className="text-green-500" />
                                    Tus credenciales se cifran en tránsito y se guardan de forma segura.
                                </div>
                                <Button onClick={handleSave} isLoading={saving}>
                                    <Check size={16} className="mr-2" /> Guardar Cuenta
                                </Button>
                            </div>
                        </div>

                        <div className="bg-yellow-50 dark:bg-yellow-900/10 p-4 rounded-xl border border-yellow-100 dark:border-yellow-900/20 text-xs text-yellow-800 dark:text-yellow-200 flex items-start gap-2">
                            <AlertTriangle size={14} className="shrink-0 mt-0.5" />
                            <div>
                                <p className="font-bold mb-1">Nota importante sobre proveedores:</p>
                                <p>Si usas <strong>Gmail</strong>, recuerda usar una "Contraseña de Aplicación". Si usas otros proveedores (SendGrid, Outlook, Mailgun), asegúrate de que el puerto y el protocolo SSL sean los correctos.</p>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
