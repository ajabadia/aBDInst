'use client';

import { useMemo } from 'react';

interface ValueSparklineProps {
    data: { date: string | Date; value: number }[];
    width?: number;
    height?: number;
    color?: string;
    trendColor?: boolean; // if true, green for up, red for down
}

export default function ValueSparkline({
    data,
    width = 100,
    height = 30,
    color = '#0071e3',
    trendColor = true
}: ValueSparklineProps) {

    const { path, strokeColor, isPositive } = useMemo(() => {
        if (!data || data.length < 2) return { path: '', strokeColor: color, isPositive: true };

        const values = data.map(d => d.value);
        const min = Math.min(...values);
        const max = Math.max(...values);
        const range = max - min || 1; // Avoid division by zero

        const points = values.map((val, i) => {
            const x = (i / (values.length - 1)) * width;
            const y = height - ((val - min) / range) * height; // Invert Y because SVG 0 is top
            return `${x},${y}`;
        });

        const startVal = values[0];
        const endVal = values[values.length - 1];
        const positive = endVal >= startVal;

        const finalColor = trendColor ? (positive ? '#10b981' : '#ef4444') : color;

        return {
            path: `M ${points.join(' L ')}`,
            strokeColor: finalColor,
            isPositive: positive
        };
    }, [data, width, height, color, trendColor]);

    if (!data || data.length < 2) return null;

    return (
        <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} className="overflow-visible">
            <path
                d={path}
                fill="none"
                stroke={strokeColor}
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
            {/* End dot */}
            <circle
                cx={width}
                cy={path.split(' ').pop()?.split(',')[1] || 0}
                r="3"
                fill={strokeColor}
            />
        </svg>
    );
}
