'use client';

// Minimalist Spec Row component
// Apple-style: clean lines, subtle text hierarchy, no heavy boxes

interface SpecRowProps {
    label: string;
    value: string;
}

export default function SpecRow({ label, value }: SpecRowProps) {
    return (
        <div className="flex justify-between py-3 border-b border-gray-100 dark:border-gray-800 last:border-0 hover:bg-gray-50 dark:hover:bg-gray-800/20 transition-colors px-2 rounded-sm">
            <dt className="text-sm text-gray-500 dark:text-gray-400 font-medium">{label}</dt>
            <dd className="text-sm text-gray-900 dark:text-gray-100 text-right font-medium">{value}</dd>
        </div>
    );
}
