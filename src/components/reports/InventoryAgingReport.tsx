'use client';

import React, { useState, useMemo } from 'react';
import { 
  PieChart, 
  Pie, 
  Cell, 
  ResponsiveContainer, 
  Tooltip, 
  Legend,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid
} from 'recharts';
import { useInventoryAgingData } from '@/hooks/useReportsData';
import { formatCurrency } from '@/lib/utils';

const InventoryAgingReport: React.FC = () => {
  const [view, setView] = useState('summary');
  const { data: reportData, isLoading, error } = useInventoryAgingData();

  // Transform data for charts
  const inventoryAgingData = useMemo(() => {
    if (!reportData) return [];
    
    const agingRanges = [
      { name: '0-30 days', min: 0, max: 30, color: '#10B981' },
      { name: '31-60 days', min: 31, max: 60, color: '#3B82F6' },
      { name: '61-90 days', min: 61, max: 90, color: '#F59E0B' },
      { name: '90+ days', min: 91, max: Infinity, color: '#EF4444' },
    ];

    return agingRanges.map(range => {
      const count = reportData.vehicles.filter(vehicle => 
        vehicle.daysInInventory >= range.min && vehicle.daysInInventory <= range.max
      ).length;
      
      return {
        name: range.name,
        value: count,
        color: range.color,
      };
    });
  }, [reportData]);

  const vehicleAgingData = useMemo(() => {
    if (!reportData) return [];
    
    return reportData.vehicles
      .sort((a, b) => b.daysInInventory - a.daysInInventory)
      .slice(0, 10) // Show top 10 oldest vehicles
      .map(vehicle => ({
        id: vehicle.vehicleId,
        make: vehicle.vehicleName.split(' ')[1], // Extract make
        model: vehicle.vehicleName.split(' ').slice(2).join(' '), // Extract model
        year: vehicle.vehicleName.split(' ')[0], // Extract year
        days: vehicle.daysInInventory,
        price: vehicle.listingPrice || vehicle.totalCost,
        status: vehicle.status,
      }));
  }, [reportData]);

  const costByAgingData = useMemo(() => {
    if (!reportData) return [];
    
    const agingRanges = [
      { name: '0-30 days', min: 0, max: 30 },
      { name: '31-60 days', min: 31, max: 60 },
      { name: '61-90 days', min: 61, max: 90 },
      { name: '90+ days', min: 91, max: Infinity },
    ];

    return agingRanges.map(range => {
      const vehicles = reportData.vehicles.filter(vehicle => 
        vehicle.daysInInventory >= range.min && vehicle.daysInInventory <= range.max
      );
      
      return {
        range: range.name,
        cost: vehicles.reduce((sum, vehicle) => sum + vehicle.totalCost, 0),
        vehicles: vehicles.length,
      };
    });
  }, [reportData]);

  if (isLoading) {
    return (
      <div className="inventory-aging-report">
        <div className="flex justify-center items-center h-64">
          <div className="loading-spinner"></div>
          <p className="ml-4">Loading inventory aging data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="inventory-aging-report">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <h3 className="text-red-800 font-medium mb-2">Error Loading Data</h3>
          <p className="text-red-600">{error}</p>
        </div>
      </div>
    );
  }

  if (!reportData) {
    return (
      <div className="inventory-aging-report">
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
          <h3 className="text-gray-800 font-medium mb-2">No Data Available</h3>
          <p className="text-gray-600">No inventory data found.</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="inventory-aging-report">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold">Inventory Aging Report</h2>
        <div className="filters flex gap-4">
          <button 
            onClick={() => setView('summary')} 
            className={`btn-filter ${view === 'summary' ? 'active' : ''}`}
          >
            Summary View
          </button>
          <button 
            onClick={() => setView('detail')} 
            className={`btn-filter ${view === 'detail' ? 'active' : ''}`}
          >
            Detailed View
          </button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="stats-card bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-medium mb-2">Total Inventory</h3>
          <div className="text-3xl font-bold">{reportData.summary.totalVehicles} Vehicles</div>
          <div className="text-gray-600 mt-1">
            {formatCurrency(
              reportData.vehicles.reduce((sum, v) => sum + v.totalCost, 0), 
              'NGN'
            )} total value
          </div>
        </div>
        
        <div className="stats-card bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-medium mb-2">Average Days in Inventory</h3>
          <div className="text-3xl font-bold">{reportData.summary.averageAge} Days</div>
          <div className="text-gray-600 mt-1">Current average age</div>
        </div>
        
        <div className="stats-card bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-medium mb-2">Aging Risk</h3>
          <div className="text-3xl font-bold">{reportData.summary.vehiclesOver90Days}</div>
          <div className="text-amber-600 mt-1">
            {reportData.summary.totalVehicles > 0 
              ? ((reportData.summary.vehiclesOver90Days / reportData.summary.totalVehicles) * 100).toFixed(1)
              : 0
            }% of inventory over 90 days
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-medium mb-4">Inventory Aging Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={inventoryAgingData}
                cx="50%"
                cy="50%"
                labelLine={false}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
              >
                {inventoryAgingData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => [`${value} vehicles`, 'Count']} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-medium mb-4">Cost by Aging Category</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart
              data={costByAgingData}
              margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="range" />
              <YAxis />
              <Tooltip formatter={(value) => [`$${value.toLocaleString()}`, 'Inventory Value']} />
              <Legend />
              <Bar dataKey="cost" name="Inventory Value" fill="#3B82F6" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
      
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-medium mb-4">Aging Vehicle Details</h3>
        <div className="overflow-x-auto">
          <table className="w-full table-auto">
            <thead>
              <tr className="text-left bg-gray-50">
                <th className="px-4 py-2">VIN</th>
                <th className="px-4 py-2">Make/Model</th>
                <th className="px-4 py-2">Year</th>
                <th className="px-4 py-2">Days in Inventory</th>
                <th className="px-4 py-2">Price</th>
                <th className="px-4 py-2">Aging Status</th>
              </tr>
            </thead>
            <tbody>
              {vehicleAgingData.map((vehicle, index) => (
                <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                  <td className="px-4 py-3">{vehicle.id}</td>
                  <td className="px-4 py-3">{vehicle.make} {vehicle.model}</td>
                  <td className="px-4 py-3">{vehicle.year}</td>
                  <td className="px-4 py-3">{vehicle.days}</td>
                  <td className="px-4 py-3">${vehicle.price.toLocaleString()}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      vehicle.days <= 30 
                        ? 'bg-green-100 text-green-800'
                        : vehicle.days <= 60
                          ? 'bg-blue-100 text-blue-800'
                          : vehicle.days <= 90
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-red-100 text-red-800'
                    }`}>
                      {vehicle.days <= 30 
                        ? 'Good'
                        : vehicle.days <= 60
                          ? 'Moderate'
                          : vehicle.days <= 90
                            ? 'At Risk'
                            : 'Critical'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="mt-4 text-right">
          <button className="text-blue-600 hover:underline">View All Vehicles</button>
        </div>
      </div>
    </div>
  );
};

export default InventoryAgingReport;
