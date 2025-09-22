'use client';

import React from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { KPICards } from '@/components/dashboard/KPICards';
import { InventoryFunnel } from '@/components/dashboard/InventoryFunnel';
import { ActionRequiredList } from '@/components/dashboard/ActionRequiredList';
import { RecentActivityFeed } from '@/components/dashboard/RecentActivityFeed';
import { TimeDisplay } from '@/components/ui/TimeDisplay';
import { useDashboardData } from '@/hooks/useDashboardData';
import { ProtectedRoute } from '@/components/auth';

export default function DashboardPage() {
  const { 
    kpis, 
    funnelData, 
    actionItems, 
    recentActivity, 
    isLoading, 
    error 
  } = useDashboardData();

  if (error) {
    return (
      <div className="dashboard-error">
        <h2>Error Loading Dashboard</h2>
        <p>{error}</p>
      </div>
    );
  }

  return (
    <ProtectedRoute>
      <DashboardLayout>
        <div className="dashboard">
          <header className="dashboard__header">
            <div className="dashboard__header-content">
              <div className="dashboard__header-text">
                <h1 className="dashboard__title">Mission Control</h1>
                <p className="dashboard__subtitle">Real-time business overview</p>
              </div>
              <div className="dashboard__header-actions">
                <div className="dashboard__last-updated">
                  <TimeDisplay 
                    format="time" 
                    prefix="Last updated: " 
                    updateInterval={1000}
                  />
                </div>
              </div>
            </div>
          </header>

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
    </ProtectedRoute>
  );
}