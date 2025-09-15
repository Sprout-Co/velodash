'use client';

import React from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { KPICards } from '@/components/dashboard/KPICards';
import { InventoryFunnel } from '@/components/dashboard/InventoryFunnel';
import { ActionRequiredList } from '@/components/dashboard/ActionRequiredList';
import { RecentActivityFeed } from '@/components/dashboard/RecentActivityFeed';
import { useDashboardData } from '@/hooks/useDashboardData';

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
    <DashboardLayout>
      <div className="dashboard">
        <header className="dashboard__header">
          <h1 className="dashboard__title">Mission Control</h1>
          <p className="dashboard__subtitle">Real-time business overview</p>
        </header>

        <div className="dashboard__content">
          {/* KPI Cards Section */}
          <section className="dashboard__kpis">
            <KPICards data={kpis} isLoading={isLoading} />
          </section>

          {/* Main Content Grid */}
          <div className="dashboard__grid">
            {/* Left Column */}
            <div className="dashboard__left">
              <InventoryFunnel data={funnelData} isLoading={isLoading} />
              <ActionRequiredList items={actionItems} isLoading={isLoading} />
            </div>

            {/* Right Column */}
            <div className="dashboard__right">
              <RecentActivityFeed activities={recentActivity} isLoading={isLoading} />
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
