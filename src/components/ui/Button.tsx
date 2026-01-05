import { LucideIcon, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'destructive' | 'danger'; // danger legacy support
    size?: 'default' | 'sm' | 'lg' | 'icon';
    isLoading?: boolean;
    icon?: LucideIcon;
    children: React.ReactNode;
}

export function Button({
    variant = 'primary',
    size = 'default',
    isLoading,
    icon: Icon,
    children,
    className = '',
    ...props
}: ButtonProps) {
    const baseStyles = "flex items-center justify-center gap-2 rounded-2xl font-semibold transition-all duration-300 active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed disabled:active:scale-100";

    const variants = {
        primary: "apple-button-primary",
        secondary: "apple-button-secondary",
        outline: "bg-transparent border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800",
        ghost: "bg-transparent text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800",
        destructive: "bg-red-50 text-red-600 hover:bg-red-100 dark:bg-red-900/20 dark:hover:bg-red-900/40 border border-transparent hover:border-red-200",
        danger: "bg-red-50 text-red-600 hover:bg-red-100 dark:bg-red-900/20 dark:hover:bg-red-900/40 border border-transparent hover:border-red-200" // alias
    };

    const sizes = {
        default: "px-6 py-3",
        sm: "px-3 py-1.5 text-xs",
        lg: "px-8 py-4 text-lg",
        icon: "p-2 aspect-square"
    };

    // Handle variant fallback
    const variantStyle = variants[variant as keyof typeof variants] || variants.primary;
    const sizeStyle = sizes[size as keyof typeof sizes] || sizes.default;

    return (
        <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.96 }}
            transition={{ type: "spring", stiffness: 400, damping: 10 }}
            className={`${baseStyles} ${variantStyle} ${sizeStyle} ${className}`}
            disabled={isLoading || props.disabled}
            {...props as any}
        >
            {isLoading ? (
                <Loader2 className={`animate-spin ${size === 'sm' ? 'w-3 h-3' : 'w-5 h-5'}`} />
            ) : (
                Icon && <Icon size={size === 'sm' ? 14 : 20} className={size === 'sm' ? "stroke-[2]" : "stroke-[2.5px]"} />
            )}
            <span>{children}</span>
        </motion.button>
    );
}
