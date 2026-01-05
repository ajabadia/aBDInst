import * as React from "react"
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export interface InputProps
    extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    icon?: React.ElementType; // Lucide icon or similar
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
    ({ className, type, label, icon: Icon, ...props }, ref) => {
        const inputElement = (
            <div className="relative w-full">
                {Icon && (
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none">
                        <Icon className="w-4 h-4" />
                    </div>
                )}
                <input
                    type={type}
                    className={cn(
                        "apple-input w-full",
                        Icon && "pl-10",
                        className
                    )}
                    ref={ref}
                    {...props}
                />
            </div>
        );

        if (label) {
            return (
                <div className="w-full space-y-1.5">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300 pointer-events-none">
                        {label}
                    </label>
                    {inputElement}
                </div>
            );
        }

        return inputElement;
    }
)
Input.displayName = "Input"

export { Input }
