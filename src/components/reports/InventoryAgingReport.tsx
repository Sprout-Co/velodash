'use client';

import React from 'react';
import { InventoryAgingReport as InventoryReport } from '@/types';
import { BarChart, PieChart } from '@/components/charts';
import { formatCurrency } from '@/lib/utils';

interface InventoryAgingReportProps {
  data: InventoryReport | null;
  dateRange: { start: Date; end: Date };
  isLoading: boolean;
}

export function InventoryAgingReport({ data, dateRange, isLoading }: InventoryAgingReportProps) {
  if (isLoading) {
    return (
      <div className="inventory-report">
        <div className="inventory-report__loading">
          <div className="inventory-report__loading-spinner"></div>
          <p>Loading inventory aging data...</p>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="inventory-report">
        <div className="inventory-report__empty">
          <h3>No Inventory Data Available</h3>
          <p>No inventory data found for the selected date range.</p>
        </div>
      </div>
    );
  }

  const { summary, vehicles } = data;

  // Prepare aging distribution data
  const agingRanges = [
    { label: '0-30 days', min: 0, max: 30, color: '#10B981' },
    { label: '31-60 days', min: 31, max: 60, color: '#F59E0B' },
    { label: '61-90 days', min: 61, max: 90, color: '#EF4444' },
    { label: '90+ days', min: 91, max: Infinity, color: '#DC2626' }
  ];

  const agingData = agingRanges.map(range => {
    const count = vehicles.filter(vehicle => 
      vehicle.daysInInventory >= range.min && vehicle.daysInInventory <= range.max
    ).length;
    return {
      label: range.label,
      value: count,
      color: range.color
    };
  });

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

  // Top aging vehicles
  const topAgingVehicles = vehicles
    .sort((a, b) => b.daysInInventory - a.daysInInventory)
    .slice(0, 10);

  const agingVehiclesData = topAgingVehicles.map(vehicle => ({
    label: vehicle.vehicleName,
    value: vehicle.daysInInventory,
    color: vehicle.daysInInventory > 90 ? '#EF4444' : 
           vehicle.daysInInventory > 60 ? '#F59E0B' : '#10B981'
  }));

  return (
    <div className="inventory-report">
      <div className="inventory-report__header">
        <h2 className="inventory-report__title">Inventory Aging Report</h2>
        <p className="inventory-report__period">
          {dateRange.start.toLocaleDateString()} - {dateRange.end.toLocaleDateString()}
        </p>
      </div>

      {/* Summary Cards */}
      <div className="inventory-report__summary">
        <div className="inventory-report__summary-grid">
          <div className="inventory-report__summary-card inventory-report__summary-card--total">
            <div className="inventory-report__summary-icon">📦</div>
            <div className="inventory-report__summary-content">
              <h3 className="inventory-report__summary-title">Total Vehicles</h3>
              <div className="inventory-report__summary-value">
                {summary.totalVehicles}
              </div>
            </div>
          </div>

          <div className="inventory-report__summary-card inventory-report__summary-card--average">
            <div className="inventory-report__summary-icon">📅</div>
            <div className="inventory-report__summary-content">
              <h3 className="inventory-report__summary-title">Average Age</h3>
              <div className="inventory-report__summary-value">
                {summary.averageAge.toFixed(0)} days
              </div>
            </div>
          </div>

          <div className="inventory-report__summary-card inventory-report__summary-card--aging">
            <div className="inventory-report__summary-icon">⚠️</div>
            <div className="inventory-report__summary-content">
              <h3 className="inventory-report__summary-title">Over 90 Days</h3>
              <div className="inventory-report__summary-value">
                {summary.vehiclesOver90Days}
              </div>
            </div>
          </div>

          <div className="inventory-report__summary-card inventory-report__summary-card--value">
            <div className="inventory-report__summary-icon">💰</div>
            <div className="inventory-report__summary-content">
              <h3 className="inventory-report__summary-title">Total Inventory Value</h3>
              <div className="inventory-report__summary-value">
                {formatCurrency(
                  vehicles.reduce((sum, v) => sum + v.totalCost, 0), 
                  'NGN'
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="inventory-report__charts">
        <div className="inventory-report__charts-grid">
          <div className="inventory-report__chart inventory-report__chart--aging">
            <PieChart
              data={agingData}
              title="Inventory Aging Distribution"
              size={250}
              showLegend={true}
              showPercentages={true}
              formatValue={(value) => value.toString()}
            />
          </div>

          <div className="inventory-report__chart inventory-report__chart--status">
            <PieChart
              data={statusData}
              title="Status Distribution"
              size={250}
              showLegend={true}
              showPercentages={true}
              formatValue={(value) => value.toString()}
            />
          </div>
        </div>

        <div className="inventory-report__chart inventory-report__chart--top-aging">
          <BarChart
            data={agingVehiclesData}
            title="Top 10 Aging Vehicles"
            height={300}
            formatValue={(value) => `${value} days`}
            showValues={true}
          />
        </div>
      </div>

      {/* Detailed Table */}
      <div className="inventory-report__details">
        <h3 className="inventory-report__details-title">Inventory Details</h3>
        <div className="inventory-report__table-container">
          <table className="inventory-report__table">
            <thead>
              <tr>
                <th>Vehicle</th>
                <th>Status</th>
                <th>Days in Inventory</th>
                <th>Total Cost</th>
                <th>Listing Price</th>
                <th>Aging Status</th>
              </tr>
            </thead>
            <tbody>
              {vehicles
                .sort((a, b) => b.daysInInventory - a.daysInInventory)
                .map((vehicle) => (
                <tr key={vehicle.vehicleId}>
                  <td className="inventory-report__table-vehicle">
                    {vehicle.vehicleName}
                  </td>
                  <td>
                    <span className={`inventory-report__status inventory-report__status--${vehicle.status}`}>
                      {vehicle.status.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                    </span>
                  </td>
                  <td className="inventory-report__table-days">
                    {vehicle.daysInInventory}
                  </td>
                  <td className="inventory-report__table-cost">
                    {formatCurrency(vehicle.totalCost, 'NGN')}
                  </td>
                  <td className="inventory-report__table-price">
                    {vehicle.listingPrice ? formatCurrency(vehicle.listingPrice, 'NGN') : 'N/A'}
                  </td>
                  <td>
                    <span className={`inventory-report__aging-status inventory-report__aging-status--${
                      vehicle.daysInInventory > 90 ? 'critical' :
                      vehicle.daysInInventory > 60 ? 'warning' : 'good'
                    }`}>
                      {vehicle.daysInInventory > 90 ? 'Critical' :
                       vehicle.daysInInventory > 60 ? 'Warning' : 'Good'}
                    </span>
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
