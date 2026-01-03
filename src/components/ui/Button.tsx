import { LucideIcon, Loader2 } from 'lucide-react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
    isLoading?: boolean;
    icon?: LucideIcon;
    children: React.ReactNode;
}

export function Button({
    variant = 'primary',
    isLoading,
    icon: Icon,
    children,
    className = '',
    ...props
}: ButtonProps) {
    const baseStyles = "disabled:opacity-70 disabled:cursor-not-allowed disabled:active:scale-100";

    const commonLayout = "flex items-center justify-center gap-2 px-6 py-3 rounded-2xl font-semibold transition-all duration-300 active:scale-[0.98]";

    const variants = {
        primary: "apple-button-primary", // CSS class handles layout & style
        secondary: "apple-button-secondary", // CSS class handles layout & style
        outline: `${commonLayout} bg-transparent border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800`,
        ghost: `${commonLayout} bg-transparent text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800`,
    };

    const variantStyles = variants[variant as keyof typeof variants] || variants.primary;

    return (
        <button
            className={`${baseStyles} ${variantStyles} ${className}`}
            disabled={isLoading || props.disabled}
            {...props}
        >
            {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
                Icon && <Icon size={20} className="stroke-[2.5px]" /> // Thicker stroke for Apple-like clarity at 20px
            )}
            <span>{children}</span>
        </button>
    );
}
