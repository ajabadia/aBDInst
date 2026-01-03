import { cn } from "@/lib/utils"
// Ensure you have cva or just manual classes. I'll use simple manual classes + cn if no CVA available.
// If cva is available (shadcn pattern), use it. But I see `Button.tsx` might use something.
// I'll stick to a simple implementation without `cva` dependency unless I'm sure it exists. 
// I'll assume `cn` (clsx + twMerge) exists in "@/lib/utils".

interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
    variant?: "default" | "secondary" | "destructive" | "outline" | "success"
}

export function Badge({ className, variant = "default", ...props }: BadgeProps) {
    const variants = {
        default: "border-transparent bg-gray-900 text-gray-50 hover:bg-gray-900/80 dark:bg-gray-50 dark:text-gray-900 dark:hover:bg-gray-50/80",
        secondary: "border-transparent bg-gray-100 text-gray-900 hover:bg-gray-100/80 dark:bg-gray-800 dark:text-gray-50 dark:hover:bg-gray-800/80",
        destructive: "border-transparent bg-red-500 text-gray-50 hover:bg-red-500/80 dark:bg-red-900 dark:text-gray-50 dark:hover:bg-red-900/80",
        outline: "text-gray-950 dark:text-gray-50",
        success: "border-transparent bg-green-500 text-white hover:bg-green-600 dark:bg-green-600 dark:text-white"
    }

    return (
        <div className={cn(
            "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
            variants[variant],
            className
        )} {...props} />
    )
}
