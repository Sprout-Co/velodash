'use client';

import React, { useState } from 'react';
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

// Sample data - would be replaced with actual API data
const inventoryAgingData = [
  { name: '0-30 days', value: 45, color: '#10B981' },
  { name: '31-60 days', value: 32, color: '#3B82F6' },
  { name: '61-90 days', value: 18, color: '#F59E0B' },
  { name: '90+ days', value: 12, color: '#EF4444' },
];

const vehicleAgingData = [
  { id: 'VIN10234', make: 'Toyota', model: 'Camry', year: 2023, days: 102, price: 28500 },
  { id: 'VIN20571', make: 'Honda', model: 'Civic', year: 2022, days: 95, price: 22800 },
  { id: 'VIN31492', make: 'Ford', model: 'F-150', year: 2023, days: 88, price: 42000 },
  { id: 'VIN42385', make: 'Chevrolet', model: 'Malibu', year: 2022, days: 81, price: 24700 },
  { id: 'VIN53698', make: 'Nissan', model: 'Altima', year: 2023, days: 77, price: 26300 },
  { id: 'VIN65742', make: 'BMW', model: '3 Series', year: 2022, days: 74, price: 48500 },
  { id: 'VIN78159', make: 'Mercedes', model: 'C-Class', year: 2023, days: 70, price: 52000 },
  { id: 'VIN86423', make: 'Audi', model: 'A4', year: 2023, days: 68, price: 46800 },
];

const costByAgingData = [
  { range: '0-30 days', cost: 1562000, vehicles: 45 },
  { range: '31-60 days', cost: 1248000, vehicles: 32 },
  { range: '61-90 days', cost: 864000, vehicles: 18 },
  { range: '90+ days', cost: 576000, vehicles: 12 },
];

const InventoryAgingReport: React.FC = () => {
  const [view, setView] = useState('summary');
  
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
          <div className="text-3xl font-bold">107 Vehicles</div>
          <div className="text-gray-600 mt-1">$4,250,000 total value</div>
        </div>
        
        <div className="stats-card bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-medium mb-2">Average Days in Inventory</h3>
          <div className="text-3xl font-bold">42 Days</div>
          <div className="text-red-600 mt-1">↑ 5 days from previous month</div>
        </div>
        
        <div className="stats-card bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-medium mb-2">Aging Risk</h3>
          <div className="text-3xl font-bold">30 Vehicles</div>
          <div className="text-amber-600 mt-1">28% of inventory over 60 days</div>
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
