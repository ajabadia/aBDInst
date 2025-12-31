import { LucideIcon, Loader2 } from 'lucide-react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary';
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
    const baseClass = variant === 'primary' ? 'apple-button-primary' : 'apple-button-secondary';

    return (
        <button
            className={`${baseClass} ${className}`}
            disabled={isLoading || props.disabled}
            {...props}
        >
            {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
                Icon && <Icon size={18} />
            )}
            <span>{children}</span>
        </button>
    );
}
