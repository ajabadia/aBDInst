'use client';

import { useState, useRef, useEffect } from 'react';
import { X, Tag } from 'lucide-react';

interface TagInputProps {
    tags: string[];
    onChange: (tags: string[]) => void;
    suggestions?: string[];
    placeholder?: string;
    maxTags?: number;
}

export default function TagInput({
    tags,
    onChange,
    suggestions = [],
    placeholder = 'Añadir etiqueta...',
    maxTags = 20
}: TagInputProps) {
    const [input, setInput] = useState('');
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [filteredSuggestions, setFilteredSuggestions] = useState<string[]>([]);
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (input.trim()) {
            const filtered = suggestions.filter(
                (s) => s.toLowerCase().includes(input.toLowerCase()) && !tags.includes(s)
            );
            setFilteredSuggestions(filtered);
            setShowSuggestions(filtered.length > 0);
        } else {
            setShowSuggestions(false);
        }
    }, [input, suggestions, tags]);

    const addTag = (tag: string) => {
        const trimmedTag = tag.trim().toLowerCase();
        if (trimmedTag && !tags.includes(trimmedTag) && tags.length < maxTags) {
            onChange([...tags, trimmedTag]);
            setInput('');
            setShowSuggestions(false);
        }
    };

    const removeTag = (tagToRemove: string) => {
        onChange(tags.filter((t) => t !== tagToRemove));
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            if (filteredSuggestions.length > 0) {
                addTag(filteredSuggestions[0]);
            } else {
                addTag(input);
            }
        } else if (e.key === 'Backspace' && !input && tags.length > 0) {
            removeTag(tags[tags.length - 1]);
        } else if (e.key === 'Escape') {
            setShowSuggestions(false);
        }
    };

    return (
        <div className="relative">
            {/* Tags Display */}
            <div className="flex flex-wrap gap-2 mb-2">
                {tags.map((tag) => (
                    <span
                        key={tag}
                        className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full text-sm font-medium"
                    >
                        <Tag size={12} />
                        {tag}
                        <button
                            type="button"
                            onClick={() => removeTag(tag)}
                            className="hover:bg-blue-200 dark:hover:bg-blue-800 rounded-full p-0.5 transition-colors"
                        >
                            <X size={12} />
                        </button>
                    </span>
                ))}
            </div>

            {/* Input */}
            <div className="relative">
                <input
                    ref={inputRef}
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    onFocus={() => input && setShowSuggestions(filteredSuggestions.length > 0)}
                    onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                    placeholder={tags.length >= maxTags ? `Máximo ${maxTags} etiquetas` : placeholder}
                    disabled={tags.length >= maxTags}
                    className="w-full px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-900 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                />

                {/* Suggestions Dropdown */}
                {showSuggestions && (
                    <div className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-lg max-h-48 overflow-y-auto">
                        {filteredSuggestions.map((suggestion) => (
                            <button
                                key={suggestion}
                                type="button"
                                onClick={() => addTag(suggestion)}
                                className="w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors flex items-center gap-2"
                            >
                                <Tag size={14} className="text-gray-400" />
                                <span className="text-sm">{suggestion}</span>
                            </button>
                        ))}
                    </div>
                )}
            </div>

            {/* Helper Text */}
            <p className="text-xs text-gray-500 mt-1">
                Presiona Enter para añadir. {tags.length}/{maxTags} etiquetas
            </p>
        </div>
    );
}
