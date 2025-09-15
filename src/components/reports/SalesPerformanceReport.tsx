'use client';

import React, { useState } from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  LineChart,
  Line
} from 'recharts';

// Sample data - would be replaced with actual API data
const monthlySalesData = [
  { month: 'Jan', new: 65, used: 42, total: 107 },
  { month: 'Feb', new: 59, used: 38, total: 97 },
  { month: 'Mar', new: 80, used: 56, total: 136 },
  { month: 'Apr', new: 81, used: 40, total: 121 },
  { month: 'May', new: 56, used: 38, total: 94 },
  { month: 'Jun', new: 55, used: 45, total: 100 },
  { month: 'Jul', new: 72, used: 53, total: 125 },
  { month: 'Aug', new: 69, used: 49, total: 118 },
  { month: 'Sep', new: 88, used: 57, total: 145 },
  { month: 'Oct', new: 74, used: 62, total: 136 },
  { month: 'Nov', new: 71, used: 58, total: 129 },
  { month: 'Dec', new: 90, used: 74, total: 164 }
];

const salesByRepData = [
  { name: 'Alex Smith', sales: 427000, target: 450000, units: 32 },
  { name: 'Jordan Lee', sales: 521000, target: 500000, units: 41 },
  { name: 'Casey Jones', sales: 398000, target: 400000, units: 29 },
  { name: 'Taylor Kim', sales: 603000, target: 550000, units: 47 },
  { name: 'Morgan Chen', sales: 489000, target: 475000, units: 36 },
  { name: 'Riley Patel', sales: 562000, target: 525000, units: 43 }
];

const SalesPerformanceReport: React.FC = () => {
  const [timeframe, setTimeframe] = useState('monthly');
  const [vehicleType, setVehicleType] = useState('all');
  
  return (
    <div className="sales-performance-report">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold">Sales Performance Report</h2>
        <div className="filters flex gap-4">
          <select 
            value={timeframe}
            onChange={(e) => setTimeframe(e.target.value)}
            className="select-filter"
          >
            <option value="daily">Daily</option>
            <option value="weekly">Weekly</option>
            <option value="monthly">Monthly</option>
            <option value="quarterly">Quarterly</option>
            <option value="yearly">Yearly</option>
          </select>
          
          <select 
            value={vehicleType}
            onChange={(e) => setVehicleType(e.target.value)}
            className="select-filter"
          >
            <option value="all">All Vehicles</option>
            <option value="new">New Vehicles</option>
            <option value="used">Used Vehicles</option>
          </select>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="stats-card bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-medium mb-2">Total Sales</h3>
          <div className="text-3xl font-bold">$2,461,000</div>
          <div className="text-green-600 mt-1">↑ 12% from previous period</div>
        </div>
        
        <div className="stats-card bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-medium mb-2">Units Sold</h3>
          <div className="text-3xl font-bold">182</div>
          <div className="text-green-600 mt-1">↑ 8% from previous period</div>
        </div>
      </div>
      
      <div className="bg-white p-6 rounded-lg shadow mb-8">
        <h3 className="text-lg font-medium mb-4">Monthly Sales Trend</h3>
        <ResponsiveContainer width="100%" height={350}>
          <BarChart
            data={monthlySalesData}
            margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="new" name="New Vehicles" fill="#3B82F6" />
            <Bar dataKey="used" name="Used Vehicles" fill="#10B981" />
          </BarChart>
        </ResponsiveContainer>
      </div>
      
      <div className="bg-white p-6 rounded-lg shadow mb-8">
        <h3 className="text-lg font-medium mb-4">Sales by Representative</h3>
        <div className="overflow-x-auto">
          <table className="w-full table-auto">
            <thead>
              <tr className="text-left bg-gray-50">
                <th className="px-4 py-2">Name</th>
                <th className="px-4 py-2">Sales Amount</th>
                <th className="px-4 py-2">Target</th>
                <th className="px-4 py-2">Units Sold</th>
                <th className="px-4 py-2">Performance</th>
              </tr>
            </thead>
            <tbody>
              {salesByRepData.map((rep, index) => (
                <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                  <td className="px-4 py-3">{rep.name}</td>
                  <td className="px-4 py-3">${rep.sales.toLocaleString()}</td>
                  <td className="px-4 py-3">${rep.target.toLocaleString()}</td>
                  <td className="px-4 py-3">{rep.units}</td>
                  <td className="px-4 py-3">
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                      <div 
                        className={`h-2.5 rounded-full ${rep.sales >= rep.target ? 'bg-green-600' : 'bg-blue-600'}`}
                        style={{ width: `${Math.min(100, (rep.sales / rep.target) * 100)}%` }}
                      ></div>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-medium mb-4">Conversion Funnel</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-center">
          <div className="funnel-step p-4 bg-blue-50 rounded-lg">
            <div className="text-2xl font-bold mb-1">845</div>
            <div className="text-gray-600">Leads</div>
          </div>
          <div className="funnel-step p-4 bg-blue-100 rounded-lg">
            <div className="text-2xl font-bold mb-1">412</div>
            <div className="text-gray-600">Test Drives</div>
          </div>
          <div className="funnel-step p-4 bg-blue-200 rounded-lg">
            <div className="text-2xl font-bold mb-1">256</div>
            <div className="text-gray-600">Negotiations</div>
          </div>
          <div className="funnel-step p-4 bg-blue-300 rounded-lg">
            <div className="text-2xl font-bold mb-1">182</div>
            <div className="text-gray-600">Sales</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SalesPerformanceReport;
