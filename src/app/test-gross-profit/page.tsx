'use client';

import React from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { KPICards } from '@/components/dashboard/KPICards';
import { GrossProfitCard } from '@/components/dashboard/GrossProfitCard';
import { useDashboardData } from '@/hooks/useDashboardData';

export default function TestGrossProfitPage() {
  const { 
    kpis, 
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
          <div className="dashboard__header-content">
            <div className="dashboard__header-text">
              <h1 className="dashboard__title">Gross Profit Test</h1>
              <p className="dashboard__subtitle">Testing gross profit card functionality</p>
            </div>
          </div>
        </header>

        <div className="dashboard__content">
          {/* KPI Cards Section */}
          <section className="dashboard__section dashboard__section--kpis">
            <div className="dashboard__section-header">
              <h2 className="dashboard__section-title">All KPI Cards (including Gross Profit)</h2>
            </div>
            <div className="dashboard__section-content">
              <KPICards data={kpis} isLoading={isLoading} />
            </div>
          </section>

          {/* Standalone Gross Profit Card */}
          <section className="dashboard__section dashboard__section--gross-profit">
            <div className="dashboard__section-header">
              <h2 className="dashboard__section-title">Standalone Gross Profit Card</h2>
            </div>
            <div className="dashboard__section-content">
              <div style={{ maxWidth: '400px' }}>
                <GrossProfitCard 
                  totalGrossProfit={kpis.grossProfit} 
                  isLoading={isLoading} 
                />
              </div>
            </div>
          </section>

          {/* Debug Information */}
          <section className="dashboard__section dashboard__section--debug">
            <div className="dashboard__section-header">
              <h2 className="dashboard__section-title">Debug Information</h2>
            </div>
            <div className="dashboard__section-content">
              <div className="card">
                <div className="card__body">
                  <h3>Current KPI Data:</h3>
                  <pre style={{ 
                    background: '#f5f5f5', 
                    padding: '1rem', 
                    borderRadius: '4px',
                    overflow: 'auto'
                  }}>
                    {JSON.stringify(kpis, null, 2)}
                  </pre>
                  
                  <h3>Loading State:</h3>
                  <p>{isLoading ? 'Loading...' : 'Loaded'}</p>
                  
                  <h3>Error State:</h3>
                  <p>{error || 'No errors'}</p>
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </DashboardLayout>
  );
}
