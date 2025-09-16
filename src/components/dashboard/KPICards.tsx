'use client';

import React from 'react';
import { DashboardKPIs } from '@/types';
import { formatCurrency } from '@/lib/utils';

interface KPICardsProps {
  data: DashboardKPIs;
  isLoading: boolean;
}

const kpiConfig = [
  {
    key: 'liveInventoryCount' as keyof DashboardKPIs,
    title: 'Live Inventory Count',
    description: 'Vehicles in pipeline',
    icon: '🚗',
    color: 'blue',
    format: (value: number) => value.toString(),
  },
  {
    key: 'capitalDeployed' as keyof DashboardKPIs,
    title: 'Capital Deployed',
    description: 'Total invested capital',
    icon: '💰',
    color: 'green',
    format: (value: number) => formatCurrency(value, 'NGN'),
  },
  {
    key: 'readyForSaleValue' as keyof DashboardKPIs,
    title: 'Ready for Sale Value',
    description: 'Total listing value',
    icon: '🏷️',
    color: 'purple',
    format: (value: number) => formatCurrency(value, 'NGN'),
  },
  {
    key: 'grossProfit' as keyof DashboardKPIs,
    title: 'Gross Profit',
    description: 'Total profit from sales',
    icon: '📈',
    color: 'orange',
    format: (value: number) => formatCurrency(value, 'NGN'),
  },
];

export function KPICards({ data, isLoading }: KPICardsProps) {
  if (isLoading) {
    return (
      <div className="kpi-cards">
        {kpiConfig.map((kpi) => (
          <div key={kpi.key} className="kpi-card kpi-card--loading">
            <div className="kpi-card__skeleton">
              <div className="kpi-card__skeleton-icon"></div>
              <div className="kpi-card__skeleton-content">
                <div className="kpi-card__skeleton-title"></div>
                <div className="kpi-card__skeleton-value"></div>
                <div className="kpi-card__skeleton-description"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="kpi-cards">
      {kpiConfig.map((kpi) => {
        const value = data[kpi.key];
        return (
          <div key={kpi.key} className={`kpi-card kpi-card--${kpi.color}`}>
            <div className="kpi-card__icon">
              <span className="kpi-card__emoji">{kpi.icon}</span>
            </div>
            <div className="kpi-card__content">
              <h3 className="kpi-card__title">{kpi.title}</h3>
              <div className="kpi-card__value">
                {kpi.format(value)}
              </div>
              <p className="kpi-card__description">{kpi.description}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
