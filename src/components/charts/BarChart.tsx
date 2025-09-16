'use client';

import React from 'react';

export interface BarChartData {
  label: string;
  value: number;
  color?: string;
  percentage?: number;
}

interface BarChartProps {
  data: BarChartData[];
  title?: string;
  height?: number;
  showValues?: boolean;
  showPercentages?: boolean;
  formatValue?: (value: number) => string;
  className?: string;
}

export function BarChart({ 
  data, 
  title, 
  height = 300, 
  showValues = true, 
  showPercentages = false,
  formatValue = (value) => value.toLocaleString(),
  className = ''
}: BarChartProps) {
  const maxValue = Math.max(...data.map(d => d.value));
  const totalValue = data.reduce((sum, d) => sum + d.value, 0);

  return (
    <div className={`bar-chart ${className}`}>
      {title && <h3 className="bar-chart__title">{title}</h3>}
      <div className="bar-chart__container" style={{ height: `${height}px` }}>
        <div className="bar-chart__bars">
          {data.map((item, index) => {
            const percentage = maxValue > 0 ? (item.value / maxValue) * 100 : 0;
            const itemPercentage = totalValue > 0 ? (item.value / totalValue) * 100 : 0;
            
            return (
              <div key={index} className="bar-chart__bar-group">
                <div className="bar-chart__bar-wrapper">
                  <div
                    className="bar-chart__bar"
                    style={{
                      height: `${percentage}%`,
                      backgroundColor: item.color || `hsl(${index * 40}, 70%, 50%)`,
                    }}
                    title={`${item.label}: ${formatValue(item.value)}`}
                  >
                    {showValues && item.value > 0 && (
                      <span className="bar-chart__bar-value">
                        {formatValue(item.value)}
                      </span>
                    )}
                  </div>
                </div>
                <div className="bar-chart__label">
                  <span className="bar-chart__label-text">{item.label}</span>
                  {showPercentages && (
                    <span className="bar-chart__label-percentage">
                      {itemPercentage.toFixed(1)}%
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
