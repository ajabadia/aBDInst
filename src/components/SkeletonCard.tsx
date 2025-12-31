export default function SkeletonCard() {
    return (
        <div className="border border-gray-200 dark:border-gray-800 rounded-xl overflow-hidden shadow-sm bg-white/60 dark:bg-gray-800/40 backdrop-blur-sm">
            <div className="aspect-video bg-gray-200 dark:bg-gray-800 animate-pulse" />
            <div className="p-5 space-y-3">
                <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-3/4 animate-pulse" />
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2 animate-pulse" />
                <div className="flex gap-2 pt-2">
                    <div className="h-5 w-12 bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse" />
                    <div className="h-5 w-16 bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse" />
                </div>
            </div>
        </div>
    );
}
