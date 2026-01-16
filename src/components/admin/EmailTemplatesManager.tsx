'use client';

import { useState, useEffect } from 'react';
import { getEmailTemplates, updateEmailTemplate, sendTestEmail, getEmailAccounts } from '@/actions/admin';
import { Save, Mail, Code, Info, Loader2, CheckCircle, AlertCircle, History, Building, Send } from 'lucide-react';
import { Button } from '../ui/Button';

export default function EmailTemplatesManager() {
    const [templates, setTemplates] = useState<any[]>([]);
    const [accounts, setAccounts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedCode, setSelectedCode] = useState<string | null>(null);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    // Form state
    const [editData, setEditData] = useState({
        subject: '',
        htmlBody: '',
        emailAccountId: ''
    });

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setLoading(true);
        try {
            const [tplRes, accRes] = await Promise.all([
                getEmailTemplates(),
                getEmailAccounts()
            ]);

            if (accRes.success) setAccounts(accRes.data);

            if (tplRes.success) {
                setTemplates(tplRes.data);
                if (tplRes.data.length > 0 && !selectedCode) {
                    handleSelectTemplate(tplRes.data[0]);
                }
            }
        } catch (e) {
            console.error('Error loading data:', e);
        } finally {
            setLoading(false);
        }
    };

    const handleSelectTemplate = (tpl: any) => {
        setSelectedCode(tpl.code);
        setEditData({
            subject: tpl.subject,
            htmlBody: tpl.htmlBody,
            emailAccountId: tpl.emailAccountId || ''
        });
        setMessage(null);
    };

    const handleSave = async () => {
        if (!selectedCode) return;
        setSaving(true);
        setMessage(null);

        const res = await updateEmailTemplate(selectedCode, {
            ...editData,
            emailAccountId: editData.emailAccountId || null
        } as any);

        if (res.success) {
            setMessage({ type: 'success', text: 'Plantilla actualizada correctamente' });
            // Reload templates to get updated history
            const tplRes = await getEmailTemplates();
            if (tplRes.success) setTemplates(tplRes.data);
        } else {
            setMessage({ type: 'error', text: res.error || 'Error al guardar' });
        }
        setSaving(false);
    };

    const handleTest = async () => {
        if (!selectedCode) return;
        const email = window.prompt("Introduce un email para recibir la prueba:");
        if (!email) return;

        setSaving(true);
        const res = await sendTestEmail(editData.emailAccountId || null, email);
        if (res.success) {
            alert("Email enviado correctamente. Revisa tu bandeja de entrada.");
        } else {
            alert("Error: " + res.error);
        }
        setSaving(false);
    };

    const getAccountName = (id: string) => {
        const acc = accounts.find(a => a._id === id);
        return acc ? acc.name : (id ? 'Cuenta Desconocida' : 'Por Defecto');
    };

    if (loading) return <div className="p-10 text-center flex items-center justify-center gap-2"><Loader2 className="animate-spin" /> Cargando datos...</div>;

    const currentTemplate = templates.find(t => t.code === selectedCode);

    return (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">

            {/* Sidebar: Template List */}
            <div className="md:col-span-1 border-r border-gray-200 dark:border-gray-800 pr-4">
                <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4 px-2">Plantillas</h3>
                <div className="space-y-1">
                    {templates.map(t => (
                        <button
                            key={t.code}
                            onClick={() => handleSelectTemplate(t)}
                            className={`w-full text-left px-3 py-2 rounded-xl transition-all text-sm font-medium flex items-center gap-2 ${selectedCode === t.code
                                ? 'bg-ios-blue text-white shadow-lg shadow-blue-500/20'
                                : 'hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-400'}`}
                        >
                            <Mail size={16} />
                            {t.name}
                        </button>
                    ))}
                </div>
            </div>

            {/* Main Editor */}
            <div className="md:col-span-3 space-y-6">
                {selectedCode ? (
                    <div className="bg-white dark:bg-gray-900 rounded-3xl p-6 border border-gray-200 dark:border-gray-800 shadow-sm space-y-6">
                        <div className="flex justify-between items-center">
                            <div>
                                <h1 className="text-xl font-bold">{currentTemplate?.name}</h1>
                                <p className="text-xs text-gray-500 font-mono tracking-tighter uppercase">{selectedCode}</p>
                            </div>
                            <div className="flex gap-2">
                                <Button size="sm" variant="secondary" onClick={handleTest} disabled={saving}>
                                    <Send size={14} className="mr-2" /> Prueba
                                </Button>
                                <Button size="sm" onClick={handleSave} isLoading={saving}>
                                    <Save size={14} className="mr-2" /> Guardar
                                </Button>
                            </div>
                        </div>

                        {message && (
                            <div className={`p-4 rounded-2xl flex items-center gap-3 text-sm animate-in fade-in slide-in-from-top-2 ${message.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                                {message.type === 'success' ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
                                {message.text}
                            </div>
                        )}

                        <div className="space-y-6">
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1 ml-1">Asunto</label>
                                    <input
                                        type="text"
                                        value={editData.subject}
                                        onChange={(e) => setEditData(prev => ({ ...prev, subject: e.target.value }))}
                                        className="apple-input w-full font-medium"
                                        placeholder="Ej: Bienvenido a..."
                                    />
                                </div>

                                <div>
                                    <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1 ml-1 flex items-center gap-2">
                                        <Building size={12} /> Cuenta de Envío
                                    </label>
                                    <select
                                        value={editData.emailAccountId}
                                        onChange={(e) => setEditData(prev => ({ ...prev, emailAccountId: e.target.value }))}
                                        className="apple-input w-full font-medium"
                                    >
                                        <option value="">Por defecto (Configuración Global)</option>
                                        {accounts.map(acc => (
                                            <option key={acc._id} value={acc._id}>
                                                {acc.name} ({acc.fromEmail}) {acc.isDefault ? '[DEFAULT]' : ''}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                                <div className="lg:col-span-3">
                                    <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1 ml-1 flex items-center gap-2">
                                        <Code size={12} /> Cuerpo HTML
                                    </label>
                                    <textarea
                                        value={editData.htmlBody}
                                        onChange={(e) => setEditData(prev => ({ ...prev, htmlBody: e.target.value }))}
                                        className="w-full h-[400px] p-4 font-mono text-sm border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-black rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-none shadow-inner"
                                        placeholder="Escribe el código HTML aquí..."
                                    />
                                </div>
                                <div className="lg:col-span-1 space-y-4">
                                    <div className="bg-ios-bg-gray dark:bg-gray-800/20 p-4 rounded-2xl border border-gray-100 dark:border-gray-800/30">
                                        <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2 mb-3">
                                            <Info size={14} /> Dinámicos
                                        </h4>
                                        <div className="flex flex-wrap gap-1.5">
                                            {currentTemplate?.availableVariables.map((v: string) => (
                                                <code
                                                    key={v}
                                                    className="px-2 py-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded text-[10px] text-ios-blue cursor-pointer hover:bg-ios-blue hover:text-white transition"
                                                    onClick={() => {
                                                        const ta = document.querySelector('textarea');
                                                        if (ta) {
                                                            const start = ta.selectionStart;
                                                            const end = ta.selectionEnd;
                                                            const text = editData.htmlBody;
                                                            const before = text.substring(0, start);
                                                            const after = text.substring(end);
                                                            setEditData({ ...editData, htmlBody: before + `{{${v}}}` + after });
                                                        }
                                                    }}
                                                >
                                                    {'{{' + v + '}}'}
                                                </code>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="bg-blue-50 dark:bg-blue-900/10 p-4 rounded-2xl border border-blue-100 dark:border-blue-900/20 text-[10px] text-blue-600 dark:text-blue-300 leading-relaxed italic">
                                        Tip: Usa HTML inline para los estilos si quieres que se vean bien en Gmail y Outlook. Las variables se reemplazan automáticamente.
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Version History */}
                        {currentTemplate?.history?.length > 0 && (
                            <div className="pt-6 border-t border-gray-100 dark:border-gray-800">
                                <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                                    <History size={16} /> Registro de Cambios
                                </h3>
                                <div className="space-y-2">
                                    {currentTemplate.history.slice().reverse().map((h: any, idx: number) => (
                                        <div key={idx} className="flex items-center justify-between p-3 bg-gray-50/50 dark:bg-gray-800/20 rounded-xl border border-gray-100 dark:border-gray-800/50 hover:bg-white dark:hover:bg-gray-800 transition-colors">
                                            <div className="truncate pr-4 flex-1">
                                                <div className="flex items-center gap-2 mb-0.5">
                                                    <span className="text-xs font-bold text-gray-600 dark:text-gray-300">{new Date(h.updatedAt).toLocaleString()}</span>
                                                    <span className="text-[10px] px-1.5 py-0.5 bg-gray-200 dark:bg-gray-700 rounded text-gray-500 font-medium">
                                                        {getAccountName(h.emailAccountId)}
                                                    </span>
                                                </div>
                                                <p className="text-[10px] text-gray-400 truncate italic">{h.subject}</p>
                                            </div>
                                            <button
                                                onClick={() => {
                                                    setEditData({
                                                        subject: h.subject,
                                                        htmlBody: h.htmlBody,
                                                        emailAccountId: h.emailAccountId || ''
                                                    });
                                                    setMessage({ type: 'success', text: 'Versión antigua cargada. Revisa y pulsa en Guardar para restaurar.' });
                                                }}
                                                className="text-[10px] font-bold text-ios-blue hover:underline uppercase tracking-wider"
                                            >
                                                Restaurar
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center h-80 text-gray-300">
                        <Mail size={64} className="mb-4 opacity-5" strokeWidth={1} />
                        <p className="text-sm font-medium">Selecciona una plantilla para comenzar</p>
                    </div>
                )}
            </div>
        </div>
    );
}
