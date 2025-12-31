import SkeletonCard from '@/components/SkeletonCard';

export default function Loading() {
    return (
        <div className="container mx-auto p-4 max-w-6xl">
            <div className="flex justify-between items-center mb-6">
                <div className="h-8 bg-gray-200 dark:bg-gray-800 rounded w-64 animate-pulse" />
                <div className="h-10 bg-gray-200 dark:bg-gray-800 rounded w-32 animate-pulse hidden md:block" />
            </div>

            <div className="mb-6 h-10 bg-gray-200 dark:bg-gray-800 rounded-lg animate-pulse" />

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                    <SkeletonCard key={i} />
                ))}
            </div>
        </div>
    );
}
