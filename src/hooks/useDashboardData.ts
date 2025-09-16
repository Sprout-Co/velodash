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

export function useDashboardData() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Fetch all dashboard data from Firestore
        const [kpis, funnelData, actionItems, recentActivity] = await Promise.all([
          dashboardService.getKPIs(),
          vehicleService.getVehiclesByStatus(),
          dashboardService.getActionItems(),
          activityService.getRecentActivities(10),
        ]);

        const dashboardData: DashboardData = {
          kpis,
          funnelData,
          actionItems,
          recentActivity,
        };
        
        console.log('Dashboard data fetched:', {
          kpis,
          funnelData,
          actionItemsCount: actionItems.length,
          recentActivityCount: recentActivity.length
        });
        
        setData(dashboardData);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch dashboard data');
        console.error('Dashboard data fetch error:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  return {
    kpis: data?.kpis || {
      liveInventoryCount: 0,
      capitalDeployed: 0,
      readyForSaleValue: 0,
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
  };
}
