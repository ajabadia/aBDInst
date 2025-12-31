import { LucideIcon } from 'lucide-react';
import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    icon?: LucideIcon;
}

export function Input({ label, icon: Icon, ...props }: InputProps) {
    return (
        <div className="w-full">
            {label && <label className="apple-label">{label}</label>}
            <div className="relative group" suppressHydrationWarning>
                {Icon && (
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-500 transition-colors">
                        <Icon size={18} />
                    </div>
                )}
                <input
                    className={`apple-input ${Icon ? 'pl-11' : 'pl-4'} ${props.className || ''}`}
                    {...props}
                />
            </div>
        </div>
    );
}
