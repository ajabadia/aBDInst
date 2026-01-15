'use client';

import { useState } from 'react';
import { updateSystemConfig } from '@/actions/admin';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

export default function MaintenanceToggle({ initialState }: { initialState: boolean }) {
    const [enabled, setEnabled] = useState(initialState);
    const [loading, setLoading] = useState(false);

    const handleToggle = async (checked: boolean) => {
        setLoading(true);
        // Optimistic update
        setEnabled(checked);

        const res = await updateSystemConfig('maintenance_mode', checked, 'Manual toggle from admin settings');

        if (!res.success) {
            setEnabled(!checked); // Revert
            toast.error('Error actualizando configuración');
        } else {
            toast.success(checked ? 'Modo Mantenimiento ACTIVADO' : 'Modo Mantenimiento DESACTIVADO');
        }
        setLoading(false);
    };

    return (
        <div className="flex items-center gap-3">
            {loading && <Loader2 className="animate-spin text-gray-400" size={16} />}
            <label className="relative inline-flex items-center cursor-pointer">
                <input
                    type="checkbox"
                    className="sr-only peer"
                    checked={enabled}
                    onChange={(e) => handleToggle(e.target.checked)}
                    disabled={loading}
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-ios-blue/20 dark:peer-focus:ring-ios-blue/30 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-ios-blue"></div>
            </label>
        </div>
    );
}
