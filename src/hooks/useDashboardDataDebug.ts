// Debug version of useDashboardData
// Helps identify issues with dashboard data loading

'use client';

import { useState, useEffect } from 'react';
import { 
  DashboardKPIs, 
  InventoryStatusFunnel, 
  ActionRequired, 
  RecentActivity 
} from '@/types';
import { dashboardService, activityService, vehicleService } from '@/lib/firestore';

interface DashboardData {
  kpis: DashboardKPIs;
  funnelData: InventoryStatusFunnel;
  actionItems: ActionRequired[];
  recentActivity: RecentActivity[];
}

export function useDashboardDataDebug() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [debugLogs, setDebugLogs] = useState<string[]>([]);

  const addLog = (message: string) => {
    const timestamp = new Date().toISOString();
    setDebugLogs(prev => [...prev, `[${timestamp}] ${message}`]);
    console.log(`[Dashboard Debug] ${message}`);
  };

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setIsLoading(true);
        setError(null);
        setDebugLogs([]);
        
        addLog('Starting dashboard data fetch...');

        // Fetch KPIs
        addLog('Fetching KPIs...');
        const kpis = await dashboardService.getKPIs();
        addLog(`KPIs fetched: ${JSON.stringify(kpis)}`);

        // Fetch funnel data
        addLog('Fetching funnel data...');
        const funnelData = await vehicleService.getVehiclesByStatus();
        addLog(`Funnel data fetched: ${JSON.stringify(funnelData)}`);

        // Fetch action items
        addLog('Fetching action items...');
        const actionItems = await dashboardService.getActionItems();
        addLog(`Action items fetched: ${actionItems.length} items`);

        // Fetch recent activity
        addLog('Fetching recent activity...');
        const recentActivity = await activityService.getRecentActivities(10);
        addLog(`Recent activity fetched: ${recentActivity.length} activities`);

        const dashboardData: DashboardData = {
          kpis,
          funnelData,
          actionItems,
          recentActivity,
        };
        
        addLog('Dashboard data assembled successfully');
        setData(dashboardData);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to fetch dashboard data';
        addLog(`Error: ${errorMessage}`);
        setError(errorMessage);
        console.error('Dashboard data fetch error:', err);
      } finally {
        setIsLoading(false);
        addLog('Dashboard data fetch completed');
      }
    };

    fetchDashboardData();
  }, []);

  return {
    kpis: data?.kpis || {
      liveInventoryCount: 0,
      capitalDeployed: 0,
      readyForSaleValue: 0,
      thirtyDayGrossProfit: 0,
    },
    funnelData: data?.funnelData || {
      sourced: 0,
      inTransit: 0,
      inCustoms: 0,
      inWorkshop: 0,
      forSale: 0,
    },
    actionItems: data?.actionItems || [],
    recentActivity: data?.recentActivity || [],
    isLoading,
    error,
    debugLogs,
  };
}
