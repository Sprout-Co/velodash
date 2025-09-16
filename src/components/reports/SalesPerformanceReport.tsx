'use client';

import React from 'react';
import { SalesPerformanceReport as SalesReport } from '@/types';
import { BarChart, LineChart } from '@/components/charts';
import { formatCurrency } from '@/lib/utils';

interface SalesPerformanceReportProps {
  data: SalesReport | null;
  dateRange: { start: Date; end: Date };
  isLoading: boolean;
}

export function SalesPerformanceReport({ data, dateRange, isLoading }: SalesPerformanceReportProps) {
  if (isLoading) {
    return (
      <div className="sales-report">
        <div className="sales-report__loading">
          <div className="sales-report__loading-spinner"></div>
          <p>Loading sales performance data...</p>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="sales-report">
        <div className="sales-report__empty">
          <h3>No Sales Data Available</h3>
          <p>No sales were recorded for the selected date range.</p>
        </div>
      </div>
    );
  }

  const { summary, vehicles } = data;

  // Prepare chart data
  const profitMarginData = vehicles.map(vehicle => ({
    label: vehicle.vehicleName,
    value: vehicle.profitMargin,
    color: vehicle.profitMargin > 0 ? '#10B981' : '#EF4444'
  }));

  const roiData = vehicles.map(vehicle => ({
    label: vehicle.vehicleName,
    value: vehicle.roi,
    color: vehicle.roi > 0 ? '#3B82F6' : '#F59E0B'
  }));

  // Monthly sales trend (simplified - would need more sophisticated grouping in real implementation)
  const monthlyData = vehicles.map((vehicle, index) => ({
    date: new Date(vehicle.saleDate).toISOString().split('T')[0],
    value: vehicle.salePrice,
    label: vehicle.vehicleName
  }));

  return (
    <div className="sales-report">
      <div className="sales-report__header">
        <h2 className="sales-report__title">Sales Performance Report</h2>
        <p className="sales-report__period">
          {dateRange.start.toLocaleDateString()} - {dateRange.end.toLocaleDateString()}
        </p>
      </div>

      {/* Summary Cards */}
      <div className="sales-report__summary">
        <div className="sales-report__summary-grid">
          <div className="sales-report__summary-card sales-report__summary-card--revenue">
            <div className="sales-report__summary-icon">💰</div>
            <div className="sales-report__summary-content">
              <h3 className="sales-report__summary-title">Total Revenue</h3>
              <div className="sales-report__summary-value">
                {formatCurrency(summary.totalRevenue, 'NGN')}
              </div>
            </div>
          </div>

          <div className="sales-report__summary-card sales-report__summary-card--profit">
            <div className="sales-report__summary-icon">📈</div>
            <div className="sales-report__summary-content">
              <h3 className="sales-report__summary-title">Average Profit Margin</h3>
              <div className="sales-report__summary-value">
                {summary.averageProfitMargin.toFixed(1)}%
              </div>
            </div>
          </div>

          <div className="sales-report__summary-card sales-report__summary-card--roi">
            <div className="sales-report__summary-icon">🎯</div>
            <div className="sales-report__summary-content">
              <h3 className="sales-report__summary-title">Average ROI</h3>
              <div className="sales-report__summary-value">
                {summary.averageROI.toFixed(1)}%
              </div>
            </div>
          </div>

          <div className="sales-report__summary-card sales-report__summary-card--vehicles">
            <div className="sales-report__summary-icon">🚗</div>
            <div className="sales-report__summary-content">
              <h3 className="sales-report__summary-title">Vehicles Sold</h3>
              <div className="sales-report__summary-value">
                {vehicles.length}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="sales-report__charts">
        <div className="sales-report__charts-grid">
          <div className="sales-report__chart sales-report__chart--profit-margin">
            <BarChart
              data={profitMarginData}
              title="Profit Margin by Vehicle"
              height={300}
              formatValue={(value) => `${value.toFixed(1)}%`}
              showValues={true}
            />
          </div>

          <div className="sales-report__chart sales-report__chart--roi">
            <BarChart
              data={roiData}
              title="ROI by Vehicle"
              height={300}
              formatValue={(value) => `${value.toFixed(1)}%`}
              showValues={true}
            />
          </div>
        </div>

        {monthlyData.length > 1 && (
          <div className="sales-report__chart sales-report__chart--trend">
            <LineChart
              data={monthlyData}
              title="Sales Trend"
              height={300}
              formatValue={(value) => formatCurrency(value, 'NGN')}
              formatDate={(date) => new Date(date).toLocaleDateString()}
            />
          </div>
        )}
      </div>

      {/* Vehicle Sales Cards */}
      <div className="sales-report__details">
        <h3 className="sales-report__details-title">Sales Details</h3>
        <div className="sales-report__cards-grid">
          {vehicles.map((vehicle) => {
            const profit = vehicle.salePrice - vehicle.totalCost;
            const isProfitable = profit > 0;
            
            return (
              <div key={vehicle.vehicleId} className="sales-report__vehicle-card">
                <div className="sales-report__vehicle-card-header">
                  <div className="sales-report__vehicle-card-icon">🚗</div>
                  <div className="sales-report__vehicle-card-info">
                    <h4 className="sales-report__vehicle-card-name">{vehicle.vehicleName}</h4>
                    <p className="sales-report__vehicle-card-date">
                      Sold on {new Date(vehicle.saleDate).toLocaleDateString()}
                    </p>
                  </div>
                  <div className={`sales-report__vehicle-card-status ${
                    isProfitable 
                      ? 'sales-report__vehicle-card-status--profitable' 
                      : 'sales-report__vehicle-card-status--loss'
                  }`}>
                    {isProfitable ? '📈' : '📉'}
                  </div>
                </div>
                
                <div className="sales-report__vehicle-card-content">
                  <div className="sales-report__vehicle-card-metrics">
                    <div className="sales-report__vehicle-card-metric">
                      <span className="sales-report__vehicle-card-metric-label">Total Cost</span>
                      <span className="sales-report__vehicle-card-metric-value sales-report__vehicle-card-metric-value--cost">
                        {formatCurrency(vehicle.totalCost, 'NGN')}
                      </span>
                    </div>
                    
                    <div className="sales-report__vehicle-card-metric">
                      <span className="sales-report__vehicle-card-metric-label">Sale Price</span>
                      <span className="sales-report__vehicle-card-metric-value sales-report__vehicle-card-metric-value--price">
                        {formatCurrency(vehicle.salePrice, 'NGN')}
                      </span>
                    </div>
                    
                    <div className="sales-report__vehicle-card-metric">
                      <span className="sales-report__vehicle-card-metric-label">Profit</span>
                      <span className={`sales-report__vehicle-card-metric-value ${
                        isProfitable 
                          ? 'sales-report__vehicle-card-metric-value--positive' 
                          : 'sales-report__vehicle-card-metric-value--negative'
                      }`}>
                        {formatCurrency(profit, 'NGN')}
                      </span>
                    </div>
                  </div>
                  
                  <div className="sales-report__vehicle-card-percentages">
                    <div className="sales-report__vehicle-card-percentage">
                      <span className="sales-report__vehicle-card-percentage-label">Profit Margin</span>
                      <div className="sales-report__vehicle-card-percentage-content">
                        <span className={`sales-report__vehicle-card-percentage-value ${
                          vehicle.profitMargin > 0 
                            ? 'sales-report__vehicle-card-percentage-value--positive' 
                            : 'sales-report__vehicle-card-percentage-value--negative'
                        }`}>
                          {vehicle.profitMargin.toFixed(1)}%
                        </span>
                        <div className="sales-report__vehicle-card-percentage-bar">
                          <div 
                            className={`sales-report__vehicle-card-percentage-fill ${
                              vehicle.profitMargin > 0 
                                ? 'sales-report__vehicle-card-percentage-fill--positive' 
                                : 'sales-report__vehicle-card-percentage-fill--negative'
                            }`}
                            style={{ width: `${Math.min(Math.abs(vehicle.profitMargin), 100)}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="sales-report__vehicle-card-percentage">
                      <span className="sales-report__vehicle-card-percentage-label">ROI</span>
                      <div className="sales-report__vehicle-card-percentage-content">
                        <span className={`sales-report__vehicle-card-percentage-value ${
                          vehicle.roi > 0 
                            ? 'sales-report__vehicle-card-percentage-value--positive' 
                            : 'sales-report__vehicle-card-percentage-value--negative'
                        }`}>
                          {vehicle.roi.toFixed(1)}%
                        </span>
                        <div className="sales-report__vehicle-card-percentage-bar">
                          <div 
                            className={`sales-report__vehicle-card-percentage-fill ${
                              vehicle.roi > 0 
                                ? 'sales-report__vehicle-card-percentage-fill--positive' 
                                : 'sales-report__vehicle-card-percentage-fill--negative'
                            }`}
                            style={{ width: `${Math.min(Math.abs(vehicle.roi), 100)}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
