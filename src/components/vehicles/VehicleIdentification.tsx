import React from 'react';
import { Vehicle } from '@/types';

interface VehicleIdentificationProps {
  vehicle: Vehicle;
}

export default function VehicleIdentification({ vehicle }: VehicleIdentificationProps) {
  return (
    <div className="bg-white rounded-lg shadow p-6 vehicle-identification">
      <h2 className="text-xl font-semibold text-gray-800 mb-4">Vehicle Identification</h2>
      
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <div className="identification-field">
          <label className="text-sm text-gray-500">VIN</label>
          <p className="font-medium">{vehicle.vin}</p>
        </div>
        
        <div className="identification-field">
          <label className="text-sm text-gray-500">Make</label>
          <p className="font-medium">{vehicle.make}</p>
        </div>
        
        <div className="identification-field">
          <label className="text-sm text-gray-500">Model</label>
          <p className="font-medium">{vehicle.model}</p>
        </div>
        
        <div className="identification-field">
          <label className="text-sm text-gray-500">Year</label>
          <p className="font-medium">{vehicle.year}</p>
        </div>
        
        <div className="identification-field">
          <label className="text-sm text-gray-500">Color</label>
          <p className="font-medium">{vehicle.color}</p>
        </div>
        
        <div className="identification-field">
        </div>
        
        <div className="identification-field">
          <label className="text-sm text-gray-500">Mileage</label>
          <p className="font-medium">{vehicle.mileage.toLocaleString()} km</p>
        </div>
      </div>
    </div>
  );
}
