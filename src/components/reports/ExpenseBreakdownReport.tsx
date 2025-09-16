'use client';

import React from 'react';
import { ExpenseBreakdownReport as ExpenseReport } from '@/types';
import { BarChart, PieChart } from '@/components/charts';
import { formatCurrency } from '@/lib/utils';

interface ExpenseBreakdownReportProps {
  data: ExpenseReport | null;
  dateRange: { start: Date; end: Date };
  isLoading: boolean;
}

export function ExpenseBreakdownReport({ data, dateRange, isLoading }: ExpenseBreakdownReportProps) {
  if (isLoading) {
    return (
      <div className="expense-report">
        <div className="expense-report__loading">
          <div className="expense-report__loading-spinner"></div>
          <p>Loading expense breakdown data...</p>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="expense-report">
        <div className="expense-report__empty">
          <h3>No Expense Data Available</h3>
          <p>No expense data found for the selected date range.</p>
        </div>
      </div>
    );
  }

  const { summary, categories } = data;

  // Prepare chart data
  const categoryData = categories.map(category => ({
    label: formatCategoryLabel(category.category),
    value: category.totalAmount,
    color: getCategoryColor(category.category),
    percentage: category.percentage
  }));

  const percentageData = categories.map(category => ({
    label: formatCategoryLabel(category.category),
    value: category.percentage,
    color: getCategoryColor(category.category)
  }));

  // Top expense categories
  const topCategories = categories.slice(0, 8);

  return (
    <div className="expense-report">
      <div className="expense-report__header">
        <h2 className="expense-report__title">Expense Breakdown Report</h2>
        <p className="expense-report__period">
          {dateRange.start.toLocaleDateString()} - {dateRange.end.toLocaleDateString()}
        </p>
      </div>

      {/* Summary Cards */}
      <div className="expense-report__summary">
        <div className="expense-report__summary-grid">
          <div className="expense-report__summary-card expense-report__summary-card--total">
            <div className="expense-report__summary-icon">💰</div>
            <div className="expense-report__summary-content">
              <h3 className="expense-report__summary-title">Total Expenses</h3>
              <div className="expense-report__summary-value">
                {formatCurrency(summary.totalExpenses, 'NGN')}
              </div>
            </div>
          </div>

          <div className="expense-report__summary-card expense-report__summary-card--average">
            <div className="expense-report__summary-icon">📊</div>
            <div className="expense-report__summary-content">
              <h3 className="expense-report__summary-title">Average per Vehicle</h3>
              <div className="expense-report__summary-value">
                {formatCurrency(summary.averagePerVehicle, 'NGN')}
              </div>
            </div>
          </div>

          <div className="expense-report__summary-card expense-report__summary-card--categories">
            <div className="expense-report__summary-icon">📋</div>
            <div className="expense-report__summary-content">
              <h3 className="expense-report__summary-title">Categories</h3>
              <div className="expense-report__summary-value">
                {categories.length}
              </div>
            </div>
          </div>

          <div className="expense-report__summary-card expense-report__summary-card--top">
            <div className="expense-report__summary-icon">🏆</div>
            <div className="expense-report__summary-content">
              <h3 className="expense-report__summary-title">Top Category</h3>
              <div className="expense-report__summary-value">
                {categories.length > 0 ? formatCategoryLabel(categories[0].category) : 'N/A'}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="expense-report__charts">
        <div className="expense-report__charts-grid">
          <div className="expense-report__chart expense-report__chart--breakdown">
            <PieChart
              data={categoryData}
              title="Expense Distribution by Category"
              size={300}
              showLegend={true}
              showPercentages={true}
              formatValue={(value) => formatCurrency(value, 'NGN')}
            />
          </div>

          <div className="expense-report__chart expense-report__chart--amounts">
            <BarChart
              data={categoryData}
              title="Expense Amounts by Category"
              height={300}
              formatValue={(value) => formatCurrency(value, 'NGN')}
              showValues={true}
              showPercentages={true}
            />
          </div>
        </div>

        <div className="expense-report__chart expense-report__chart--percentages">
          <BarChart
            data={percentageData}
            title="Expense Percentages by Category"
            height={300}
            formatValue={(value) => `${value.toFixed(1)}%`}
            showValues={true}
          />
        </div>
      </div>

      {/* Category Analysis */}
      <div className="expense-report__analysis">
        <h3 className="expense-report__analysis-title">Category Analysis</h3>
        <div className="expense-report__analysis-grid">
          {categories.map((category, index) => (
            <div key={category.category} className="expense-report__analysis-card">
              <div className="expense-report__analysis-header">
                <div className="expense-report__analysis-icon">
                  {getCategoryIcon(category.category)}
                </div>
                <div className="expense-report__analysis-content">
                  <h4 className="expense-report__analysis-category">
                    {formatCategoryLabel(category.category)}
                  </h4>
                  <div className="expense-report__analysis-amount">
                    {formatCurrency(category.totalAmount, 'NGN')}
                  </div>
                </div>
              </div>
              <div className="expense-report__analysis-details">
                <div className="expense-report__analysis-detail">
                  <span className="expense-report__analysis-label">Percentage:</span>
                  <span className="expense-report__analysis-value">
                    {category.percentage.toFixed(1)}%
                  </span>
                </div>
                <div className="expense-report__analysis-detail">
                  <span className="expense-report__analysis-label">Transactions:</span>
                  <span className="expense-report__analysis-value">
                    {category.vehicleCount}
                  </span>
                </div>
                <div className="expense-report__analysis-detail">
                  <span className="expense-report__analysis-label">Rank:</span>
                  <span className="expense-report__analysis-value">
                    #{index + 1}
                  </span>
                </div>
              </div>
              <div className="expense-report__analysis-bar">
                <div 
                  className="expense-report__analysis-bar-fill"
                  style={{
                    width: `${category.percentage}%`,
                    backgroundColor: getCategoryColor(category.category)
                  }}
                ></div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Detailed Table */}
      <div className="expense-report__details">
        <h3 className="expense-report__details-title">Expense Details</h3>
        <div className="expense-report__table-container">
          <table className="expense-report__table">
            <thead>
              <tr>
                <th>Category</th>
                <th>Total Amount</th>
                <th>Percentage</th>
                <th>Transactions</th>
                <th>Average per Transaction</th>
              </tr>
            </thead>
            <tbody>
              {categories.map((category) => (
                <tr key={category.category}>
                  <td className="expense-report__table-category">
                    <div className="expense-report__table-category-content">
                      <span className="expense-report__table-category-icon">
                        {getCategoryIcon(category.category)}
                      </span>
                      <span>{formatCategoryLabel(category.category)}</span>
                    </div>
                  </td>
                  <td className="expense-report__table-amount">
                    {formatCurrency(category.totalAmount, 'NGN')}
                  </td>
                  <td className="expense-report__table-percentage">
                    <div className="expense-report__table-percentage-content">
                      <span>{category.percentage.toFixed(1)}%</span>
                      <div className="expense-report__table-percentage-bar">
                        <div 
                          className="expense-report__table-percentage-fill"
                          style={{
                            width: `${category.percentage}%`,
                            backgroundColor: getCategoryColor(category.category)
                          }}
                        ></div>
                      </div>
                    </div>
                  </td>
                  <td className="expense-report__table-count">
                    {category.vehicleCount}
                  </td>
                  <td className="expense-report__table-average">
                    {formatCurrency(category.totalAmount / category.vehicleCount, 'NGN')}
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

function formatCategoryLabel(category: string): string {
  return category
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

function getCategoryColor(category: string): string {
  const colors: Record<string, string> = {
    'purchase-price': '#3B82F6',
    'shipping': '#8B5CF6',
    'customs-duty': '#F59E0B',
    'terminal-charges': '#EF4444',
    'transportation': '#10B981',
    'mechanical-parts': '#06B6D4',
    'body-parts': '#84CC16',
    'mechanical-labor': '#F97316',
    'bodywork-labor': '#EC4899',
    'detailing': '#6366F1',
    'marketing': '#8B5CF6',
    'overhead-allocation': '#6B7280'
  };
  return colors[category] || '#6B7280';
}

function getCategoryIcon(category: string): string {
  const icons: Record<string, string> = {
    'purchase-price': '🛒',
    'shipping': '🚢',
    'customs-duty': '🏛️',
    'terminal-charges': '🏭',
    'transportation': '🚛',
    'mechanical-parts': '🔧',
    'body-parts': '🚗',
    'mechanical-labor': '⚙️',
    'bodywork-labor': '🔨',
    'detailing': '✨',
    'marketing': '📢',
    'overhead-allocation': '📊'
  };
  return icons[category] || '💰';
}
