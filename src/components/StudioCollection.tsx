'use client';

import { useState, useMemo } from 'react';
import CollectionItemCard from './CollectionItemCard';
import TagFilter from './TagFilter';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, LayoutGrid } from 'lucide-react';
import { cn } from '@/lib/utils';

import VirtualizedStudioList from './VirtualizedStudioList';

interface StudioCollectionProps {
    collection: any[];
    allTags?: string[];
}

export default function StudioCollection({ collection, allTags = [] }: StudioCollectionProps) {
    const [filter, setFilter] = useState('All');
    const [selectedTags, setSelectedTags] = useState<string[]>([]);

    // Extract unique locations and sort them
    const locations = useMemo(() => {
        const locs = collection.map(item => item.location || 'Sin Ubicación');
        return ['All', ...Array.from(new Set(locs))];
    }, [collection]);

    const filteredItems = useMemo(() => {
        let items = collection;

        // Filter by location
        if (filter !== 'All') {
            items = items.filter(item => (item.location || 'Sin Ubicación') === filter);
        }

        // Filter by tags
        if (selectedTags.length > 0) {
            items = items.filter(item =>
                item.tags && item.tags.some((tag: string) => selectedTags.includes(tag))
            );
        }

        return items;
    }, [collection, filter, selectedTags]);

    return (
        <div className="space-y-8">
            {/* Header & Filter */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-xs font-bold uppercase tracking-widest text-gray-400 ml-1 mb-1 flex items-center gap-2">
                        <LayoutGrid size={14} /> Inventario ({filteredItems.length})
                    </h2>
                </div>

                {/* Pill Selector */}
                <div className="flex flex-wrap gap-2">
                    {locations.map(loc => (
                        <button
                            key={loc}
                            onClick={() => setFilter(loc)}
                            className={cn(
                                "px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-200 border",
                                filter === loc
                                    ? "bg-gray-900 text-white dark:bg-white dark:text-black border-transparent shadow-md transform scale-105"
                                    : "bg-transparent text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 border-gray-200 dark:border-gray-800"
                            )}
                        >
                            {loc === 'All' ? 'Todo' : loc}
                        </button>
                    ))}
                </div>
            </div>

            {/* Tags Filter */}
            {allTags.length > 0 && (
                <TagFilter
                    allTags={allTags}
                    selectedTags={selectedTags}
                    onTagsChange={setSelectedTags}
                />
            )}

            {/* Grid or Virtual List */}
            {filteredItems.length > 50 ? (
                <VirtualizedStudioList items={filteredItems} />
            ) : (
                <motion.div
                    layout
                    className="grid grid-cols-1 gap-6"
                >
                    <AnimatePresence mode="popLayout">
                        {filteredItems.map((item) => (
                            <motion.div
                                key={item._id}
                                layout
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.9 }}
                                transition={{ duration: 0.2 }}
                            >
                                <CollectionItemCard item={item} />
                            </motion.div>
                        ))}

                    </AnimatePresence>
                </motion.div>
            )}

            {filteredItems.length === 0 && (
                <div className="text-center py-20 bg-gray-50 dark:bg-gray-900/50 rounded-2xl border border-dashed border-gray-200 dark:border-gray-800">
                    <MapPin className="mx-auto h-10 w-10 text-gray-300 mb-2" />
                    <p className="text-gray-500">No hay instrumentos en esta ubicación.</p>
                </div>
            )}
        </div>
    );
}
