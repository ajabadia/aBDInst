export default function SkeletonCollectionItem() {
    return (
        <div className="bg-white/40 dark:bg-white/5 backdrop-blur-md rounded-[2.5rem] border border-gray-200/50 dark:border-white/10 p-6 flex flex-col md:flex-row gap-8 items-center animate-pulse">

            {/* IMAGEN FANTASMA */}
            <div className="w-32 h-32 rounded-3xl bg-gray-200 dark:bg-gray-800 flex-shrink-0" />

            {/* INFO FANTASMA */}
            <div className="flex-grow space-y-4">
                <div className="flex justify-center md:justify-start gap-2">
                    <div className="h-5 w-16 bg-gray-200 dark:bg-gray-800 rounded-full" />
                    <div className="h-5 w-20 bg-gray-200 dark:bg-gray-800 rounded-full" />
                </div>
                <div className="h-8 w-3/4 bg-gray-200 dark:bg-gray-800 rounded-lg mx-auto md:mx-0" />
                <div className="h-4 w-1/2 bg-gray-100 dark:bg-gray-900 rounded-md mx-auto md:mx-0" />
            </div>

            {/* VALOR FANTASMA (DERECHA) */}
            <div className="w-full md:w-32 h-16 border-t md:border-t-0 md:border-l border-gray-100 dark:border-white/5 pt-4 md:pt-0 md:pl-8 flex flex-col items-center md:items-end justify-center gap-2">
                <div className="h-3 w-16 bg-gray-100 dark:bg-gray-900 rounded-full" />
                <div className="h-6 w-20 bg-gray-200 dark:bg-gray-800 rounded-lg" />
            </div>
        </div>
    );
}
