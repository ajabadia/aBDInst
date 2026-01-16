'use client';

import { useState, useMemo } from 'react';
import CollectionItemCard from './CollectionItemCard';
import TagFilter from './TagFilter';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, LayoutGrid } from 'lucide-react';
import { cn } from '@/lib/utils';

import VirtualizedStudioList from './VirtualizedStudioList';
import CollectionFilter from '@/components/dashboard/CollectionFilter';

interface StudioCollectionProps {
    collection: any[];
    allTags?: string[];
}

export default function StudioCollection({ collection, allTags = [] }: StudioCollectionProps) {
    const [selectedTags, setSelectedTags] = useState<string[]>([]);

    const filteredItems = useMemo(() => {
        let items = collection;

        // Filter by tags
        if (selectedTags.length > 0) {
            items = items.filter(item =>
                item.tags && item.tags.some((tag: string) => selectedTags.includes(tag))
            );
        }

        return items;
    }, [collection, selectedTags]);

    return (
        <div className="space-y-8">
            {/* Header & Filter */}
            <div className="flex flex-col gap-6">
                <div className="flex items-center justify-between">
                    <h2 className="text-xs font-bold uppercase tracking-widest text-gray-400 ml-1 flex items-center gap-2">
                        <LayoutGrid size={14} /> Inventario ({filteredItems.length})
                    </h2>
                </div>

                {/* Integrated Global Filter */}
                <div className="pb-4 border-b border-black/5 dark:border-white/5">
                    <CollectionFilter showTitle={false} />
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
