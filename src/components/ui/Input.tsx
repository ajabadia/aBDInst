import * as React from "react"
import { cn } from "@/lib/utils"

export interface InputProps
    extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    icon?: React.ElementType;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
    ({ className, type, label, icon: Icon, ...props }, ref) => {
        const inputElement = (
            <div className="relative w-full group">
                {Icon && (
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-ios-blue transition-colors pointer-events-none">
                        <Icon className="w-4 h-4 stroke-[2.2]" />
                    </div>
                )}
                <input
                    type={type}
                    className={cn(
                        "apple-input-field w-full",
                        Icon && "pl-11",
                        className
                    )}
                    ref={ref}
                    {...props}
                />
            </div>
        );

        if (label) {
            return (
                <div className="w-full space-y-2">
                    <label className="apple-label !mb-0 ml-1">
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
