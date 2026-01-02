'use client';

import { useState, useEffect } from 'react';
import { Tag, X } from 'lucide-react';

interface TagFilterProps {
    allTags: string[];
    selectedTags: string[];
    onTagsChange: (tags: string[]) => void;
}

export default function TagFilter({ allTags, selectedTags, onTagsChange }: TagFilterProps) {
    const [showAll, setShowAll] = useState(false);
    const displayTags = showAll ? allTags : allTags.slice(0, 10);

    const toggleTag = (tag: string) => {
        if (selectedTags.includes(tag)) {
            onTagsChange(selectedTags.filter(t => t !== tag));
        } else {
            onTagsChange([...selectedTags, tag]);
        }
    };

    const clearAll = () => {
        onTagsChange([]);
    };

    if (allTags.length === 0) return null;

    return (
        <div className="bg-white/40 dark:bg-black/20 backdrop-blur-md rounded-[2rem] border border-gray-200/50 dark:border-white/10 p-6">
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                    <Tag size={20} className="text-gray-600 dark:text-gray-400" />
                    <h3 className="font-bold text-lg">Filtrar por Etiquetas</h3>
                </div>
                {selectedTags.length > 0 && (
                    <button
                        onClick={clearAll}
                        className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
                    >
                        Limpiar filtros
                    </button>
                )}
            </div>

            {/* Selected Tags */}
            {selectedTags.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-4 pb-4 border-b border-gray-200 dark:border-gray-700">
                    {selectedTags.map((tag) => (
                        <button
                            key={tag}
                            onClick={() => toggleTag(tag)}
                            className="inline-flex items-center gap-1 px-3 py-1.5 bg-blue-600 text-white rounded-full text-sm font-medium hover:bg-blue-700 transition-colors"
                        >
                            {tag}
                            <X size={14} />
                        </button>
                    ))}
                </div>
            )}

            {/* Available Tags */}
            <div className="flex flex-wrap gap-2">
                {displayTags.map((tag) => (
                    <button
                        key={tag}
                        onClick={() => toggleTag(tag)}
                        className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${selectedTags.includes(tag)
                                ? 'bg-blue-600 text-white'
                                : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                            }`}
                    >
                        {tag}
                    </button>
                ))}
            </div>

            {/* Show More/Less */}
            {allTags.length > 10 && (
                <button
                    onClick={() => setShowAll(!showAll)}
                    className="mt-4 text-sm text-blue-600 dark:text-blue-400 hover:underline"
                >
                    {showAll ? 'Mostrar menos' : `Mostrar ${allTags.length - 10} más`}
                </button>
            )}
        </div>
    );
}
