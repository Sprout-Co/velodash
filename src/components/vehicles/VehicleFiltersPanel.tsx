import React, { useState, useEffect } from 'react';
import { VehicleFilters, VehicleStatus } from '@/types';
import { Search } from 'lucide-react';

interface VehicleFiltersPanelProps {
  filters: VehicleFilters;
  onFilterChange: (filters: VehicleFilters) => void;
  onSearch: (term: string) => void;
}

export default function VehicleFiltersPanel({
  filters,
  onFilterChange,
  onSearch,
}: VehicleFiltersPanelProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [availableMakes, setAvailableMakes] = useState<string[]>([
    'Toyota', 'Honda', 'Ford', 'Chevrolet', 'Mercedes', 'BMW', 'Audi', 'Lexus', 'Hyundai', 'Kia'
  ]); // Would come from API in real implementation
  
  const statusOptions: { value: VehicleStatus; label: string }[] = [
    { value: 'sourced', label: 'Sourced' },
    { value: 'in-transit', label: 'In Transit' },
    { value: 'in-customs', label: 'In Customs' },
    { value: 'in-workshop', label: 'In Workshop' },
    { value: 'for-sale', label: 'For Sale' },
    { value: 'sale-pending', label: 'Sale Pending' },
    { value: 'sold', label: 'Sold' },
    { value: 'archived', label: 'Archived' },
  ];
  
  const handleStatusChange = (status: VehicleStatus) => {
    const currentStatuses = filters.status || [];
    const updatedStatuses = currentStatuses.includes(status)
      ? currentStatuses.filter(s => s !== status)
      : [...currentStatuses, status];
      
    onFilterChange({ status: updatedStatuses });
  };
  
  const handleMakeChange = (make: string) => {
    const currentMakes = filters.make || [];
    const updatedMakes = currentMakes.includes(make)
      ? currentMakes.filter(m => m !== make)
      : [...currentMakes, make];
      
    onFilterChange({ make: updatedMakes });
  };
  
  const handleYearChange = (field: 'min' | 'max', value: string) => {
    const numValue = value ? parseInt(value, 10) : undefined;
    onFilterChange({ 
      year: { 
        ...filters.year,
        [field]: numValue
      } 
    });
  };
  
  const handlePriceChange = (field: 'min' | 'max', value: string) => {
    const numValue = value ? parseInt(value, 10) : undefined;
    onFilterChange({ 
      priceRange: { 
        ...filters.priceRange,
        [field]: numValue
      } 
    });
  };
  
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(searchTerm);
  };
  
  const handleReset = () => {
    setSearchTerm('');
    onFilterChange({
      status: undefined,
      make: undefined,
      year: undefined,
      priceRange: undefined,
      search: undefined,
    });
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow vehicle-filters">
      <h2 className="font-semibold text-lg mb-4">Filters</h2>
      
      <form onSubmit={handleSearchSubmit} className="mb-4">
        <div className="relative">
          <input
            type="text"
            placeholder="Search VIN, Make, Model..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full p-2 pl-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
          />
          <Search className="h-4 w-4 text-gray-400 absolute left-3 top-3" />
        </div>
        <button type="submit" className="sr-only">Search</button>
      </form>
      
      <div className="mb-6">
        <h3 className="font-medium mb-2">Status</h3>
        <div className="space-y-1">
          {statusOptions.map(option => (
            <label key={option.value} className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={filters.status?.includes(option.value) || false}
                onChange={() => handleStatusChange(option.value)}
                className="rounded text-primary focus:ring-primary"
              />
              <span>{option.label}</span>
            </label>
          ))}
        </div>
      </div>
      
      <div className="mb-6">
        <h3 className="font-medium mb-2">Make</h3>
        <div className="space-y-1 max-h-40 overflow-y-auto">
          {availableMakes.map(make => (
            <label key={make} className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={filters.make?.includes(make) || false}
                onChange={() => handleMakeChange(make)}
                className="rounded text-primary focus:ring-primary"
              />
              <span>{make}</span>
            </label>
          ))}
        </div>
      </div>
      
      <div className="mb-6">
        <h3 className="font-medium mb-2">Year</h3>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="text-xs text-gray-500">Min</label>
            <input
              type="number"
              placeholder="Min"
              value={filters.year?.min || ''}
              onChange={(e) => handleYearChange('min', e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </div>
          <div>
            <label className="text-xs text-gray-500">Max</label>
            <input
              type="number"
              placeholder="Max"
              value={filters.year?.max || ''}
              onChange={(e) => handleYearChange('max', e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </div>
        </div>
      </div>
      
      <div className="mb-6">
        <h3 className="font-medium mb-2">Purchase Price</h3>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="text-xs text-gray-500">Min</label>
            <input
              type="number"
              placeholder="Min"
              value={filters.priceRange?.min || ''}
              onChange={(e) => handlePriceChange('min', e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </div>
          <div>
            <label className="text-xs text-gray-500">Max</label>
            <input
              type="number"
              placeholder="Max"
              value={filters.priceRange?.max || ''}
              onChange={(e) => handlePriceChange('max', e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </div>
        </div>
      </div>
      
      <button
        onClick={handleReset}
        className="w-full bg-gray-100 text-gray-800 py-2 rounded-md hover:bg-gray-200 transition-colors"
      >
        Reset Filters
      </button>
    </div>
  );
}
