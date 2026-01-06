'use client';

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Clock, User as UserIcon, Calendar, ArrowRight, History } from 'lucide-react';
import { cn } from "@/lib/utils";

interface HistoryEntry {
    value: any;
    updatedAt: string;
    updatedBy?: string;
}

interface ConfigHistoryModalProps {
    isOpen: boolean;
    onClose: () => void;
    configKey: string;
    history: HistoryEntry[];
}

export default function ConfigHistoryModal({ isOpen, onClose, configKey, history }: ConfigHistoryModalProps) {
    // Sort by date desc
    const sortedHistory = [...history].sort((a, b) =>
        new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    );

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-2xl max-h-[85vh] flex flex-col p-0" onClose={onClose}>
                <DialogHeader className="p-8 pb-4">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-ios-indigo/10 text-ios-indigo rounded-xl">
                            <History size={20} />
                        </div>
                        <DialogTitle className="text-2xl font-bold tracking-tight">Registro de Cambios</DialogTitle>
                    </div>
                    <p className="text-sm text-gray-500 font-medium px-1 uppercase tracking-wider">
                        Atributo: <span className="text-ios-blue font-bold">{configKey}</span>
                    </p>
                </DialogHeader>

                <div className="flex-1 overflow-y-auto px-8 pb-10 space-y-8 custom-scrollbar">
                    {sortedHistory.length === 0 ? (
                        <div className="py-20 text-center space-y-4">
                            <Clock className="w-12 h-12 mx-auto text-gray-200" />
                            <p className="text-gray-400 font-medium">No hay registros históricos previos.</p>
                        </div>
                    ) : (
                        <div className="space-y-10 relative before:absolute before:left-4 before:top-2 before:bottom-2 before:w-[1px] before:bg-black/5 dark:before:bg-white/10">
                            {sortedHistory.map((entry, idx) => (
                                <div key={idx} className="relative pl-10 group">
                                    {/* Indicator Dot */}
                                    <div className="absolute left-[13px] top-1.5 w-2.5 h-2.5 rounded-full bg-white dark:bg-black border-2 border-ios-indigo z-10 shadow-sm transition-transform group-hover:scale-125" />

                                    <div className="space-y-3">
                                        {/* Entry Metadata */}
                                        <div className="flex flex-wrap items-center gap-3">
                                            <div className="flex items-center gap-1.5 text-sm font-bold text-gray-900 dark:text-white">
                                                <Calendar size={14} className="text-gray-400" />
                                                {format(new Date(entry.updatedAt), "d 'de' MMMM, yyyy", { locale: es })}
                                            </div>
                                            <span className="w-1 h-1 rounded-full bg-gray-300 dark:bg-gray-700" />
                                            <div className="flex items-center gap-1.5 text-xs font-bold text-ios-blue uppercase tracking-widest">
                                                <Clock size={12} />
                                                {format(new Date(entry.updatedAt), "HH:mm", { locale: es })}
                                            </div>
                                            {entry.updatedBy && (
                                                <div className="ml-auto flex items-center gap-1.5 px-2 py-0.5 bg-black/5 dark:bg-white/5 rounded-lg text-[10px] font-bold text-gray-400 uppercase tracking-tighter">
                                                    <UserIcon size={10} />
                                                    ID: {entry.updatedBy.slice(-6)}
                                                </div>
                                            )}
                                        </div>

                                        {/* Value Preview (Console Style) */}
                                        <div className="bg-black/[0.02] dark:bg-white/[0.03] rounded-2xl p-5 border border-black/5 dark:border-white/5 group-hover:border-ios-indigo/20 transition-colors">
                                            <pre className="font-mono text-[11px] leading-relaxed text-gray-600 dark:text-gray-400 overflow-x-auto whitespace-pre-wrap max-h-48 custom-scrollbar">
                                                {typeof entry.value === 'string' ? entry.value : JSON.stringify(entry.value, null, 2)}
                                            </pre>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Apple Style Modal Footer */}
                <div className="p-6 bg-black/[0.02] dark:bg-white/[0.02] border-t border-black/5 dark:border-white/5 text-center">
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em]">
                        Archivo de Auditoría • Sistema Maestro v2.0
                    </p>
                </div>
            </DialogContent>
        </Dialog>
    );
}
