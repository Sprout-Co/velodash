'use client';

import React, { useState, useMemo, useCallback } from 'react';
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
import { useSalesPerformanceData } from '@/hooks/useReportsData';
import { formatCurrency } from '@/lib/utils';

const SalesPerformanceReport: React.FC = () => {
  const [timeframe, setTimeframe] = useState('monthly');
  const [vehicleType, setVehicleType] = useState('all');
  
  // Calculate date range based on timeframe - memoized to prevent re-renders
  const { startDate, endDate } = useMemo(() => {
    const endDate = new Date();
    const startDate = new Date();
    
    switch (timeframe) {
      case 'daily':
        startDate.setDate(endDate.getDate() - 1);
        break;
      case 'weekly':
        startDate.setDate(endDate.getDate() - 7);
        break;
      case 'monthly':
        startDate.setMonth(endDate.getMonth() - 1);
        break;
      case 'quarterly':
        startDate.setMonth(endDate.getMonth() - 3);
        break;
      case 'yearly':
        startDate.setFullYear(endDate.getFullYear() - 1);
        break;
      default:
        startDate.setMonth(endDate.getMonth() - 1);
    }
    
    return { startDate, endDate };
  }, [timeframe]);
  const { data: reportData, isLoading, error } = useSalesPerformanceData(startDate, endDate);

  // Transform data for charts
  const monthlySalesData = useMemo(() => {
    if (!reportData) return [];
    
    const monthlyData: { [key: string]: { new: number; used: number; total: number } } = {};
    
    reportData.vehicles.forEach(vehicle => {
      const month = vehicle.saleDate.toLocaleDateString('en-US', { month: 'short' });
      if (!monthlyData[month]) {
        monthlyData[month] = { new: 0, used: 0, total: 0 };
      }
      
      // Use actual sale price instead of counting vehicles
      const saleAmount = vehicle.salePrice || 0;
      
      // For now, we'll categorize as "used" since we don't have that data
      // In a real app, this would come from vehicle data
      monthlyData[month].used += saleAmount;
      monthlyData[month].total += saleAmount;
    });

    return Object.entries(monthlyData)
      .map(([month, data]) => ({ month, ...data }))
      .sort((a, b) => {
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        return months.indexOf(a.month) - months.indexOf(b.month);
      });
  }, [reportData]);

  const salesByRepData = useMemo(() => {
    if (!reportData) return [];
    
    // Group by sales rep (for now, we'll use a placeholder since we don't have sales rep data)
    return [
      { name: 'Sales Team', sales: reportData.summary.totalRevenue, target: reportData.summary.totalRevenue * 1.1, units: reportData.vehicles.length }
    ];
  }, [reportData]);

  if (isLoading) {
    return (
      <div className="sales-performance-report">
        <div className="flex justify-center items-center h-64">
          <div className="loading-spinner"></div>
          <p className="ml-4">Loading sales performance data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="sales-performance-report">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <h3 className="text-red-800 font-medium mb-2">Error Loading Data</h3>
          <p className="text-red-600">{error}</p>
        </div>
      </div>
    );
  }

  if (!reportData) {
    return (
      <div className="sales-performance-report">
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
          <h3 className="text-gray-800 font-medium mb-2">No Data Available</h3>
          <p className="text-gray-600">No sales data found for the selected period.</p>
        </div>
      </div>
    );
  }
  
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
          <div className="text-3xl font-bold">{formatCurrency(reportData.summary.totalRevenue, 'NGN')}</div>
          <div className="text-green-600 mt-1">Average ROI: {reportData.summary.averageROI.toFixed(1)}%</div>
        </div>
        
        <div className="stats-card bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-medium mb-2">Units Sold</h3>
          <div className="text-3xl font-bold">{reportData.vehicles.length}</div>
          <div className="text-green-600 mt-1">Average Margin: {reportData.summary.averageProfitMargin.toFixed(1)}%</div>
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
            <YAxis tickFormatter={(value) => formatCurrency(Number(value), 'NGN')} />
            <Tooltip formatter={(value) => [formatCurrency(Number(value), 'NGN'), '']} />
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
                  <td className="px-4 py-3">{formatCurrency(rep.sales, 'NGN')}</td>
                  <td className="px-4 py-3">{formatCurrency(rep.target, 'NGN')}</td>
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
        <h3 className="text-lg font-medium mb-4">Sales Summary</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
          <div className="funnel-step p-4 bg-blue-50 rounded-lg">
            <div className="text-2xl font-bold mb-1">{formatCurrency(reportData.summary.totalRevenue, 'NGN')}</div>
            <div className="text-gray-600">Total Revenue</div>
          </div>
          <div className="funnel-step p-4 bg-amber-50 rounded-lg">
            <div className="text-2xl font-bold mb-1">{formatCurrency(reportData.summary.totalCostOfGoodsSold, 'NGN')}</div>
            <div className="text-gray-600">Cost of Goods</div>
          </div>
          <div className="funnel-step p-4 bg-purple-50 rounded-lg">
            <div className="text-2xl font-bold mb-1">{reportData.vehicles.length}</div>
            <div className="text-gray-600">Vehicles Sold</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SalesPerformanceReport;
