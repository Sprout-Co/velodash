// Test Costs Page
// Simple test page to verify costs are being created and loaded

'use client';

import { useState, useEffect } from 'react';
import { getVehiclesData } from '@/hooks/useVehiclesData';

export default function TestCostsPage() {
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const data = await getVehiclesData();
        setVehicles(data);
        console.log('Vehicles with costs:', data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch vehicles');
        console.error('Error fetching vehicles:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const totalCapitalDeployed = vehicles.reduce((total, vehicle) => {
    const vehicleCosts = Array.isArray(vehicle.costs) 
      ? vehicle.costs.reduce((sum: number, cost: any) => sum + (cost.amount || 0), 0)
      : 0;
    return total + vehicleCosts;
  }, 0);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-gray-600">Loading vehicles and costs...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <h3 className="text-sm font-medium text-red-800 mb-2">Error</h3>
            <p className="text-sm text-red-700">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">
            Vehicle Costs Test
          </h1>
          
          <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h3 className="text-lg font-medium text-blue-800 mb-2">Summary</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{vehicles.length}</div>
                <div className="text-sm text-blue-700">Total Vehicles</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">₦{totalCapitalDeployed.toLocaleString()}</div>
                <div className="text-sm text-blue-700">Total Capital Deployed</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {vehicles.reduce((count, v) => count + (v.costs?.length || 0), 0)}
                </div>
                <div className="text-sm text-blue-700">Total Cost Entries</div>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            {vehicles.map((vehicle) => {
              const vehicleCosts = Array.isArray(vehicle.costs) 
                ? vehicle.costs.reduce((sum: number, cost: any) => sum + (cost.amount || 0), 0)
                : 0;

              return (
                <div key={vehicle.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 className="text-lg font-medium text-gray-900">
                        {vehicle.year} {vehicle.make} {vehicle.model}
                      </h3>
                      <p className="text-sm text-gray-500">VIN: {vehicle.vin}</p>
                      <p className="text-sm text-gray-500">Status: {vehicle.status}</p>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold text-green-600">
                        ₦{vehicleCosts.toLocaleString()}
                      </div>
                      <div className="text-sm text-gray-500">Total Costs</div>
                    </div>
                  </div>
                  
                  <div className="mt-3">
                    <h4 className="text-sm font-medium text-gray-700 mb-2">
                      Cost Entries ({vehicle.costs?.length || 0})
                    </h4>
                    {vehicle.costs && vehicle.costs.length > 0 ? (
                      <div className="space-y-1">
                        {vehicle.costs.map((cost: any, index: number) => (
                          <div key={index} className="flex justify-between items-center text-sm bg-gray-50 px-3 py-2 rounded">
                            <div>
                              <span className="font-medium">{cost.description}</span>
                              <span className="text-gray-500 ml-2">({cost.category})</span>
                            </div>
                            <div className="font-medium">₦{(cost.amount || 0).toLocaleString()}</div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-sm text-gray-500 italic">No cost entries found</div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {vehicles.length === 0 && (
            <div className="text-center py-8">
              <p className="text-gray-500">No vehicles found. Try adding some vehicles first.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
