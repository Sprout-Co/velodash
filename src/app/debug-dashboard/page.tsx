// Debug Dashboard
// Debug version of dashboard to identify data loading issues

'use client';

import React from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { KPICards } from '@/components/dashboard/KPICards';
import { InventoryFunnel } from '@/components/dashboard/InventoryFunnel';
import { ActionRequiredList } from '@/components/dashboard/ActionRequiredList';
import { RecentActivityFeed } from '@/components/dashboard/RecentActivityFeed';
import { useDashboardDataDebug } from '@/hooks/useDashboardDataDebug';

export default function DebugDashboardPage() {
  const { 
    kpis, 
    funnelData, 
    actionItems, 
    recentActivity, 
    isLoading, 
    error,
    debugLogs
  } = useDashboardDataDebug();

  if (error) {
    return (
      <div className="dashboard-error">
        <h2>Error Loading Dashboard</h2>
        <p>{error}</p>
        <div className="mt-4">
          <h3>Debug Logs:</h3>
          <pre className="text-xs bg-gray-100 p-2 rounded overflow-auto">
            {debugLogs.join('\n')}
          </pre>
        </div>
      </div>
    );
  }

  return (
    <DashboardLayout>
      <div className="dashboard">
        <header className="dashboard__header">
          <div className="dashboard__header-content">
            <div className="dashboard__header-text">
              <h1 className="dashboard__title">Debug Dashboard</h1>
              <p className="dashboard__subtitle">Debug version with detailed logging</p>
            </div>
            <div className="dashboard__header-actions">
              <div className="dashboard__last-updated">
                Last updated: {new Date().toLocaleTimeString()}
              </div>
            </div>
          </div>
        </header>

        {/* Debug Logs Section */}
        <div className="mb-6 p-4 bg-gray-100 rounded-lg">
          <h3 className="text-lg font-medium text-gray-800 mb-2">Debug Logs</h3>
          <div className="bg-black text-green-400 p-3 rounded text-xs font-mono overflow-auto max-h-40">
            {debugLogs.map((log, index) => (
              <div key={index}>{log}</div>
            ))}
          </div>
        </div>

        <div className="dashboard__content">
          {/* KPI Cards Section */}
          <section className="dashboard__section dashboard__section--kpis">
            <div className="dashboard__section-header">
              <h2 className="dashboard__section-title">Key Performance Indicators</h2>
            </div>
            <div className="dashboard__section-content">
              <KPICards data={kpis} isLoading={isLoading} />
            </div>
          </section>

          {/* Main Content Grid */}
          <div className="dashboard__main-grid">
            {/* Left Column */}
            <div className="dashboard__column dashboard__column--left">
              <section className="dashboard__section dashboard__section--funnel">
                <div className="dashboard__section-header">
                  <h2 className="dashboard__section-title">Inventory Pipeline</h2>
                </div>
                <div className="dashboard__section-content">
                  <InventoryFunnel data={funnelData} isLoading={isLoading} />
                </div>
              </section>
              
              <section className="dashboard__section dashboard__section--actions">
                <div className="dashboard__section-header">
                  <h2 className="dashboard__section-title">Action Required</h2>
                </div>
                <div className="dashboard__section-content">
                  <ActionRequiredList items={actionItems} isLoading={isLoading} />
                </div>
              </section>
            </div>

            {/* Right Column */}
            <div className="dashboard__column dashboard__column--right">
              <section className="dashboard__section dashboard__section--activity">
                <div className="dashboard__section-header">
                  <h2 className="dashboard__section-title">Recent Activity</h2>
                </div>
                <div className="dashboard__section-content">
                  <RecentActivityFeed activities={recentActivity} isLoading={isLoading} />
                </div>
              </section>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
