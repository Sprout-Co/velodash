import React, { useState } from 'react';
import { Vehicle, VehicleStatus } from '@/types';
import { formatCurrency } from '@/lib/utils';

type ExtendedVehicle = Vehicle & { totalCost: number, daysInInventory: number };

interface VehicleTableProps {
  vehicles: ExtendedVehicle[];
  onRowClick: (vehicle: Vehicle) => void;
}

interface SortConfig {
  key: keyof ExtendedVehicle;
  direction: 'asc' | 'desc';
}

const StatusBadge = ({ status }: { status: VehicleStatus }) => {
  const statusStyles: Record<VehicleStatus, string> = {
    'sourced': 'bg-blue-100 text-blue-800',
    'in-transit': 'bg-yellow-100 text-yellow-800',
    'in-customs': 'bg-purple-100 text-purple-800',
    'in-workshop': 'bg-orange-100 text-orange-800',
    'for-sale': 'bg-green-100 text-green-800',
    'sale-pending': 'bg-indigo-100 text-indigo-800',
    'sold': 'bg-gray-100 text-gray-800',
    'archived': 'bg-gray-100 text-gray-500',
  };
  
  const displayText: Record<VehicleStatus, string> = {
    'sourced': 'Sourced',
    'in-transit': 'In Transit',
    'in-customs': 'In Customs',
    'in-workshop': 'In Workshop',
    'for-sale': 'For Sale',
    'sale-pending': 'Sale Pending',
    'sold': 'Sold',
    'archived': 'Archived',
  };

  return (
    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${statusStyles[status]}`}>
      {displayText[status]}
    </span>
  );
};

export default function VehicleTable({ vehicles, onRowClick }: VehicleTableProps) {
  const [sortConfig, setSortConfig] = useState<SortConfig>({ 
    key: 'daysInInventory', 
    direction: 'desc' 
  });

  const handleSort = (key: SortConfig['key']) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  const sortedVehicles = [...vehicles].sort((a, b) => {
    const key = sortConfig.key;
    
    // Handle nested properties and custom properties
    let valueA: any, valueB: any;
    
    if (key === 'totalCost') {
      valueA = a.totalCost;
      valueB = b.totalCost;
    } else if (key === 'daysInInventory') {
      valueA = a.daysInInventory;
      valueB = b.daysInInventory;
    } else {
      // Handle nested properties
      valueA = key.includes('.') 
        ? key.split('.').reduce((obj: any, path: string) => obj?.[path], a)
        : a[key];
        
      valueB = key.includes('.') 
        ? key.split('.').reduce((obj: any, path: string) => obj?.[path], b)
        : b[key];
    }
    
    // Handle the sorting direction
    if (valueA < valueB) {
      return sortConfig.direction === 'asc' ? -1 : 1;
    }
    if (valueA > valueB) {
      return sortConfig.direction === 'asc' ? 1 : -1;
    }
    return 0;
  });

  const getSortIcon = (key: SortConfig['key']) => {
    if (sortConfig.key !== key) return null;
    return sortConfig.direction === 'asc' ? '↑' : '↓';
  };

  return (
    <div className="table-container">
      <table className="vehicles-table">
        <thead>
          <tr>
            <th 
              scope="col" 
              onClick={() => handleSort('vin')}
            >
              VIN {getSortIcon('vin')}
            </th>
            <th 
              scope="col" 
              onClick={() => handleSort('make')}
            >
              Make/Model {getSortIcon('make')}
            </th>
            <th 
              scope="col" 
              onClick={() => handleSort('status')}
            >
              Status {getSortIcon('status')}
            </th>
            <th 
              scope="col" 
              onClick={() => handleSort('daysInInventory')}
            >
              Days in Inventory {getSortIcon('daysInInventory')}
            </th>
            <th 
              scope="col" 
              onClick={() => handleSort('totalCost')}
            >
              Total Cost {getSortIcon('totalCost')}
            </th>
          </tr>
        </thead>
        <tbody>
          {sortedVehicles.length > 0 ? (
            sortedVehicles.map(vehicle => (
              <tr 
                key={vehicle.id} 
                onClick={() => onRowClick(vehicle)}
              >
                <td className="vin-cell">
                  {vehicle.vin}
                </td>
                <td className="vehicle-info">
                  {vehicle.year} {vehicle.make} {vehicle.model}
                </td>
                <td className="status-cell">
                  <StatusBadge status={vehicle.status} />
                </td>
                <td className="days-cell">
                  {vehicle.daysInInventory}
                </td>
                <td className="cost-cell">
                  {formatCurrency(vehicle.totalCost, 'NGN')}
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={5} className="no-data">
                No vehicles found
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
