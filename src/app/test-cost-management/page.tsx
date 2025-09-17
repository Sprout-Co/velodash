'use client';

import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import VehicleCostManagement from '@/components/vehicles/VehicleCostManagement';
import { vehicleService } from '@/lib/firestore';
import { Vehicle } from '@/types';

export default function TestCostManagementPage() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [selectedVehicleId, setSelectedVehicleId] = useState<string>('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadVehicles = async () => {
      try {
        setLoading(true);
        const response = await vehicleService.getVehicles();
        setVehicles(response.data);
        
        // Select first vehicle if available
        if (response.data.length > 0) {
          setSelectedVehicleId(response.data[0].id);
        }
      } catch (error) {
        console.error('Error loading vehicles:', error);
      } finally {
        setLoading(false);
      }
    };

    loadVehicles();
  }, []);

  const selectedVehicle = vehicles.find(v => v.id === selectedVehicleId);

  if (loading) {
    return (
      <DashboardLayout>
        <div style={{ padding: '20px' }}>
          <h1>Loading vehicles...</h1>
        </div>
      </DashboardLayout>
    );
  }

  if (vehicles.length === 0) {
    return (
      <DashboardLayout>
        <div style={{ padding: '20px' }}>
          <h1>No vehicles found</h1>
          <p>Please add some vehicles first to test cost management.</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div style={{ padding: '20px' }}>
        <h1>Test Cost Management</h1>
        
        <div style={{ marginBottom: '20px' }}>
          <label htmlFor="vehicle-select" style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>
            Select Vehicle:
          </label>
          <select
            id="vehicle-select"
            value={selectedVehicleId}
            onChange={(e) => setSelectedVehicleId(e.target.value)}
            style={{
              padding: '8px 12px',
              border: '1px solid #d1d5db',
              borderRadius: '6px',
              fontSize: '14px',
              minWidth: '300px'
            }}
          >
            {vehicles.map(vehicle => (
              <option key={vehicle.id} value={vehicle.id}>
                {vehicle.year} {vehicle.make} {vehicle.model} - {vehicle.vin}
              </option>
            ))}
          </select>
        </div>

        {selectedVehicle && (
          <div style={{ marginBottom: '20px', padding: '16px', backgroundColor: '#f9fafb', borderRadius: '8px' }}>
            <h3>Selected Vehicle Details</h3>
            <p><strong>VIN:</strong> {selectedVehicle.vin}</p>
            <p><strong>Status:</strong> {selectedVehicle.status}</p>
            <p><strong>Purchase Price:</strong> {selectedVehicle.acquisitionDetails.purchasePrice} {selectedVehicle.acquisitionDetails.currency}</p>
          </div>
        )}

        {selectedVehicleId && (
          <VehicleCostManagement
            vehicleId={selectedVehicleId}
            vehicleName={selectedVehicle ? `${selectedVehicle.year} ${selectedVehicle.make} ${selectedVehicle.model}` : 'Unknown Vehicle'}
            onCostsUpdate={(costs) => {
              console.log('Costs updated:', costs);
              // Update the vehicle in the list with new costs
              setVehicles(prev => prev.map(v => 
                v.id === selectedVehicleId ? { ...v, costs } : v
              ));
            }}
          />
        )}
      </div>
    </DashboardLayout>
  );
}

