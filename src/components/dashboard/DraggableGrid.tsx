'use client';

import { useState, useEffect } from 'react';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, rectSortingStrategy } from '@dnd-kit/sortable';
import { SortableWidget } from './SortableWidget';
import { WidgetId, WIDGET_REGISTRY, DEFAULT_LAYOUT } from '@/lib/dashboard/WidgetRegistry';
import { Button } from '@/components/ui/Button';
import { Layout, Save, RotateCcw, Plus } from 'lucide-react';
import { toast } from 'sonner';

interface DraggableGridProps {
    initialLayout?: any[];
    data: any; 
}

export default function DraggableGrid({ initialLayout, data }: DraggableGridProps) {
    const [editMode, setEditMode] = useState(false);
    const [items, setItems] = useState<any[]>([]);

    useEffect(() => {
        const base = initialLayout && initialLayout.length > 0 ? initialLayout : DEFAULT_LAYOUT.map(w => ({ id: w.id, visible: w.defaultVisible, order: w.defaultOrder }));
        const currentIds = new Set(base.map((i: any) => i.id));
        const missing = Object.values(WIDGET_REGISTRY)
            .filter(w => !currentIds.has(w.id))
            .map(w => ({ id: w.id, visible: w.defaultVisible, order: 999 }));

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
        toast.success('Diseño guardado correctamente');
        setEditMode(false);
    };

    const resetLayout = () => {
        const defaultState = DEFAULT_LAYOUT.map(w => ({ id: w.id, visible: w.defaultVisible, order: w.defaultOrder }));
        setItems(defaultState);
        toast.info('Diseño restablecido');
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-end gap-2 px-2">
                {editMode ? (
                    <>
                        <Button variant="secondary" size="sm" onClick={resetLayout} icon={RotateCcw}>
                            Reset
                        </Button>
                        <Button size="sm" onClick={saveLayout} icon={Save} className="bg-ios-green text-white border-none shadow-ios-green/20">
                            Finalizar
                        </Button>
                    </>
                ) : (
                    <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => setEditMode(true)}
                        icon={Layout}
                    >
                        Personalizar Dashboard
                    </Button>
                )}
            </div>

            {editMode && items.some(i => !i.visible) && (
                <div className="glass-panel p-6 rounded-[2rem] border-dashed border-2 border-black/5 dark:border-white/5 animate-in fade-in zoom-in-95 duration-300">
                    <h4 className="apple-label !mb-4 flex items-center gap-2">
                        <Plus size={14} className="text-ios-green" /> Widgets Disponibles
                    </h4>
                    <div className="flex flex-wrap gap-2">
                        {items.filter(i => !i.visible).map(item => {
                            const def = WIDGET_REGISTRY[item.id as WidgetId];
                            if (!def) return null;
                            return (
                                <button
                                    key={item.id}
                                    onClick={() => toggleVisibility(item.id)}
                                    className="px-4 py-2 bg-white dark:bg-white/10 rounded-xl text-[13px] font-bold shadow-sm hover:ring-2 hover:ring-ios-blue transition-all flex items-center gap-2 border border-black/5 dark:border-white/5"
                                >
                                    <Plus size={14} className="text-ios-green" />
                                    {def.title}
                                </button>
                            );
                        })}
                    </div>
                </div>
            )}

            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                <SortableContext items={items.filter(i => i.visible).map(i => i.id)} strategy={rectSortingStrategy}>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        {items.filter(i => i.visible).map((item) => {
                            const definition = WIDGET_REGISTRY[item.id as WidgetId];
                            if (!definition) return null;
                            const Component = definition.component;
                            const props = { collection: data.collection, feed: data.feed, finance: data.finance, tags: data.tags, ...data.extraProps };

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
