'use client';

import React from 'react';
import { InventoryStatusFunnel } from '@/types';

interface InventoryFunnelProps {
  data: InventoryStatusFunnel;
  isLoading: boolean;
}

const funnelSteps = [
  { key: 'sourced', label: 'Sourced', color: '#3B82F6' },
  { key: 'inTransit', label: 'In Transit', color: '#8B5CF6' },
  { key: 'inCustoms', label: 'In Customs', color: '#F59E0B' },
  { key: 'inWorkshop', label: 'In Workshop', color: '#EF4444' },
  { key: 'forSale', label: 'For Sale', color: '#10B981' },
  { key: 'sold', label: 'Sold', color: '#6B7280' },
] as const;

export function InventoryFunnel({ data, isLoading }: InventoryFunnelProps) {
  if (isLoading) {
    return (
      <div className="inventory-funnel__skeleton">
        {funnelSteps.map((step) => (
          <div key={step.key} className="inventory-funnel__step-skeleton">
            <div className="inventory-funnel__step-bar-skeleton"></div>
            <div className="inventory-funnel__step-label-skeleton"></div>
          </div>
        ))}
      </div>
    );
  }

  const totalVehicles = Object.values(data).reduce((sum, count) => sum + count, 0);

  return (
    <>
      <p className="inventory-funnel__subtitle">
        {totalVehicles} vehicles in pipeline
      </p>
      
      <div className="inventory-funnel__steps">
        {funnelSteps.map((step, index) => {
          const count = data[step.key];
          const percentage = totalVehicles > 0 ? (count / totalVehicles) * 100 : 0;
          const isLast = index === funnelSteps.length - 1;
          
          return (
            <div key={step.key} className="inventory-funnel__step">
              <div className="inventory-funnel__step-bar">
                <div
                  className="inventory-funnel__step-fill"
                  style={{
                    width: `${percentage}%`,
                    backgroundColor: step.color,
                  }}
                />
              </div>
              <div className="inventory-funnel__step-info">
                <span className="inventory-funnel__step-label">{step.label}</span>
                <span className="inventory-funnel__step-count">{count}</span>
              </div>
              {!isLast && (
                <div className="inventory-funnel__arrow">
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                    <path d="M6 4l4 4-4 4" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </>
  );
}