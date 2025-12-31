import SkeletonStats from '@/components/skeletons/SkeletonStats';
import SkeletonCollectionItem from '@/components/skeletons/SkeletonCollectionItem';

export default function Loading() {
    return (
        <div className="container mx-auto px-6 py-12 max-w-6xl">

            {/* HEADER SKELETON */}
            <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-8">
                <div className="space-y-4">
                    <div className="h-3 w-32 bg-gray-200 dark:bg-gray-800 rounded-full animate-pulse" />
                    <div className="h-12 w-64 bg-gray-300 dark:bg-gray-700 rounded-2xl animate-pulse" />
                </div>
                <div className="flex gap-3">
                    <div className="h-10 w-24 bg-gray-200 dark:bg-gray-800 rounded-xl animate-pulse" />
                    <div className="h-10 w-40 bg-gray-200 dark:bg-gray-800 rounded-xl animate-pulse" />
                </div>
            </div>

            {/* STATS SKELETON */}
            <SkeletonStats />

            {/* LIST SKELETON */}
            <div className="space-y-6">
                <div className="h-4 w-40 bg-gray-100 dark:bg-gray-900 rounded-full ml-4 mb-4 animate-pulse" />
                <div className="grid grid-cols-1 gap-6">
                    {[...Array(4)].map((_, i) => (
                        <SkeletonCollectionItem key={i} />
                    ))}
                </div>
            </div>
        </div>
    );
}
