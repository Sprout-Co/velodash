'use client';

import React from 'react';

export interface LineChartDataPoint {
  date: string;
  value: number;
  label?: string;
}

interface LineChartProps {
  data: LineChartDataPoint[];
  title?: string;
  height?: number;
  showGrid?: boolean;
  showDots?: boolean;
  formatValue?: (value: number) => string;
  formatDate?: (date: string) => string;
  className?: string;
}

export function LineChart({ 
  data, 
  title, 
  height = 300, 
  showGrid = true, 
  showDots = true,
  formatValue = (value) => value.toLocaleString(),
  formatDate = (date) => new Date(date).toLocaleDateString(),
  className = ''
}: LineChartProps) {
  if (data.length === 0) {
    return (
      <div className={`line-chart ${className}`}>
        {title && <h3 className="line-chart__title">{title}</h3>}
        <div className="line-chart__empty">
          <p>No data available</p>
        </div>
      </div>
    );
  }

  const maxValue = Math.max(...data.map(d => d.value));
  const minValue = Math.min(...data.map(d => d.value));
  const valueRange = maxValue - minValue;
  const padding = 40;
  const chartWidth = 400;
  const chartHeight = height - padding * 2;

  // Create SVG path for the line
  const createPath = () => {
    const points = data.map((point, index) => {
      const x = padding + (index / (data.length - 1)) * (chartWidth - padding * 2);
      const y = padding + ((maxValue - point.value) / valueRange) * (chartHeight - padding * 2);
      return `${index === 0 ? 'M' : 'L'} ${x} ${y}`;
    });
    return points.join(' ');
  };

  const pathData = createPath();

  return (
    <div className={`line-chart ${className}`}>
      {title && <h3 className="line-chart__title">{title}</h3>}
      <div className="line-chart__container">
        <svg width={chartWidth} height={height} className="line-chart__svg">
          {/* Grid lines */}
          {showGrid && (
            <g className="line-chart__grid">
              {[0, 0.25, 0.5, 0.75, 1].map((ratio, index) => {
                const y = padding + ratio * (chartHeight - padding * 2);
                const value = maxValue - (ratio * valueRange);
                return (
                  <g key={index}>
                    <line
                      x1={padding}
                      y1={y}
                      x2={chartWidth - padding}
                      y2={y}
                      className="line-chart__grid-line"
                    />
                    <text
                      x={padding - 10}
                      y={y + 4}
                      className="line-chart__grid-label"
                      textAnchor="end"
                    >
                      {formatValue(value)}
                    </text>
                  </g>
                );
              })}
            </g>
          )}

          {/* Line */}
          <path
            d={pathData}
            className="line-chart__line"
            fill="none"
            strokeWidth="2"
          />

          {/* Data points */}
          {showDots && data.map((point, index) => {
            const x = padding + (index / (data.length - 1)) * (chartWidth - padding * 2);
            const y = padding + ((maxValue - point.value) / valueRange) * (chartHeight - padding * 2);
            
            return (
              <circle
                key={index}
                cx={x}
                cy={y}
                r="4"
                className="line-chart__dot"
                title={`${formatDate(point.date)}: ${formatValue(point.value)}`}
              />
            );
          })}

          {/* X-axis labels */}
          <g className="line-chart__x-axis">
            {data.map((point, index) => {
              const x = padding + (index / (data.length - 1)) * (chartWidth - padding * 2);
              return (
                <text
                  key={index}
                  x={x}
                  y={height - 10}
                  className="line-chart__x-label"
                  textAnchor="middle"
                >
                  {formatDate(point.date)}
                </text>
              );
            })}
          </g>
        </svg>
      </div>
    </div>
  );
}
