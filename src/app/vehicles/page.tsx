'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Vehicle, VehicleStatus, VehicleFilters } from '@/types';
import { calculateDaysInInventory } from '@/lib/utils';
import VehicleTable from '@/components/vehicles/VehicleTable';
import VehicleFiltersPanel from '@/components/vehicles/VehicleFiltersPanel';
import DeleteConfirmationDialog from '@/components/ui/DeleteConfirmationDialog';
import { Loader2, Trash2 } from 'lucide-react';

// Mock data - would be replaced by actual API call
import { getVehiclesData, bulkDeleteVehicles } from '@/hooks/useVehiclesData';

function VehiclesContent() {
  const [loading, setLoading] = useState(true);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [filteredVehicles, setFilteredVehicles] = useState<Vehicle[]>([]);
  const [filters, setFilters] = useState<VehicleFilters>({});
  const [selectedVehicles, setSelectedVehicles] = useState<string[]>([]);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  
  const searchParams = useSearchParams();
  const router = useRouter();
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await getVehiclesData();
        setVehicles(data);
        setFilteredVehicles(data);
      } catch (error) {
        console.error('Error fetching vehicles:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);
  
  useEffect(() => {
    // Apply filters
    if (!vehicles.length) return;
    
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
  
  const handleFilterChange = (newFilters: VehicleFilters) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  };

  const handleSearch = (searchTerm: string) => {
    setFilters(prev => ({ ...prev, search: searchTerm }));
  };

  const handleSelectionChange = (selectedIds: string[]) => {
    setSelectedVehicles(selectedIds);
  };

  const handleBulkDelete = async () => {
    if (selectedVehicles.length === 0) return;
    
    setIsDeleting(true);
    try {
      await bulkDeleteVehicles(selectedVehicles);
      
      // Remove deleted vehicles from state
      setVehicles(prev => prev.filter(v => !selectedVehicles.includes(v.id)));
      setFilteredVehicles(prev => prev.filter(v => !selectedVehicles.includes(v.id)));
      setSelectedVehicles([]);
      setShowDeleteDialog(false);
    } catch (error) {
      console.error('Error deleting vehicles:', error);
      // You might want to show an error message to the user here
    } finally {
      setIsDeleting(false);
    }
  };

  // Calculate total costs for each vehicle
  const vehiclesWithCosts = filteredVehicles.map(vehicle => {
    const totalCost = Array.isArray(vehicle.costs) 
      ? vehicle.costs.reduce((sum, cost) => sum + (cost.amount || 0), 0)
      : 0;
    
    // Debug date conversion if needed
    if (process.env.NODE_ENV === 'development' && vehicle.createdAt) {
      console.log('Vehicle createdAt:', vehicle.createdAt, 'Type:', typeof vehicle.createdAt);
    }
    
    const daysInInventory = calculateDaysInInventory(vehicle);
    return { ...vehicle, totalCost, daysInInventory };
  });
  
  if (loading) {
    return (
      <div className="loading-container">
        <Loader2 className="loading-spinner" />
      </div>
    );
  }
  
  return (
    <div className="vehicles-inventory-container">
      <div className="page-header">
        <h1>Vehicle Inventory</h1>
        <div className="header-actions">
          {selectedVehicles.length > 0 && (
            <button 
              className="bulk-delete-btn"
              onClick={() => setShowDeleteDialog(true)}
            >
              <Trash2 className="icon" />
              Delete Selected ({selectedVehicles.length})
            </button>
          )}
          <button 
            className="add-vehicle-btn"
            onClick={() => router.push('/vehicles/new')}
          >
            Add New Vehicle
          </button>
        </div>
      </div>
      
      <div className="page-content">
        <div className="filters-section">
          <VehicleFiltersPanel 
            filters={filters} 
            onFilterChange={handleFilterChange}
            onSearch={handleSearch} 
          />
        </div>
        
        <div className="table-section">
          <VehicleTable 
            vehicles={vehiclesWithCosts}
            onRowClick={(vehicle) => router.push(`/vehicles/${vehicle.id}`)}
            selectedVehicles={selectedVehicles}
            onSelectionChange={handleSelectionChange}
          />
        </div>
      </div>

      <DeleteConfirmationDialog
        isOpen={showDeleteDialog}
        onClose={() => setShowDeleteDialog(false)}
        onConfirm={handleBulkDelete}
        title="Delete Selected Vehicles"
        message={`Are you sure you want to delete ${selectedVehicles.length} vehicle${selectedVehicles.length > 1 ? 's' : ''}? This action cannot be undone.`}
        itemName={`${selectedVehicles.length} vehicle${selectedVehicles.length > 1 ? 's' : ''}`}
        isDeleting={isDeleting}
      />
    </div>
  );
}

export default function VehiclesPage() {
  return (
    <Suspense fallback={
      <div className="loading-container">
        <Loader2 className="loading-spinner" />
      </div>
    }>
      <VehiclesContent />
    </Suspense>
  );
}
