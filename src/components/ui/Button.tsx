"use client";
import { LucideIcon, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'destructive' | 'danger';
    size?: 'default' | 'sm' | 'lg' | 'icon';
    isLoading?: boolean;
    icon?: LucideIcon;
    children?: React.ReactNode;
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
    
    const variants = {
        primary: "apple-btn-primary",
        secondary: "apple-btn-secondary",
        outline: "apple-btn-outline",
        ghost: "apple-btn-ghost",
        destructive: "apple-btn-destructive",
        danger: "apple-btn-destructive" // legacy support
    };

    const sizes = {
        default: "px-6 py-3 text-[15px]",
        sm: "px-3 py-1.5 text-xs",
        lg: "px-8 py-4 text-lg",
        icon: "p-2.5 aspect-square"
    };

    return (
        <motion.button
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.97 }}
            className={cn(
                "apple-btn", 
                variants[variant] || variants.primary, 
                sizes[size] || sizes.default, 
                className
            )}
            disabled={isLoading || props.disabled}
            {...props as any}
        >
            {isLoading ? (
                <Loader2 className="animate-spin w-5 h-5" />
            ) : (
                Icon && <Icon size={size === 'sm' ? 14 : 19} className={cn("shrink-0", size === 'sm' ? "stroke-[2]" : "stroke-[2.2px]")} />
            )}
            {children && <span>{children}</span>}
        </motion.button>
    );
}
