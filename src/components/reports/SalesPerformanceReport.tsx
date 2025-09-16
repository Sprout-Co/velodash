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

      {/* Detailed Table */}
      <div className="sales-report__details">
        <h3 className="sales-report__details-title">Sales Details</h3>
        <div className="sales-report__table-container">
          <table className="sales-report__table">
            <thead>
              <tr>
                <th>Vehicle</th>
                <th>Sale Date</th>
                <th>Total Cost</th>
                <th>Sale Price</th>
                <th>Profit</th>
                <th>Profit Margin</th>
                <th>ROI</th>
              </tr>
            </thead>
            <tbody>
              {vehicles.map((vehicle) => (
                <tr key={vehicle.vehicleId}>
                  <td className="sales-report__table-vehicle">
                    {vehicle.vehicleName}
                  </td>
                  <td>
                    {new Date(vehicle.saleDate).toLocaleDateString()}
                  </td>
                  <td className="sales-report__table-cost">
                    {formatCurrency(vehicle.totalCost, 'NGN')}
                  </td>
                  <td className="sales-report__table-price">
                    {formatCurrency(vehicle.salePrice, 'NGN')}
                  </td>
                  <td className={`sales-report__table-profit ${
                    vehicle.salePrice - vehicle.totalCost > 0 
                      ? 'sales-report__table-profit--positive' 
                      : 'sales-report__table-profit--negative'
                  }`}>
                    {formatCurrency(vehicle.salePrice - vehicle.totalCost, 'NGN')}
                  </td>
                  <td className={`sales-report__table-margin ${
                    vehicle.profitMargin > 0 
                      ? 'sales-report__table-margin--positive' 
                      : 'sales-report__table-margin--negative'
                  }`}>
                    {vehicle.profitMargin.toFixed(1)}%
                  </td>
                  <td className={`sales-report__table-roi ${
                    vehicle.roi > 0 
                      ? 'sales-report__table-roi--positive' 
                      : 'sales-report__table-roi--negative'
                  }`}>
                    {vehicle.roi.toFixed(1)}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
