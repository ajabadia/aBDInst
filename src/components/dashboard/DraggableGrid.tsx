'use client';

import { useState, useEffect } from 'react';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, rectSortingStrategy } from '@dnd-kit/sortable';
import { SortableWidget } from './SortableWidget';
import { WidgetId, WIDGET_REGISTRY, DEFAULT_LAYOUT } from '@/lib/dashboard/WidgetRegistry';
import { Button } from '@/components/ui/Button';
import { Layout, Save, RotateCcw, Plus } from 'lucide-react';
import { toast } from 'sonner';
// import { saveUserLayout } from '@/actions/user'; // TODO: Implement this action

interface DraggableGridProps {
    initialLayout?: any[];
    data: any; // All data required by widgets (collection, stats, etc.)
}

export default function DraggableGrid({ initialLayout, data }: DraggableGridProps) {
    const [editMode, setEditMode] = useState(false);

    // Normalize layout: merge saved layout with default registry to ensure no missing/new widgets are lost
    const [items, setItems] = useState<any[]>([]);

    useEffect(() => {
        // Initialize layout logic
        const base = initialLayout && initialLayout.length > 0 ? initialLayout : DEFAULT_LAYOUT.map(w => ({ id: w.id, visible: w.defaultVisible, order: w.defaultOrder }));

        // Ensure all registry items exist (handle new widgets added after user saved layout)
        const currentIds = new Set(base.map((i: any) => i.id));
        const missing = Object.values(WIDGET_REGISTRY)
            .filter(w => !currentIds.has(w.id))
            .map(w => ({ id: w.id, visible: w.defaultVisible, order: 999 })); // Append to end

        setItems([...base, ...missing].sort((a, b) => a.order - b.order));
    }, [initialLayout]);

    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;

        if (over && active.id !== over.id) {
            setItems((items) => {
                const oldIndex = items.findIndex((i) => i.id === active.id);
                const newIndex = items.findIndex((i) => i.id === over.id);
                return arrayMove(items, oldIndex, newIndex);
            });
        }
    };

    const toggleVisibility = (id: string) => {
        setItems(items.map(i => i.id === id ? { ...i, visible: !i.visible } : i));
    };

    const saveLayout = async () => {
        try {
            const layoutToSave = items.map((item, index) => ({
                id: item.id,
                visible: item.visible,
                order: index
            }));

            // await saveUserLayout(layoutToSave); // Call server action
            toast.success('Diseño guardado correctamente');
            setEditMode(false);
        } catch (error) {
            toast.error('Error al guardar el diseño');
        }
    };

    const resetLayout = () => {
        const defaultState = DEFAULT_LAYOUT.map(w => ({ id: w.id, visible: w.defaultVisible, order: w.defaultOrder }));
        setItems(defaultState);
        toast.info('Diseño restablecido por defecto');
    };

    return (
        <div className="space-y-6">
            {/* Toolbar */}
            <div className="flex justify-end gap-2">
                {editMode ? (
                    <>
                        <Button variant="secondary" onClick={resetLayout} icon={RotateCcw} size="sm">
                            Reset
                        </Button>
                        <Button onClick={saveLayout} icon={Save} size="sm" className="bg-green-600 hover:bg-green-700 text-white">
                            Guardar
                        </Button>
                    </>
                ) : (
                    <Button
                        variant="ghost"
                        onClick={() => setEditMode(true)}
                        icon={Layout}
                        size="sm"
                        className="text-gray-500 hover:text-blue-600"
                    >
                        Editar Diseño
                    </Button>
                )}
            </div>

            {/* Hidden Widgets (Only in Edit Mode) */}
            {editMode && items.some(i => !i.visible) && (
                <div className="bg-gray-100 dark:bg-gray-800/50 p-4 rounded-xl border-dashed border-2 border-gray-300 dark:border-gray-700">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-3 flex items-center gap-2">
                        <Plus size={14} /> Widgets Ocultos
                    </h4>
                    <div className="flex flex-wrap gap-2">
                        {items.filter(i => !i.visible).map(item => {
                            const def = WIDGET_REGISTRY[item.id as WidgetId];
                            if (!def) return null;
                            return (
                                <button
                                    key={item.id}
                                    onClick={() => toggleVisibility(item.id)}
                                    className="px-3 py-1.5 bg-white dark:bg-gray-800 rounded-full text-sm font-medium shadow-sm hover:ring-2 hover:ring-blue-500 transition-all flex items-center gap-2"
                                >
                                    <Plus size={14} className="text-green-500" />
                                    {def.title}
                                </button>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* Grid */}
            <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
            >
                <SortableContext
                    items={items.filter(i => i.visible).map(i => i.id)}
                    strategy={rectSortingStrategy}
                >
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {items.filter(i => i.visible).map((item) => {
                            const definition = WIDGET_REGISTRY[item.id as WidgetId];
                            if (!definition) return null;

                            const Component = definition.component;

                            // Map generic data props to specific widget needs
                            const props = {
                                collection: data.collection,
                                feed: data.feed,
                                finance: data.finance,
                                tags: data.tags,
                                // Add other specific mappings if needed
                                ...data.extraProps
                            };

                            return (
                                <SortableWidget
                                    key={item.id}
                                    id={item.id}
                                    colSpan={definition.colSpan}
                                    editMode={editMode}
                                    onHide={() => toggleVisibility(item.id)}
                                    title={definition.title}
                                >
                                    <Component {...props} />
                                </SortableWidget>
                            );
                        })}
                    </div>
                </SortableContext>
            </DndContext>
        </div>
    );
}
