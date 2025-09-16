'use client';

import React from 'react';
import { BarChart, PieChart } from '@/components/charts';
import { formatCurrency } from '@/lib/utils';

interface ProfitabilityData {
  vehicles: Array<{
    vehicleId: string;
    vehicleName: string;
    totalCost: number;
    salePrice?: number;
    profit?: number;
    profitMargin?: number;
    roi?: number;
    status: string;
  }>;
  summary: {
    totalVehicles: number;
    totalCost: number;
    totalRevenue: number;
    totalProfit: number;
    averageProfitMargin: number;
    averageROI: number;
  };
}

interface ProfitabilityAnalysisProps {
  data: ProfitabilityData | null;
  dateRange: { start: Date; end: Date };
  isLoading: boolean;
}

export function ProfitabilityAnalysis({ data, dateRange, isLoading }: ProfitabilityAnalysisProps) {
  if (isLoading) {
    return (
      <div className="profitability-report">
        <div className="profitability-report__loading">
          <div className="profitability-report__loading-spinner"></div>
          <p>Loading profitability analysis...</p>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="profitability-report">
        <div className="profitability-report__empty">
          <h3>No Profitability Data Available</h3>
          <p>No profitability data found for the selected date range.</p>
        </div>
      </div>
    );
  }

  const { summary, vehicles } = data;

  // Separate sold and unsold vehicles
  const soldVehicles = vehicles.filter(v => v.salePrice);
  const unsoldVehicles = vehicles.filter(v => !v.salePrice);

  // Prepare chart data
  const profitMarginData = soldVehicles.map(vehicle => ({
    label: vehicle.vehicleName,
    value: vehicle.profitMargin || 0,
    color: (vehicle.profitMargin || 0) > 0 ? '#10B981' : '#EF4444'
  }));

  const roiData = soldVehicles.map(vehicle => ({
    label: vehicle.vehicleName,
    value: vehicle.roi || 0,
    color: (vehicle.roi || 0) > 0 ? '#3B82F6' : '#F59E0B'
  }));

  // Status distribution
  const statusCounts = vehicles.reduce((acc, vehicle) => {
    acc[vehicle.status] = (acc[vehicle.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const statusData = Object.entries(statusCounts).map(([status, count]) => ({
    label: status.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase()),
    value: count,
    color: getStatusColor(status)
  }));

  // Top performing vehicles
  const topPerformers = soldVehicles
    .sort((a, b) => (b.profitMargin || 0) - (a.profitMargin || 0))
    .slice(0, 10);

  const topPerformersData = topPerformers.map(vehicle => ({
    label: vehicle.vehicleName,
    value: vehicle.profitMargin || 0,
    color: '#10B981'
  }));

  return (
    <div className="profitability-report">
      <div className="profitability-report__header">
        <h2 className="profitability-report__title">Profitability Analysis</h2>
        <p className="profitability-report__period">
          {dateRange.start.toLocaleDateString()} - {dateRange.end.toLocaleDateString()}
        </p>
      </div>

      {/* Summary Cards */}
      <div className="profitability-report__summary">
        <div className="profitability-report__summary-grid">
          <div className="profitability-report__summary-card profitability-report__summary-card--total">
            <div className="profitability-report__summary-icon">🚗</div>
            <div className="profitability-report__summary-content">
              <h3 className="profitability-report__summary-title">Total Vehicles</h3>
              <div className="profitability-report__summary-value">
                {summary.totalVehicles}
              </div>
            </div>
          </div>

          <div className="profitability-report__summary-card profitability-report__summary-card--revenue">
            <div className="profitability-report__summary-icon">💰</div>
            <div className="profitability-report__summary-content">
              <h3 className="profitability-report__summary-title">Total Revenue</h3>
              <div className="profitability-report__summary-value">
                {formatCurrency(summary.totalRevenue, 'NGN')}
              </div>
            </div>
          </div>

          <div className="profitability-report__summary-card profitability-report__summary-card--profit">
            <div className="profitability-report__summary-icon">📈</div>
            <div className="profitability-report__summary-content">
              <h3 className="profitability-report__summary-title">Total Profit</h3>
              <div className="profitability-report__summary-value">
                {formatCurrency(summary.totalProfit, 'NGN')}
              </div>
            </div>
          </div>

          <div className="profitability-report__summary-card profitability-report__summary-card--margin">
            <div className="profitability-report__summary-icon">🎯</div>
            <div className="profitability-report__summary-content">
              <h3 className="profitability-report__summary-title">Avg Profit Margin</h3>
              <div className="profitability-report__summary-value">
                {summary.averageProfitMargin.toFixed(1)}%
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Performance Overview */}
      <div className="profitability-report__overview">
        <div className="profitability-report__overview-grid">
          <div className="profitability-report__overview-card">
            <h4 className="profitability-report__overview-title">Sold Vehicles</h4>
            <div className="profitability-report__overview-value">
              {soldVehicles.length}
            </div>
            <div className="profitability-report__overview-percentage">
              {summary.totalVehicles > 0 ? ((soldVehicles.length / summary.totalVehicles) * 100).toFixed(1) : 0}%
            </div>
          </div>

          <div className="profitability-report__overview-card">
            <h4 className="profitability-report__overview-title">Unsold Vehicles</h4>
            <div className="profitability-report__overview-value">
              {unsoldVehicles.length}
            </div>
            <div className="profitability-report__overview-percentage">
              {summary.totalVehicles > 0 ? ((unsoldVehicles.length / summary.totalVehicles) * 100).toFixed(1) : 0}%
            </div>
          </div>

          <div className="profitability-report__overview-card">
            <h4 className="profitability-report__overview-title">Average ROI</h4>
            <div className="profitability-report__overview-value">
              {summary.averageROI.toFixed(1)}%
            </div>
            <div className="profitability-report__overview-percentage">
              {summary.averageROI > 0 ? 'Positive' : 'Negative'}
            </div>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="profitability-report__charts">
        <div className="profitability-report__charts-grid">
          <div className="profitability-report__chart profitability-report__chart--status">
            <PieChart
              data={statusData}
              title="Vehicle Status Distribution"
              size={250}
              showLegend={true}
              showPercentages={true}
              formatValue={(value) => value.toString()}
            />
          </div>

          <div className="profitability-report__chart profitability-report__chart--top-performers">
            <BarChart
              data={topPerformersData}
              title="Top 10 Performing Vehicles (Profit Margin)"
              height={300}
              formatValue={(value) => `${value.toFixed(1)}%`}
              showValues={true}
            />
          </div>
        </div>

        {soldVehicles.length > 0 && (
          <div className="profitability-report__charts-row">
            <div className="profitability-report__chart profitability-report__chart--profit-margin">
              <BarChart
                data={profitMarginData}
                title="Profit Margin by Vehicle"
                height={300}
                formatValue={(value) => `${value.toFixed(1)}%`}
                showValues={true}
              />
            </div>

            <div className="profitability-report__chart profitability-report__chart--roi">
              <BarChart
                data={roiData}
                title="ROI by Vehicle"
                height={300}
                formatValue={(value) => `${value.toFixed(1)}%`}
                showValues={true}
              />
            </div>
          </div>
        )}
      </div>

      {/* Detailed Table */}
      <div className="profitability-report__details">
        <h3 className="profitability-report__details-title">Vehicle Profitability Details</h3>
        <div className="profitability-report__table-container">
          <table className="profitability-report__table">
            <thead>
              <tr>
                <th>Vehicle</th>
                <th>Status</th>
                <th>Total Cost</th>
                <th>Sale Price</th>
                <th>Profit</th>
                <th>Profit Margin</th>
                <th>ROI</th>
              </tr>
            </thead>
            <tbody>
              {vehicles
                .sort((a, b) => (b.profitMargin || 0) - (a.profitMargin || 0))
                .map((vehicle) => (
                <tr key={vehicle.vehicleId}>
                  <td className="profitability-report__table-vehicle">
                    {vehicle.vehicleName}
                  </td>
                  <td>
                    <span className={`profitability-report__status profitability-report__status--${vehicle.status}`}>
                      {vehicle.status.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                    </span>
                  </td>
                  <td className="profitability-report__table-cost">
                    {formatCurrency(vehicle.totalCost, 'NGN')}
                  </td>
                  <td className="profitability-report__table-price">
                    {vehicle.salePrice ? formatCurrency(vehicle.salePrice, 'NGN') : 'N/A'}
                  </td>
                  <td className={`profitability-report__table-profit ${
                    (vehicle.profit || 0) > 0 
                      ? 'profitability-report__table-profit--positive' 
                      : 'profitability-report__table-profit--negative'
                  }`}>
                    {vehicle.profit ? formatCurrency(vehicle.profit, 'NGN') : 'N/A'}
                  </td>
                  <td className={`profitability-report__table-margin ${
                    (vehicle.profitMargin || 0) > 0 
                      ? 'profitability-report__table-margin--positive' 
                      : 'profitability-report__table-margin--negative'
                  }`}>
                    {vehicle.profitMargin ? `${vehicle.profitMargin.toFixed(1)}%` : 'N/A'}
                  </td>
                  <td className={`profitability-report__table-roi ${
                    (vehicle.roi || 0) > 0 
                      ? 'profitability-report__table-roi--positive' 
                      : 'profitability-report__table-roi--negative'
                  }`}>
                    {vehicle.roi ? `${vehicle.roi.toFixed(1)}%` : 'N/A'}
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

function getStatusColor(status: string): string {
  const colors: Record<string, string> = {
    'sourced': '#3B82F6',
    'in-transit': '#8B5CF6',
    'in-customs': '#F59E0B',
    'in-workshop': '#EF4444',
    'for-sale': '#10B981',
    'sale-pending': '#06B6D4',
    'sold': '#6B7280',
    'archived': '#9CA3AF'
  };
  return colors[status] || '#6B7280';
}
