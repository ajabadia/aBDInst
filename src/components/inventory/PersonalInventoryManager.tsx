'use client';

import { useState } from 'react';
import UnitSelector from './UnitSelector';

interface PersonalInventoryManagerProps {
    items: any[];
    children: React.ReactNode[]; // Expected to be in same order as items
}

export default function PersonalInventoryManager({ items, children }: PersonalInventoryManagerProps) {
    const [selectedId, setSelectedId] = useState(items[0]?._id);

    if (!items || items.length === 0) return null;

    // Find the index of the selected item to show the correct child
    const selectedIndex = items.findIndex(item => item._id === selectedId);

    // If only 1 item, just show it without selector (unless we want consistent UI)
    // Design decision: Hide selector if length === 1
    const showSelector = items.length > 1;

    return (
        <div className="space-y-8">
            {showSelector && (
                <UnitSelector
                    units={items}
                    selectedId={selectedId}
                    onSelect={setSelectedId}
                />
            )}

            <div className="animate-fade-in">
                {/* 
                   We render the child at the matching index.
                   Note: children might not be an array if only 1 child is passed by React, 
                   but we enforced array in Types/Usage or we cast it. 
                   Safe check is array check.
                */}
                {Array.isArray(children) ? children[selectedIndex] : children}
            </div>
        </div>
    );
}
