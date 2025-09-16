'use client';

import React, { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { TimeDisplay } from '@/components/ui/TimeDisplay';
import { SalesPerformanceReport } from '@/components/reports/SalesPerformanceReport';
import { InventoryAgingReport } from '@/components/reports/InventoryAgingReport';
import { ExpenseBreakdownReport } from '@/components/reports/ExpenseBreakdownReport';
import { ProfitabilityAnalysis } from '@/components/reports/ProfitabilityAnalysis';
import { useReportsData } from '@/hooks/useReportsData';

type ReportTab = 'sales' | 'inventory' | 'expenses' | 'profitability';

export default function ReportsPage() {
  const [activeTab, setActiveTab] = useState<ReportTab>('sales');
  const [dateRange, setDateRange] = useState({
    start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
    end: new Date()
  });

  const { 
    salesData, 
    inventoryData, 
    expenseData, 
    profitabilityData,
    isLoading, 
    error 
  } = useReportsData(dateRange);

  const tabs = [
    { id: 'sales' as ReportTab, label: 'Sales Performance', icon: '📈' },
    { id: 'inventory' as ReportTab, label: 'Inventory Aging', icon: '📦' },
    { id: 'expenses' as ReportTab, label: 'Expense Breakdown', icon: '💰' },
    { id: 'profitability' as ReportTab, label: 'Profitability Analysis', icon: '🎯' },
  ];

  const handleDateRangeChange = (start: Date, end: Date) => {
    setDateRange({ start, end });
  };

  if (error) {
    return (
      <DashboardLayout>
        <div className="reports-error">
          <div className="reports-error__content">
            <h2 className="reports-error__title">Error Loading Reports</h2>
            <p className="reports-error__message">{error}</p>
            <button 
              className="reports-error__retry"
              onClick={() => window.location.reload()}
            >
              Retry
            </button>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="reports">
        <header className="reports__header">
          <div className="reports__header-content">
            <div className="reports__header-text">
              <h1 className="reports__title">Reports & Analytics</h1>
              <p className="reports__subtitle">Comprehensive business insights and performance metrics</p>
            </div>
            <div className="reports__header-actions">
              <div className="reports__date-range">
                <label className="reports__date-label">Date Range:</label>
                <input
                  type="date"
                  className="reports__date-input"
                  value={dateRange.start.toISOString().split('T')[0]}
                  onChange={(e) => handleDateRangeChange(new Date(e.target.value), dateRange.end)}
                />
                <span className="reports__date-separator">to</span>
                <input
                  type="date"
                  className="reports__date-input"
                  value={dateRange.end.toISOString().split('T')[0]}
                  onChange={(e) => handleDateRangeChange(dateRange.start, new Date(e.target.value))}
                />
              </div>
              <div className="reports__last-updated">
                <TimeDisplay 
                  format="time" 
                  prefix="Last updated: " 
                  updateInterval={30000}
                />
              </div>
            </div>
          </div>
        </header>

        <div className="reports__content">
          {/* Navigation Tabs */}
          <nav className="reports__nav">
            <div className="reports__nav-tabs">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  className={`reports__nav-tab ${activeTab === tab.id ? 'reports__nav-tab--active' : ''}`}
                  onClick={() => setActiveTab(tab.id)}
                >
                  <span className="reports__nav-icon">{tab.icon}</span>
                  <span className="reports__nav-label">{tab.label}</span>
                </button>
              ))}
            </div>
          </nav>

          {/* Report Content */}
          <div className="reports__main">
            {isLoading ? (
              <div className="reports__loading">
                <div className="reports__loading-spinner"></div>
                <p className="reports__loading-text">Loading report data...</p>
              </div>
            ) : (
              <div className="reports__content-area">
                {activeTab === 'sales' && (
                  <SalesPerformanceReport 
                    data={salesData} 
                    dateRange={dateRange}
                    isLoading={isLoading}
                  />
                )}
                {activeTab === 'inventory' && (
                  <InventoryAgingReport 
                    data={inventoryData} 
                    dateRange={dateRange}
                    isLoading={isLoading}
                  />
                )}
                {activeTab === 'expenses' && (
                  <ExpenseBreakdownReport 
                    data={expenseData} 
                    dateRange={dateRange}
                    isLoading={isLoading}
                  />
                )}
                {activeTab === 'profitability' && (
                  <ProfitabilityAnalysis 
                    data={profitabilityData} 
                    dateRange={dateRange}
                    isLoading={isLoading}
                  />
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
