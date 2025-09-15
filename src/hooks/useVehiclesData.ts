import { useState, useEffect } from 'react';
import { Vehicle, PaginatedResponse, VehicleFilters, VehicleFormData } from '@/types';
import { vehicleService } from '@/lib/firestore';

// Re-export the service functions for backward compatibility
export const getVehiclesData = async (): Promise<Vehicle[]> => {
  const response = await vehicleService.getVehicles();
  return response.data;
};

export const getVehicleById = async (id: string): Promise<Vehicle | null> => {
  return await vehicleService.getVehicleById(id);
};

export const createVehicle = async (formData: VehicleFormData): Promise<Vehicle> => {
  return await vehicleService.createVehicle(formData);
};

export const updateVehicle = async (id: string, formData: VehicleFormData): Promise<Vehicle> => {
  return await vehicleService.updateVehicle(id, formData);
};

export const deleteVehicle = async (id: string): Promise<void> => {
  return await vehicleService.deleteVehicle(id);
};

export default function useVehiclesData(filters?: VehicleFilters) {
  const [loading, setLoading] = useState(true);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [filteredVehicles, setFilteredVehicles] = useState<Vehicle[]>([]);
  const [error, setError] = useState<Error | null>(null);
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const data = await getVehiclesData();
        setVehicles(data);
        setFilteredVehicles(data);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to fetch vehicles'));
        console.error('Error fetching vehicles:', err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);
  
  useEffect(() => {
    if (!vehicles.length || !filters) return;
    
    let results = [...vehicles];
    
    if (filters.status?.length) {
      results = results.filter(vehicle => filters.status!.includes(vehicle.status));
    }
    
    if (filters.make?.length) {
      results = results.filter(vehicle => filters.make!.includes(vehicle.make));
    }
    
    if (filters.year?.min || filters.year?.max) {
      results = results.filter(vehicle => {
        const { min, max } = filters.year!;
        if (min && max) return vehicle.year >= min && vehicle.year <= max;
        if (min) return vehicle.year >= min;
        if (max) return vehicle.year <= max;
        return true;
      });
    }
    
    if (filters.priceRange?.min || filters.priceRange?.max) {
      results = results.filter(vehicle => {
        const { min, max } = filters.priceRange!;
        const price = vehicle.acquisitionDetails.purchasePrice;
        if (min && max) return price >= min && price <= max;
        if (min) return price >= min;
        if (max) return price <= max;
        return true;
      });
    }
    
    if (filters.search) {
      const searchTerm = filters.search.toLowerCase();
      results = results.filter(vehicle =>
        vehicle.vin.toLowerCase().includes(searchTerm) ||
        vehicle.make.toLowerCase().includes(searchTerm) ||
        vehicle.model.toLowerCase().includes(searchTerm) ||
        `${vehicle.make} ${vehicle.model}`.toLowerCase().includes(searchTerm)
      );
    }
    
    setFilteredVehicles(results);
  }, [filters, vehicles]);
  
  return { loading, vehicles: filteredVehicles, error };
}
