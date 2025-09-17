'use client';

import React from 'react';

export interface PieChartData {
  label: string;
  value: number;
  color?: string;
  percentage?: number;
}

interface PieChartProps {
  data: PieChartData[];
  title?: string;
  size?: number;
  showLegend?: boolean;
  showPercentages?: boolean;
  formatValue?: (value: number) => string;
  className?: string;
}

export function PieChart({ 
  data, 
  title, 
  size = 200, 
  showLegend = true, 
  showPercentages = true,
  formatValue = (value) => value.toLocaleString(),
  className = ''
}: PieChartProps) {
  const total = data.reduce((sum, item) => sum + item.value, 0);
  const radius = (size - 40) / 2;
  const centerX = size / 2;
  const centerY = size / 2;

  let cumulativePercentage = 0;

  const createPath = (percentage: number) => {
    const startAngle = (cumulativePercentage * 360 - 90) * (Math.PI / 180);
    const endAngle = ((cumulativePercentage + percentage) * 360 - 90) * (Math.PI / 180);
    
    const x1 = centerX + radius * Math.cos(startAngle);
    const y1 = centerY + radius * Math.sin(startAngle);
    const x2 = centerX + radius * Math.cos(endAngle);
    const y2 = centerY + radius * Math.sin(endAngle);
    
    const largeArcFlag = percentage > 0.5 ? 1 : 0;
    
    const pathData = [
      `M ${centerX} ${centerY}`,
      `L ${x1} ${y1}`,
      `A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2}`,
      'Z'
    ].join(' ');
    
    cumulativePercentage += percentage;
    return pathData;
  };

  return (
    <div className={`pie-chart ${className}`}>
      {title && <h3 className="pie-chart__title">{title}</h3>}
      <div className="pie-chart__container">
        <div className="pie-chart__chart">
          <svg width={size} height={size} className="pie-chart__svg">
            {data.map((item, index) => {
              const percentage = total > 0 ? item.value / total : 0;
              const pathData = createPath(percentage);
              
              return (
                <path
                  key={index}
                  d={pathData}
                  fill={item.color || `hsl(${index * 40}, 70%, 50%)`}
                  className="pie-chart__slice"
                >
                  <title>{`${item.label}: ${formatValue(item.value)} (${(percentage * 100).toFixed(1)}%)`}</title>
                </path>
              );
            })}
          </svg>
          {showPercentages && (
            <div className="pie-chart__center">
              <div className="pie-chart__center-text">
                {formatValue(total)}
              </div>
              <div className="pie-chart__center-label">Total</div>
            </div>
          )}
        </div>
        
        {showLegend && (
          <div className="pie-chart__legend">
            {data.map((item, index) => {
              const percentage = total > 0 ? (item.value / total) * 100 : 0;
              
              return (
                <div key={index} className="pie-chart__legend-item">
                  <div 
                    className="pie-chart__legend-color"
                    style={{ backgroundColor: item.color || `hsl(${index * 40}, 70%, 50%)` }}
                  ></div>
                  <div className="pie-chart__legend-content">
                    <span className="pie-chart__legend-label">{item.label}</span>
                    <span className="pie-chart__legend-value">
                      {formatValue(item.value)} ({percentage.toFixed(1)}%)
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
