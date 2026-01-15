'use client';

import * as ReactWindow from 'react-window';
import { AutoSizer } from 'react-virtualized-auto-sizer';
import InstrumentCard from '@/components/InstrumentCard';
import { useRef } from 'react';

const Grid = (ReactWindow as any).FixedSizeGrid || (ReactWindow as any).default?.FixedSizeGrid;
const AutoSizerAny = AutoSizer as any;

interface VirtualizedGridProps {
    instruments: any[];
}

export default function VirtualizedInstrumentGrid({ instruments }: VirtualizedGridProps) {
    const parentRef = useRef<HTMLDivElement>(null);

    // Grid configuration
    const GUTTER_SIZE = 40; // gap-10 = 40px
    const COLUMN_WIDTH_MIN = 350; // Approximating sm/lg breakpoints

    return (
        <div className="h-[800px] w-full" ref={parentRef}>
            <AutoSizerAny>
                {({ height, width }: { height: number; width: number }) => {
                    const columnCount = Math.floor(width / COLUMN_WIDTH_MIN) || 1;
                    const columnWidth = (width - (GUTTER_SIZE * (columnCount - 1))) / columnCount;
                    const rowHeight = 500; // Approximate card height
                    const rowCount = Math.ceil(instruments.length / columnCount);

                    return (
                        <Grid
                            columnCount={columnCount}
                            columnWidth={columnWidth + GUTTER_SIZE}
                            height={height || 800}
                            rowCount={rowCount}
                            rowHeight={rowHeight + GUTTER_SIZE}
                            width={width || 1200}
                        >
                            {({ columnIndex, rowIndex, style }: any) => {
                                const index = rowIndex * columnCount + columnIndex;
                                if (index >= instruments.length) return null;
                                const inst = instruments[index];

                                return (
                                    <div style={{
                                        ...style,
                                        left: Number(style.left),
                                        top: Number(style.top),
                                        width: columnWidth,
                                        height: rowHeight
                                    }}>
                                        <InstrumentCard inst={inst} />
                                    </div>
                                );
                            }}
                        </Grid>
                    );
                }}
            </AutoSizerAny>
        </div>
    );
}
