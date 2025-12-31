export default function SkeletonStats() {
    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            {[...Array(3)].map((_, i) => (
                <div key={i} className="p-8 rounded-[2.5rem] bg-gray-100/50 dark:bg-white/5 border border-gray-200/20 animate-pulse">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-800" />
                        <div className="h-3 w-24 bg-gray-200 dark:bg-gray-800 rounded-full" />
                    </div>
                    <div className="h-10 w-32 bg-gray-200 dark:bg-gray-800 rounded-xl" />
                </div>
            ))}
        </div>
    );
}
