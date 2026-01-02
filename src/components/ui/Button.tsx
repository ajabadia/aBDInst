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
    const baseStyles = "rounded-full font-medium transition-all duration-200 active:scale-[0.98] flex items-center justify-center gap-2 px-6 py-2.5 disabled:opacity-70 disabled:cursor-not-allowed disabled:active:scale-100";

    const variants = {
        primary: "bg-[#0071e3] hover:bg-[#0077ed] text-white shadow-sm hover:shadow-md hover:shadow-blue-500/20",
        secondary: "bg-[#f5f5f7] hover:bg-[#e8e8ed] text-[#1d1d1f] dark:bg-[#1c1c1e] dark:hover:bg-[#2c2c2e] dark:text-white border border-transparent dark:border-gray-800",
        outline: "bg-transparent border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800",
        ghost: "bg-transparent text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800",
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
