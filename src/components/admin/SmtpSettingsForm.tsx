'use client';

import { useState, useEffect } from 'react';
import { getSystemConfig, updateSystemConfig } from '@/actions/admin';
import { Button } from '../ui/Button';
import { toast } from 'sonner';
import { Mail, Shield, Server, User, Key, Save, RefreshCw, Send, AlertTriangle } from 'lucide-react';
import { verifySmtpConfig } from '@/lib/email';

export default function SmtpSettingsForm() {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [testing, setTesting] = useState(false);

    // Form State
    const [config, setConfig] = useState({
        host: '',
        port: 587,
        user: '',
        pass: '',
        secure: false,
        senders: {
            general: '',
            support: '',
            alerts: ''
        }
    });

    useEffect(() => {
        loadConfig();
    }, []);

    const loadConfig = async () => {
        setLoading(true);
        try {
            const stored = await getSystemConfig('smtp_settings');
            if (stored) {
                setConfig(prev => ({ ...prev, ...stored }));
            }
        } catch (e) {
            toast.error('Error al cargar configuración');
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            const res = await updateSystemConfig('smtp_settings', config, 'Updated SMTP Configuration');
            if (res.success) {
                toast.success('Configuración guardada correctamente');
            } else {
                toast.error('Error al guardar: ' + res.error);
            }
        } catch (e) {
            toast.error('Error de conexión');
        } finally {
            setSaving(false);
        }
    };


    const handleTest = async (channel: 'general' | 'support' | 'alerts', email: string) => {
        if (!email) {
            toast.error('Define un email remitente primero');
            return;
        }

        // Use user's own email if possible, or a test address prompts
        const testTarget = prompt("¿A qué email quieres enviar la prueba?", "tu@email.com");
        if (!testTarget) return;

        const toastId = toast.loading(`Enviando prueba vía ${channel}...`);

        try {
            // Need to dynamic import or pass action prop if not imported top-level
            // We imported sendTestEmail from actions/admin
            const { sendTestEmail } = await import('@/actions/admin');
            const res = await sendTestEmail(channel, testTarget);

            if (res.success) {
                toast.success('Prueba enviada correctamente', { id: toastId });
            } else {
                toast.error('Error en prueba: ' + res.error, { id: toastId });
            }
        } catch (e) {
            toast.error('Error de conexión', { id: toastId });
        }
    };

    if (loading) return <div className="p-10 text-center text-gray-400">Cargando configuración...</div>;

    return (
        <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

                {/* Connection Settings */}
                <div className="space-y-6">
                    <h3 className="text-lg font-bold flex items-center gap-2">
                        <Server size={20} className="text-ios-blue" />
                        Conexión SMTP
                    </h3>

                    <div className="space-y-4">
                        <div>
                            <label className="text-sm font-medium text-gray-500 mb-1 block">Host (Servidor)</label>
                            <input
                                type="text"
                                value={config.host}
                                onChange={(e) => setConfig({ ...config, host: e.target.value })}
                                placeholder="smtp.gmail.com"
                                className="apple-input w-full"
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="text-sm font-medium text-gray-500 mb-1 block">Puerto</label>
                                <input
                                    type="number"
                                    value={config.port}
                                    onChange={(e) => setConfig({ ...config, port: parseInt(e.target.value) })}
                                    className="apple-input w-full"
                                />
                            </div>
                            <div className="flex items-end pb-3">
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={config.secure}
                                        onChange={(e) => setConfig({ ...config, secure: e.target.checked })}
                                        className="w-5 h-5 rounded border-gray-300 text-ios-blue focus:ring-ios-blue"
                                    />
                                    <span className="text-sm font-medium">SSL/Secure</span>
                                </label>
                            </div>
                        </div>
                        <div>
                            <label className="text-sm font-medium text-gray-500 mb-1 block">Usuario</label>
                            <input
                                type="text"
                                value={config.user}
                                onChange={(e) => setConfig({ ...config, user: e.target.value })}
                                autoComplete="off"
                                className="apple-input w-full"
                            />
                        </div>
                        <div>
                            <label className="text-sm font-medium text-gray-500 mb-1 block">Contraseña</label>
                            <input
                                type="password"
                                value={config.pass}
                                onChange={(e) => setConfig({ ...config, pass: e.target.value })}
                                autoComplete="new-password"
                                className="apple-input w-full"
                            />
                        </div>
                    </div>
                </div>

                {/* Sender Identities */}
                <div className="space-y-6">
                    <h3 className="text-lg font-bold flex items-center gap-2">
                        <Mail size={20} className="text-purple-500" />
                        Identidades (Remitentes)
                    </h3>
                    <p className="text-xs text-gray-400 -mt-4 mb-4">
                        Define qué email (y nombre) se mostrará para cada tipo de comunicación.
                        Usa el botón "Test" para verificar cada canal.
                    </p>

                    <div className="space-y-4">
                        <div>
                            <label className="text-sm font-medium text-gray-500 mb-1 block">General / Sistema</label>
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    value={config.senders.general}
                                    onChange={(e) => setConfig({ ...config, senders: { ...config.senders, general: e.target.value } })}
                                    placeholder='"Instrument Collector" <noreply@example.com>'
                                    className="apple-input w-full"
                                />
                                <Button size="sm" variant="secondary" onClick={() => handleTest('general', config.senders.general)} disabled={!config.senders.general}>
                                    Test
                                </Button>
                            </div>
                        </div>
                        <div>
                            <label className="text-sm font-medium text-gray-500 mb-1 block">Soporte y Contacto</label>
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    value={config.senders.support}
                                    onChange={(e) => setConfig({ ...config, senders: { ...config.senders, support: e.target.value } })}
                                    placeholder='"Soporte" <support@example.com>'
                                    className="apple-input w-full"
                                />
                                <Button size="sm" variant="secondary" onClick={() => handleTest('support', config.senders.support)} disabled={!config.senders.support}>
                                    Test
                                </Button>
                            </div>
                        </div>
                        <div>
                            <label className="text-sm font-medium text-gray-500 mb-1 block">Alertas de Precio</label>
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    value={config.senders.alerts}
                                    onChange={(e) => setConfig({ ...config, senders: { ...config.senders, alerts: e.target.value } })}
                                    placeholder='"Alertas" <alerts@example.com>'
                                    className="apple-input w-full"
                                />
                                <Button size="sm" variant="secondary" onClick={() => handleTest('alerts', config.senders.alerts)} disabled={!config.senders.alerts}>
                                    Test
                                </Button>
                            </div>
                        </div>

                        <div className="bg-yellow-50 dark:bg-yellow-900/10 p-4 rounded-xl border border-yellow-100 dark:border-yellow-900/20 text-xs text-yellow-800 dark:text-yellow-200 flex items-start gap-2">
                            <AlertTriangle size={14} className="shrink-0 mt-0.5" />
                            <p>
                                Nota: Asegúrate de que tu servidor SMTP permita enviar desde estas direcciones (Aliases) o usará el usuario autenticado por defecto para evitar bloqueos.
                                Guarda los cambios antes de probar si has modificado credenciales.
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-6 border-t border-gray-100 dark:border-gray-800">
                <Button onClick={handleSave} isLoading={saving}>
                    <Save size={16} className="mr-2" /> Guardar Configuración
                </Button>
            </div>
        </div>
    );
}
