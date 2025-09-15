'use client';

import React, { useState } from 'react';
import { 
  LineChart, 
  Line, 
  AreaChart, 
  Area,
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar
} from 'recharts';

// Sample data - would be replaced with actual API data
const salesPerformanceData = [
  { month: 'Jan', sales: 412000, target: 400000 },
  { month: 'Feb', sales: 392000, target: 400000 },
  { month: 'Mar', sales: 435000, target: 420000 },
  { month: 'Apr', sales: 418000, target: 420000 },
  { month: 'May', sales: 405000, target: 420000 },
  { month: 'Jun', sales: 425000, target: 440000 },
  { month: 'Jul', sales: 438000, target: 440000 },
  { month: 'Aug', sales: 442000, target: 440000 },
  { month: 'Sep', sales: 456000, target: 460000 },
];

const inventoryMixData = [
  { name: 'Sedan', value: 35, color: '#3B82F6' },
  { name: 'SUV', value: 40, color: '#10B981' },
  { name: 'Truck', value: 15, color: '#F59E0B' },
  { name: 'Luxury', value: 10, color: '#8B5CF6' },
];

const customerDemographicsData = [
  { age: '18-24', count: 56 },
  { age: '25-34', count: 142 },
  { age: '35-44', count: 168 },
  { age: '45-54', count: 125 },
  { age: '55-64', count: 98 },
  { age: '65+', count: 64 },
];

const marketingEffectivenessData = [
  { channel: 'Online Ads', leads: 320, sales: 48 },
  { channel: 'Social Media', leads: 250, sales: 35 },
  { channel: 'Email', leads: 180, sales: 32 },
  { channel: 'Direct Mail', leads: 120, sales: 22 },
  { channel: 'Events', leads: 90, sales: 28 },
  { channel: 'Referral', leads: 85, sales: 42 },
];

const performanceMetricsData = [
  {
    subject: 'Sales',
    A: 90,
    B: 75,
    fullMark: 100,
  },
  {
    subject: 'Customer Sat',
    A: 85,
    B: 90,
    fullMark: 100,
  },
  {
    subject: 'Inventory',
    A: 70,
    B: 65,
    fullMark: 100,
  },
  {
    subject: 'Efficiency',
    A: 75,
    B: 80,
    fullMark: 100,
  },
  {
    subject: 'Growth',
    A: 80,
    B: 70,
    fullMark: 100,
  },
];

const DashboardChartsReport: React.FC = () => {
  const [chartType, setChartType] = useState('all');
  
  return (
    <div className="dashboard-charts-report">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold">Interactive Dashboard Charts</h2>
        <div className="filters">
          <select 
            value={chartType}
            onChange={(e) => setChartType(e.target.value)}
            className="select-filter"
          >
            <option value="all">All Charts</option>
            <option value="sales">Sales Performance</option>
            <option value="inventory">Inventory Mix</option>
            <option value="customers">Customer Demographics</option>
            <option value="marketing">Marketing Effectiveness</option>
            <option value="performance">Performance Metrics</option>
          </select>
        </div>
      </div>
      
      {(chartType === 'all' || chartType === 'sales') && (
        <div className="bg-white p-6 rounded-lg shadow mb-8">
          <h3 className="text-lg font-medium mb-4">Monthly Sales Performance vs Target</h3>
          <ResponsiveContainer width="100%" height={350}>
            <LineChart
              data={salesPerformanceData}
              margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip formatter={(value) => [`$${value.toLocaleString()}`, '']} />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="sales" 
                name="Actual Sales" 
                stroke="#3B82F6" 
                strokeWidth={2} 
                dot={{ r: 4 }} 
              />
              <Line 
                type="monotone" 
                dataKey="target" 
                name="Sales Target" 
                stroke="#EF4444" 
                strokeWidth={2} 
                strokeDasharray="5 5" 
                dot={{ r: 4 }} 
              />
            </LineChart>
          </ResponsiveContainer>
          <div className="flex justify-end mt-2">
            <button className="text-blue-600 hover:underline text-sm">Download CSV</button>
          </div>
        </div>
      )}
      
      {(chartType === 'all' || chartType === 'inventory') && (
        <div className="bg-white p-6 rounded-lg shadow mb-8">
          <h3 className="text-lg font-medium mb-4">Current Inventory Mix</h3>
          <ResponsiveContainer width="100%" height={350}>
            <PieChart>
              <Pie
                data={inventoryMixData}
                cx="50%"
                cy="50%"
                labelLine={true}
                outerRadius={130}
                fill="#8884d8"
                dataKey="value"
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
              >
                {inventoryMixData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => [`${value}%`, 'Percentage']} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
          <div className="flex justify-end mt-2">
            <button className="text-blue-600 hover:underline text-sm">Download CSV</button>
          </div>
        </div>
      )}
      
      {(chartType === 'all' || chartType === 'customers') && (
        <div className="bg-white p-6 rounded-lg shadow mb-8">
          <h3 className="text-lg font-medium mb-4">Customer Demographics (Age Groups)</h3>
          <ResponsiveContainer width="100%" height={350}>
            <BarChart
              data={customerDemographicsData}
              margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="age" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="count" name="Number of Customers" fill="#8B5CF6" />
            </BarChart>
          </ResponsiveContainer>
          <div className="flex justify-end mt-2">
            <button className="text-blue-600 hover:underline text-sm">Download CSV</button>
          </div>
        </div>
      )}
      
      {(chartType === 'all' || chartType === 'marketing') && (
        <div className="bg-white p-6 rounded-lg shadow mb-8">
          <h3 className="text-lg font-medium mb-4">Marketing Channel Effectiveness</h3>
          <ResponsiveContainer width="100%" height={350}>
            <BarChart
              data={marketingEffectivenessData}
              margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
              layout="vertical"
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" />
              <YAxis dataKey="channel" type="category" width={100} />
              <Tooltip />
              <Legend />
              <Bar dataKey="leads" name="Leads Generated" fill="#3B82F6" stackId="a" />
              <Bar dataKey="sales" name="Resulting Sales" fill="#10B981" stackId="a" />
            </BarChart>
          </ResponsiveContainer>
          <div className="flex justify-end mt-2">
            <button className="text-blue-600 hover:underline text-sm">Download CSV</button>
          </div>
        </div>
      )}
      
      {(chartType === 'all' || chartType === 'performance') && (
        <div className="bg-white p-6 rounded-lg shadow mb-8">
          <h3 className="text-lg font-medium mb-4">Performance Metrics Comparison</h3>
          <ResponsiveContainer width="100%" height={350}>
            <RadarChart cx="50%" cy="50%" outerRadius="80%" data={performanceMetricsData}>
              <PolarGrid />
              <PolarAngleAxis dataKey="subject" />
              <PolarRadiusAxis angle={30} domain={[0, 100]} />
              <Radar name="Current Quarter" dataKey="A" stroke="#8B5CF6" fill="#8B5CF6" fillOpacity={0.6} />
              <Radar name="Previous Quarter" dataKey="B" stroke="#F59E0B" fill="#F59E0B" fillOpacity={0.6} />
              <Legend />
              <Tooltip />
            </RadarChart>
          </ResponsiveContainer>
          <div className="flex justify-end mt-2">
            <button className="text-blue-600 hover:underline text-sm">Download CSV</button>
          </div>
        </div>
      )}
      
      <div className="bg-white p-6 rounded-lg shadow mb-8">
        <h3 className="text-lg font-medium mb-4">Chart Customization</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-medium mb-2">Display Options</h4>
            <div className="space-y-2">
              <div className="flex items-center">
                <input type="checkbox" id="showLegend" className="mr-2" defaultChecked />
                <label htmlFor="showLegend">Show Legend</label>
              </div>
              <div className="flex items-center">
                <input type="checkbox" id="showGridLines" className="mr-2" defaultChecked />
                <label htmlFor="showGridLines">Show Grid Lines</label>
              </div>
              <div className="flex items-center">
                <input type="checkbox" id="showDataLabels" className="mr-2" />
                <label htmlFor="showDataLabels">Show Data Labels</label>
              </div>
              <div className="flex items-center">
                <input type="checkbox" id="animateCharts" className="mr-2" defaultChecked />
                <label htmlFor="animateCharts">Animate Charts</label>
              </div>
            </div>
          </div>
          <div>
            <h4 className="font-medium mb-2">Export Options</h4>
            <div className="space-y-2">
              <button className="w-full bg-gray-100 hover:bg-gray-200 py-2 px-4 rounded">
                Export as PNG
              </button>
              <button className="w-full bg-gray-100 hover:bg-gray-200 py-2 px-4 rounded">
                Export as PDF
              </button>
              <button className="w-full bg-gray-100 hover:bg-gray-200 py-2 px-4 rounded">
                Export Data as CSV
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardChartsReport;
