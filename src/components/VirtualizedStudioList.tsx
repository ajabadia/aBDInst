'use client';

import * as ReactWindow from 'react-window';
import { AutoSizer } from 'react-virtualized-auto-sizer';
import CollectionItemCard from './CollectionItemCard';
import { useRef } from 'react';

const List = (ReactWindow as any).FixedSizeList || (ReactWindow as any).default?.FixedSizeList;

// Cast AutoSizer to avoid strict children type checks
const AutoSizerAny = AutoSizer as any;

interface VirtualizedStudioListProps {
    items: any[];
}

export default function VirtualizedStudioList({ items }: VirtualizedStudioListProps) {
    const listRef = useRef<any>(null);

    return (
        <div className="h-[800px] w-full">
            <AutoSizerAny>
                {({ height, width }: { height: number; width: number }) => {
                    // Responsive row height calculation
                    // Desktop (md: 768px): Card is roughly 180px + 24px gap
                    // Mobile: Card stacks, roughly 400px + 24px gap
                    const isMobile = width < 768;
                    const itemSize = isMobile ? 420 : 200;
                    const gutterSize = 24; // gap-6

                    return (
                        <List
                            height={height}
                            itemCount={items.length}
                            itemSize={itemSize}
                            width={width}
                            ref={listRef}
                        >
                            {({ index, style }: { index: number; style: any }) => {
                                const item = items[index];
                                return (
                                    <div style={{
                                        ...style,
                                        height: Number(style.height) - gutterSize, // Subtract gap from item height
                                        left: style.left,
                                        top: style.top,
                                        width: style.width
                                    }}>
                                        <CollectionItemCard item={item} />
                                    </div>
                                );
                            }}
                        </List>
                    );
                }}
            </AutoSizerAny>
        </div>
    );
}
