'use client';

import { useState, useEffect } from 'react';
import { 
  DashboardKPIs, 
  InventoryStatusFunnel, 
  ActionRequired, 
  RecentActivity 
} from '@/types';

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

        // Simulate API calls with mock data
        // In a real app, these would be actual API calls
        const mockData: DashboardData = {
          kpis: {
            liveInventoryCount: 28,
            capitalDeployed: 25000000, // 125M NGN
            readyForSaleValue: 80000000, // 180M NGN
            thirtyDayGrossProfit: 5000000, // 45M NGN
          },
          funnelData: {
            sourced: 5,
            inTransit: 3,
            inCustoms: 2,
            inWorkshop: 6,
            forSale: 12,
          },
          actionItems: [
            {
              id: '1',
              type: 'customs-delay',
              vehicleId: 'VIN-12345',
              vehicleName: '2018 Lexus RX350',
              days: 12,
              description: 'Vehicle has been in customs for 12 days, exceeding the 10-day threshold',
              priority: 'high',
            },
            {
              id: '2',
              type: 'workshop-delay',
              vehicleId: 'VIN-67890',
              vehicleName: '2017 Honda Accord',
              days: 25,
              description: 'Vehicle has been in workshop for 25 days, exceeding the 21-day threshold',
              priority: 'high',
            },
            {
              id: '3',
              type: 'unsold-aging',
              vehicleId: 'VIN-11111',
              vehicleName: '2019 Toyota Camry',
              days: 95,
              description: 'Vehicle has been unsold for 95 days, exceeding the 90-day threshold',
              priority: 'medium',
            },
            {
              id: '4',
              type: 'customs-delay',
              vehicleId: 'VIN-22222',
              vehicleName: '2020 BMW X5',
              days: 8,
              description: 'Vehicle approaching customs delay threshold',
              priority: 'low',
            },
          ],
          recentActivity: [
            {
              id: '1',
              userId: 'admin-1',
              userName: 'Admin',
              action: 'added Customs Duty cost of ₦1,800,000 to',
              vehicleId: 'VIN-12345',
              vehicleName: '2018 Lexus RX350',
              timestamp: new Date(Date.now() - 1000 * 60 * 30), // 30 minutes ago
            },
            {
              id: '2',
              userId: 'staff-1',
              userName: 'Staff Member',
              action: 'changed status of',
              vehicleId: 'VIN-67890',
              vehicleName: '2017 Honda Accord',
              timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
            },
            {
              id: '3',
              userId: 'admin-1',
              userName: 'Admin',
              action: 'updated vehicle details for',
              vehicleId: 'VIN-11111',
              vehicleName: '2019 Toyota Camry',
              timestamp: new Date(Date.now() - 1000 * 60 * 60 * 4), // 4 hours ago
            },
            {
              id: '4',
              userId: 'staff-2',
              userName: 'Another Staff',
              action: 'added mechanical repair cost of ₦450,000 to',
              vehicleId: 'VIN-33333',
              vehicleName: '2021 Mercedes C-Class',
              timestamp: new Date(Date.now() - 1000 * 60 * 60 * 6), // 6 hours ago
            },
            {
              id: '5',
              userId: 'admin-1',
              userName: 'Admin',
              action: 'marked as sold',
              vehicleId: 'VIN-44444',
              vehicleName: '2020 Audi A4',
              timestamp: new Date(Date.now() - 1000 * 60 * 60 * 8), // 8 hours ago
            },
          ],
        };

        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        setData(mockData);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch dashboard data');
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
  };
}
