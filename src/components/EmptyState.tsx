import Link from 'next/link';
import { ReactNode } from 'react';

interface EmptyStateProps {
    title: string;
    description: string;
    actionLabel?: string;
    actionHref?: string;
    icon?: ReactNode;
}

export default function EmptyState({ title, description, actionLabel, actionHref, icon }: EmptyStateProps) {
    return (
        <div className="flex flex-col items-center justify-center py-20 px-4 text-center bg-white/40 dark:bg-gray-900/40 backdrop-blur-sm border border-gray-200/50 dark:border-gray-800/50 rounded-2xl border-dashed">
            <div className="bg-gray-100 dark:bg-gray-800 p-6 rounded-full mb-6 relative">
                <div className="text-6xl grayscale opacity-80 animate-pulse-slow">
                    {icon || '✨'}
                </div>
            </div>

            <h3 className="text-xl font-bold mb-2 text-gray-900 dark:text-white">
                {title}
            </h3>

            <p className="text-gray-500 dark:text-gray-400 max-w-sm mb-8">
                {description}
            </p>

            {actionLabel && actionHref && (
                <Link
                    href={actionHref}
                    className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 shadow-lg hover:shadow-blue-500/30 transition-all duration-300"
                >
                    {actionLabel}
                </Link>
            )}
        </div>
    );
}
