import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
    return (
        <div className="container mx-auto p-4 md:p-8 max-w-7xl animate-pulse">
            {/* Header Skeleton */}
            <div className="flex flex-col md:flex-row justify-between items-start gap-6 mb-8">
                <div className="space-y-4 w-full md:w-2/3">
                    <Skeleton className="h-4 w-24 rounded-full" />
                    <Skeleton className="h-12 w-3/4 rounded-xl" />
                    <Skeleton className="h-6 w-1/2 rounded-lg" />
                </div>
                <div className="flex gap-2">
                    <Skeleton className="h-10 w-10 rounded-full" />
                    <Skeleton className="h-10 w-32 rounded-full" />
                </div>
            </div>

            {/* Grid Skeleton */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Main Image Area */}
                <div className="md:col-span-2 space-y-6">
                    <Skeleton className="w-full aspect-video rounded-3xl" />
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <Skeleton className="h-32 rounded-2xl" />
                        <Skeleton className="h-32 rounded-2xl" />
                        <Skeleton className="h-32 rounded-2xl" />
                        <Skeleton className="h-32 rounded-2xl" />
                    </div>
                </div>

                {/* Sidebar Info */}
                <div className="space-y-6">
                    <Skeleton className="h-64 w-full rounded-3xl" />
                    <Skeleton className="h-48 w-full rounded-3xl" />
                </div>
            </div>
        </div>
    );
}
