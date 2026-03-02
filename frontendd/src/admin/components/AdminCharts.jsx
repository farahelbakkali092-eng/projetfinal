import React from 'react';

/**
 * Animated Line Chart SVG
 * Displays a fluid, animated line showing a trend.
 */
export const LineChart = ({ data, color = "#d4a373", height = 200 }) => {
    if (!data || data.length === 0) return null;

    const max = Math.max(...data) || 1;
    const padding = 20;
    const width = 500;
    const chartHeight = height - padding * 2;
    const step = (width - padding * 2) / (data.length - 1);

    const points = data.map((val, i) => ({
        x: padding + i * step,
        y: height - (padding + (val / max) * chartHeight)
    }));

    const pathD = `M ${points[0].x} ${points[0].y} ` +
        points.slice(1).map(p => `L ${p.x} ${p.y}`).join(' ');

    const areaD = `${pathD} L ${points[points.length - 1].x} ${height - padding} L ${points[0].x} ${height - padding} Z`;

    return (
        <svg width="100%" height={height} viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none" style={{ overflow: 'visible' }}>
            <defs>
                <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={color} stopOpacity="0.4" />
                    <stop offset="100%" stopColor={color} stopOpacity="0" />
                </linearGradient>
            </defs>

            {/* Area under the line */}
            <path d={areaD} fill="url(#chartGradient)">
                <animate attributeName="opacity" from="0" to="1" dur="1s" fill="freeze" />
            </path>

            {/* Main Line */}
            <path
                d={pathD}
                fill="none"
                stroke={color}
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeDasharray="1000"
                strokeDashoffset="1000"
            >
                <animate attributeName="stroke-dashoffset" from="1000" to="0" dur="1.5s" fill="freeze" />
            </path>

            {/* Data Points */}
            {points.map((p, i) => (
                <circle key={i} cx={p.x} cy={p.y} r="4" fill="#fff" stroke={color} strokeWidth="2">
                    <animate attributeName="r" from="0" to="4" dur="0.3s" begin={`${0.5 + i * 0.1}s`} fill="freeze" />
                </circle>
            ))}
        </svg>
    );
};

/**
 * Animated Donut Chart SVG
 */
export const DonutChart = ({ data, colors = ["#2d0a0a", "#d4a373", "#e6c8a8", "#7c6a6a"], size = 200 }) => {
    if (!data || data.length === 0) return null;

    const total = data.reduce((acc, val) => acc + val.value, 0);
    let currentAngle = 0;
    const radius = 70;
    const cx = size / 2;
    const cy = size / 2;
    const strokeWidth = 25;
    const circumference = 2 * Math.PI * radius;

    return (
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
            {data.map((item, i) => {
                const percent = (item.value / total) * 100;
                const offset = circumference - (percent / 100) * circumference;
                const rotation = (currentAngle / total) * 360;
                currentAngle += item.value;

                return (
                    <circle
                        key={i}
                        cx={cx}
                        cy={cy}
                        r={radius}
                        fill="transparent"
                        stroke={colors[i % colors.length]}
                        strokeWidth={strokeWidth}
                        strokeDasharray={circumference}
                        strokeDashoffset={circumference}
                        transform={`rotate(${-90 + rotation} ${cx} ${cy})`}
                        strokeLinecap="round"
                    >
                        <animate
                            attributeName="stroke-dashoffset"
                            from={circumference}
                            to={offset}
                            dur="1s"
                            begin="0.2s"
                            fill="freeze"
                        />
                    </circle>
                );
            })}
            <text x="50%" y="50%" dominantBaseline="middle" textAnchor="middle" style={{ fontFamily: 'Playfair Display', fontWeight: 'bold', fontSize: '1.2rem', fill: '#2d0a0a' }}>
                Total
            </text>
            <text x="50%" y="62%" dominantBaseline="middle" textAnchor="middle" style={{ fontSize: '0.8rem', fill: '#7c6a6a' }}>
                {total}
            </text>
        </svg>
    );
};
