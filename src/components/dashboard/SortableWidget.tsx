'use client';

import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, EyeOff } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ReactNode } from 'react';

interface SortableWidgetProps {
    id: string;
    children: ReactNode;
    colSpan?: 1 | 2;
    editMode: boolean;
    onHide?: () => void;
    title?: string;
}

export function SortableWidget({ id, children, colSpan = 2, editMode, onHide, title }: SortableWidgetProps) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging
    } = useSortable({ id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        zIndex: isDragging ? 50 : 'auto',
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            className={cn(
                "relative transition-all duration-200",
                colSpan === 2 ? "col-span-1 md:col-span-2" : "col-span-1",
                isDragging ? "opacity-50 scale-95" : "opacity-100",
                editMode ? "ring-2 ring-blue-500/30 rounded-[2rem] p-2 bg-blue-50/50 dark:bg-blue-900/10 cursor-move" : ""
            )}
            {...(editMode ? attributes : {})}
            {...(editMode ? listeners : {})}
        >
            {editMode && (
                <div className="absolute top-4 right-4 z-20 flex items-center gap-2">
                    <button
                        onClick={(e) => {
                            e.stopPropagation(); // Prevent drag start
                            onHide?.();
                        }}
                        className="bg-red-100 hover:bg-red-200 text-red-600 p-1.5 rounded-full transition-colors"
                        title="Ocultar widget"
                    >
                        <EyeOff size={16} />
                    </button>
                    <div className="bg-white/80 dark:bg-black/50 p-1.5 rounded-full cursor-grab active:cursor-grabbing">
                        <GripVertical size={16} className="text-gray-500" />
                    </div>
                </div>
            )}

            {/* If in edit mode, maybe show a simplified placeholder or the real content with pointer-events-none? 
                Actually, keeping real content is usually better for WYSIWYG, but let's disable interaction inside */}
            <div className={cn(editMode ? "pointer-events-none" : "")}>
                {children}
            </div>
        </div>
    );
}
