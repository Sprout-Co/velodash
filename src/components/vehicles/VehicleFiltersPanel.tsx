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
    <div className="vehicle-filters">
      <h2>Filters</h2>
      
      <form onSubmit={handleSearchSubmit}>
        <div className="search-input-container">
          <input
            type="text"
            placeholder="Search VIN, Make, Model..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <Search className="search-icon" />
        </div>
        <button type="submit" className="sr-only">Search</button>
      </form>
      
      <div className="filter-section">
        <h3>Status</h3>
        <div className="filter-options">
          {statusOptions.map(option => (
            <label key={option.value}>
              <input
                type="checkbox"
                checked={filters.status?.includes(option.value) || false}
                onChange={() => handleStatusChange(option.value)}
              />
              <span>{option.label}</span>
            </label>
          ))}
        </div>
      </div>
      
      <div className="filter-section">
        <h3>Make</h3>
        <div className="filter-options make-options">
          {availableMakes.map(make => (
            <label key={make}>
              <input
                type="checkbox"
                checked={filters.make?.includes(make) || false}
                onChange={() => handleMakeChange(make)}
              />
              <span>{make}</span>
            </label>
          ))}
        </div>
      </div>
      
      <div className="filter-section">
        <h3>Year</h3>
        <div className="range-inputs">
          <div>
            <label>Min</label>
            <input
              type="number"
              placeholder="Min"
              value={filters.year?.min || ''}
              onChange={(e) => handleYearChange('min', e.target.value)}
            />
          </div>
          <div>
            <label>Max</label>
            <input
              type="number"
              placeholder="Max"
              value={filters.year?.max || ''}
              onChange={(e) => handleYearChange('max', e.target.value)}
            />
          </div>
        </div>
      </div>
      
      <div className="filter-section">
        <h3>Purchase Price</h3>
        <div className="range-inputs">
          <div>
            <label>Min</label>
            <input
              type="number"
              placeholder="Min"
              value={filters.priceRange?.min || ''}
              onChange={(e) => handlePriceChange('min', e.target.value)}
            />
          </div>
          <div>
            <label>Max</label>
            <input
              type="number"
              placeholder="Max"
              value={filters.priceRange?.max || ''}
              onChange={(e) => handlePriceChange('max', e.target.value)}
            />
          </div>
        </div>
      </div>
      
      <button onClick={handleReset} className="reset-button">
        Reset Filters
      </button>
    </div>
  );
}
