// Real-time data hooks using Firestore subscriptions
// Provides live updates for vehicles and activities

import { useState, useEffect } from 'react';
import { Vehicle, RecentActivity, VehicleFilters } from '@/types';
import { realtimeService } from '@/lib/firestore';

export function useRealtimeVehicles(filters?: VehicleFilters) {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);

    const unsubscribe = realtimeService.subscribeToVehicles(
      (updatedVehicles) => {
        setVehicles(updatedVehicles);
        setLoading(false);
      },
      filters
    );

    return () => {
      unsubscribe();
    };
  }, [filters]);

  return { vehicles, loading, error };
}

export function useRealtimeActivities(limit: number = 10) {
  const [activities, setActivities] = useState<RecentActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);

    const unsubscribe = realtimeService.subscribeToActivities(
      (updatedActivities) => {
        setActivities(updatedActivities);
        setLoading(false);
      },
      limit
    );

    return () => {
      unsubscribe();
    };
  }, [limit]);

  return { activities, loading, error };
}
