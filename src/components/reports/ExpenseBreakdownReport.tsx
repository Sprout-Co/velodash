'use client';

import React, { useState, useMemo, useCallback } from 'react';
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
  CartesianGrid,
  LineChart,
  Line
} from 'recharts';
import { useExpenseBreakdownData } from '@/hooks/useReportsData';
import { formatCurrency } from '@/lib/utils';

const ExpenseBreakdownReport: React.FC = () => {
  const [timeframe, setTimeframe] = useState('yearly');
  const [expenseType, setExpenseType] = useState('all');
  
  // Calculate date range based on timeframe - memoized to prevent re-renders
  const { startDate, endDate } = useMemo(() => {
    const endDate = new Date();
    const startDate = new Date();
    
    switch (timeframe) {
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
        startDate.setFullYear(endDate.getFullYear() - 1);
    }
    
    return { startDate, endDate };
  }, [timeframe]);
  const { data: reportData, isLoading, error } = useExpenseBreakdownData(startDate, endDate);

  // Transform data for charts
  const expenseCategoriesData = useMemo(() => {
    if (!reportData) return [];
    
    const colors = ['#3B82F6', '#10B981', '#F59E0B', '#8B5CF6', '#EC4899', '#6B7280'];
    
    return reportData.categories.map((category, index) => ({
      name: category.category,
      value: category.totalAmount,
      color: colors[index % colors.length],
    }));
  }, [reportData]);

  const recentExpensesData = useMemo(() => {
    if (!reportData) return [];
    
    // This would need to be enhanced to get actual recent expenses
    // For now, we'll create a simple representation from categories
    return reportData.categories.slice(0, 5).map(category => ({
      date: new Date().toISOString().split('T')[0],
      category: category.category,
      description: `${category.category} expenses`,
      amount: category.totalAmount / 10, // Simplified representation
    }));
  }, [reportData]);

  if (isLoading) {
    return (
      <div className="expense-breakdown-report">
        <div className="flex justify-center items-center h-64">
          <div className="loading-spinner"></div>
          <p className="ml-4">Loading expense breakdown data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="expense-breakdown-report">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <h3 className="text-red-800 font-medium mb-2">Error Loading Data</h3>
          <p className="text-red-600">{error}</p>
        </div>
      </div>
    );
  }

  if (!reportData) {
    return (
      <div className="expense-breakdown-report">
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
          <h3 className="text-gray-800 font-medium mb-2">No Data Available</h3>
          <p className="text-gray-600">No expense data found for the selected period.</p>
        </div>
      </div>
    );
  }

  // Calculate total expenses
  const totalExpenses = reportData.summary.totalExpenses;
  
  return (
    <div className="expense-breakdown-report">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold">Expense Breakdown Report</h2>
        <div className="filters flex gap-4">
          <select 
            value={timeframe}
            onChange={(e) => setTimeframe(e.target.value)}
            className="select-filter"
          >
            <option value="monthly">Monthly</option>
            <option value="quarterly">Quarterly</option>
            <option value="yearly">Yearly</option>
          </select>
          
          <select 
            value={expenseType}
            onChange={(e) => setExpenseType(e.target.value)}
            className="select-filter"
          >
            <option value="all">All Expenses</option>
            <option value="inventory">Inventory</option>
            <option value="personnel">Personnel</option>
            <option value="facilities">Facilities</option>
            <option value="marketing">Marketing</option>
            <option value="operations">Operations</option>
          </select>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="stats-card bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-medium mb-2">Total Expenses</h3>
          <div className="text-3xl font-bold">{formatCurrency(totalExpenses, 'NGN')}</div>
          <div className="text-gray-600 mt-1">For selected period</div>
        </div>
        
        <div className="stats-card bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-medium mb-2">Average Per Vehicle</h3>
          <div className="text-3xl font-bold">{formatCurrency(reportData.summary.averagePerVehicle, 'NGN')}</div>
          <div className="text-gray-600 mt-1">Per vehicle cost</div>
        </div>
        
        <div className="stats-card bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-medium mb-2">Largest Expense Category</h3>
          <div className="text-3xl font-bold">
            {reportData.categories.length > 0 ? reportData.categories[0].category : 'N/A'}
          </div>
          <div className="text-gray-600 mt-1">
            {reportData.categories.length > 0 ? `${reportData.categories[0].percentage.toFixed(1)}% of total` : 'No data'}
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-medium mb-4">Expense Categories</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={expenseCategoriesData}
                cx="50%"
                cy="50%"
                labelLine={false}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(1)}%`}
              >
                {expenseCategoriesData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => [`$${value.toLocaleString()}`, 'Amount']} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-medium mb-4">Monthly Expenses vs. Revenue</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart
              data={monthlyExpensesData}
              margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip formatter={(value) => [`$${value.toLocaleString()}`, '']} />
              <Legend />
              <Line type="monotone" dataKey="expenses" name="Expenses" stroke="#EF4444" strokeWidth={2} />
              <Line type="monotone" dataKey="revenue" name="Revenue" stroke="#10B981" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
      
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-medium mb-4">Recent Expenses</h3>
        <div className="overflow-x-auto">
          <table className="w-full table-auto">
            <thead>
              <tr className="text-left bg-gray-50">
                <th className="px-4 py-2">Date</th>
                <th className="px-4 py-2">Category</th>
                <th className="px-4 py-2">Description</th>
                <th className="px-4 py-2">Amount</th>
                <th className="px-4 py-2">% of Monthly</th>
              </tr>
            </thead>
            <tbody>
              {recentExpensesData.map((expense, index) => (
                <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                  <td className="px-4 py-3">{expense.date}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      expense.category === 'Inventory' 
                        ? 'bg-blue-100 text-blue-800'
                        : expense.category === 'Personnel'
                          ? 'bg-green-100 text-green-800'
                          : expense.category === 'Facilities'
                            ? 'bg-amber-100 text-amber-800'
                            : expense.category === 'Marketing'
                              ? 'bg-purple-100 text-purple-800'
                              : 'bg-pink-100 text-pink-800'
                    }`}>
                      {expense.category}
                    </span>
                  </td>
                  <td className="px-4 py-3">{expense.description}</td>
                  <td className="px-4 py-3">${expense.amount.toLocaleString()}</td>
                  <td className="px-4 py-3">{(expense.amount / 3160000 * 100).toFixed(1)}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="mt-4 text-right">
          <button className="text-blue-600 hover:underline">View All Expenses</button>
        </div>
      </div>
    </div>
  );
};

export default ExpenseBreakdownReport;
