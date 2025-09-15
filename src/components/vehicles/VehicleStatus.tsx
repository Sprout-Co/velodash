import React, { useState } from 'react';
import { VehicleStatus } from '@/types';
import { ChevronDown, ChevronUp } from 'lucide-react';

interface VehicleStatusProps {
  currentStatus: VehicleStatus;
  onStatusChange: (status: VehicleStatus) => void;
}

export default function VehicleStatus({ currentStatus, onStatusChange }: VehicleStatusProps) {
  const [isOpen, setIsOpen] = useState(false);
  
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
  
  const statusStyles: Record<VehicleStatus, string> = {
    'sourced': 'bg-blue-100 text-blue-800 border-blue-200',
    'in-transit': 'bg-yellow-100 text-yellow-800 border-yellow-200',
    'in-customs': 'bg-purple-100 text-purple-800 border-purple-200',
    'in-workshop': 'bg-orange-100 text-orange-800 border-orange-200',
    'for-sale': 'bg-green-100 text-green-800 border-green-200',
    'sale-pending': 'bg-indigo-100 text-indigo-800 border-indigo-200',
    'sold': 'bg-gray-100 text-gray-800 border-gray-200',
    'archived': 'bg-gray-100 text-gray-500 border-gray-200',
  };
  
  const currentLabel = statusOptions.find(s => s.value === currentStatus)?.label || 'Unknown';
  
  return (
    <div className="relative vehicle-status-dropdown">
      <button
        className={`px-4 py-2 rounded-md border ${statusStyles[currentStatus]} flex items-center justify-between min-w-[180px]`}
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className="font-medium">Status: {currentLabel}</span>
        {isOpen ? <ChevronUp className="h-4 w-4 ml-2" /> : <ChevronDown className="h-4 w-4 ml-2" />}
      </button>
      
      {isOpen && (
        <div className="absolute right-0 mt-1 w-full bg-white border border-gray-200 rounded-md shadow-lg z-10">
          <div className="py-1">
            {statusOptions.map(option => (
              <button
                key={option.value}
                className={`block w-full text-left px-4 py-2 hover:bg-gray-100 ${
                  currentStatus === option.value ? 'bg-gray-50 font-medium' : ''
                }`}
                onClick={() => {
                  onStatusChange(option.value);
                  setIsOpen(false);
                }}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
