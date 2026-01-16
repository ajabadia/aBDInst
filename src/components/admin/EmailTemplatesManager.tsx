'use client';

import { useState, useEffect } from 'react';
import { getEmailTemplates, updateEmailTemplate, sendTestEmail } from '@/actions/admin';
import { Save, Mail, Code, Info, Loader2, CheckCircle, AlertCircle } from 'lucide-react';

export default function EmailTemplatesManager() {
    const [templates, setTemplates] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedCode, setSelectedCode] = useState<string | null>(null);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    // Form state
    const [editData, setEditData] = useState({
        subject: '',
        htmlBody: ''
    });

    useEffect(() => {
        loadTemplates();
    }, []);

    const loadTemplates = async () => {
        setLoading(true);
        const res = await getEmailTemplates();
        if (res.success) {
            setTemplates(res.data);
            if (res.data.length > 0 && !selectedCode) {
                handleSelectTemplate(res.data[0]);
            }
        }
        setLoading(false);
    };

    const handleSelectTemplate = (tpl: any) => {
        setSelectedCode(tpl.code);
        setEditData({
            subject: tpl.subject,
            htmlBody: tpl.htmlBody
        });
        setMessage(null);
    };

    const handleSave = async () => {
        if (!selectedCode) return;
        setSaving(true);
        setMessage(null);

        const res = await updateEmailTemplate(selectedCode, editData);

        if (res.success) {
            setMessage({ type: 'success', text: 'Plantilla actualizada correctamente' });
            // Refresh local list
            setTemplates(prev => prev.map(t => t.code === selectedCode ? { ...t, ...editData } : t));
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
        const res = await sendTestEmail('general', email); // Use general for tests
        if (res.success) {
            alert("Email enviado correctamente. Revisa tu bandeja de entrada.");
        } else {
            alert("Error: " + res.error);
        }
        setSaving(false);
    };

    if (loading) return <div className="p-10 text-center flex items-center justify-center gap-2"><Loader2 className="animate-spin" /> Cargando plantillas...</div>;

    const currentTemplate = templates.find(t => t.code === selectedCode);

    return (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">

            {/* Sidebar: Template List */}
            <div className="md:col-span-1 border-r border-gray-200 dark:border-gray-800 pr-4">
                <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4 px-2">Plantillas Disponibles</h3>
                <div className="space-y-1">
                    {templates.map(t => (
                        <button
                            key={t.code}
                            onClick={() => handleSelectTemplate(t)}
                            className={`w-full text-left px-3 py-2 rounded-xl transition-all text-sm font-medium flex items-center gap-2 ${selectedCode === t.code
                                ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20'
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
                                <h2 className="text-xl font-bold">{currentTemplate?.name}</h2>
                                <p className="text-xs text-gray-500 font-mono">{selectedCode}</p>
                            </div>
                            <div className="flex gap-2">
                                <button
                                    onClick={handleTest}
                                    disabled={saving}
                                    className="px-4 py-2 text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition font-medium border border-gray-200 dark:border-gray-700"
                                >
                                    Enviar Prueba
                                </button>
                                <button
                                    onClick={handleSave}
                                    disabled={saving}
                                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl font-medium transition disabled:opacity-50 flex items-center gap-2"
                                >
                                    {saving ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
                                    Guardar Cambios
                                </button>
                            </div>
                        </div>

                        {message && (
                            <div className={`p-4 rounded-2xl flex items-center gap-3 text-sm ${message.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                                {message.type === 'success' ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
                                {message.text}
                            </div>
                        )}

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Asunto del Email</label>
                                <input
                                    type="text"
                                    value={editData.subject}
                                    onChange={(e) => setEditData(prev => ({ ...prev, subject: e.target.value }))}
                                    className="apple-input w-full font-medium"
                                    placeholder="Introduce el asunto..."
                                />
                            </div>

                            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                                <div className="lg:col-span-3">
                                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2 font-mono flex items-center gap-2">
                                        <Code size={16} /> Cuerpo HTML
                                    </label>
                                    <textarea
                                        value={editData.htmlBody}
                                        onChange={(e) => setEditData(prev => ({ ...prev, htmlBody: e.target.value }))}
                                        className="w-full h-[400px] p-4 font-mono text-sm border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-black rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-none"
                                        placeholder="Escribe el código HTML aquí..."
                                    />
                                </div>
                                <div className="lg:col-span-1 space-y-4">
                                    <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-2xl border border-blue-100 dark:border-blue-900/30">
                                        <h4 className="text-xs font-bold text-blue-700 dark:text-blue-400 uppercase tracking-widest flex items-center gap-2 mb-3">
                                            <Info size={14} /> Variables
                                        </h4>
                                        <div className="flex flex-wrap gap-2">
                                            {currentTemplate?.availableVariables.map((v: string) => (
                                                <code
                                                    key={v}
                                                    className="px-2 py-1 bg-white dark:bg-gray-800 border border-blue-200 dark:border-blue-800 rounded text-[10px] text-blue-600 dark:text-blue-300 cursor-pointer hover:bg-blue-100 transition"
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
                                        <p className="text-[10px] text-gray-500 mt-4 leading-relaxed">
                                            Copia y pega o haz clic en las variables para insertarlas en el editor.
                                        </p>
                                    </div>

                                    <div className="bg-gray-50 dark:bg-gray-800/50 p-4 rounded-2xl border border-gray-100 dark:border-gray-800">
                                        <h4 className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2">Ayuda</h4>
                                        <p className="text-[10px] text-gray-400 leading-relaxed">
                                            Usa HTML estándar. Los estilos inline son recomendados para máxima compatibilidad con clientes de correo.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center h-full text-gray-400 py-20">
                        <Mail size={48} className="mb-4 opacity-10" />
                        <p>Selecciona una plantilla para comenzar a editar.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
