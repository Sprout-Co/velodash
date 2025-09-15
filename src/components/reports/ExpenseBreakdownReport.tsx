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
  CartesianGrid,
  LineChart,
  Line
} from 'recharts';

// Sample data - would be replaced with actual API data
const expenseCategoriesData = [
  { name: 'Inventory', value: 1850000, color: '#3B82F6' },
  { name: 'Personnel', value: 680000, color: '#10B981' },
  { name: 'Facilities', value: 320000, color: '#F59E0B' },
  { name: 'Marketing', value: 240000, color: '#8B5CF6' },
  { name: 'Operations', value: 210000, color: '#EC4899' },
  { name: 'Other', value: 150000, color: '#6B7280' },
];

const monthlyExpensesData = [
  { month: 'Jan', expenses: 278000, revenue: 412000 },
  { month: 'Feb', expenses: 286000, revenue: 392000 },
  { month: 'Mar', expenses: 302000, revenue: 435000 },
  { month: 'Apr', expenses: 290000, revenue: 418000 },
  { month: 'May', expenses: 295000, revenue: 405000 },
  { month: 'Jun', expenses: 285000, revenue: 425000 },
  { month: 'Jul', expenses: 293000, revenue: 438000 },
  { month: 'Aug', expenses: 305000, revenue: 442000 },
  { month: 'Sep', expenses: 316000, revenue: 456000 },
  { month: 'Oct', expenses: 300000, revenue: 463000 },
  { month: 'Nov', expenses: 310000, revenue: 472000 },
  { month: 'Dec', expenses: 320000, revenue: 486000 },
];

const recentExpensesData = [
  { date: '2025-09-12', category: 'Inventory', description: 'Vehicle Acquisition', amount: 42500 },
  { date: '2025-09-10', category: 'Marketing', description: 'Digital Advertising', amount: 8500 },
  { date: '2025-09-08', category: 'Personnel', description: 'Payroll', amount: 58000 },
  { date: '2025-09-05', category: 'Facilities', description: 'Rent', amount: 22000 },
  { date: '2025-09-03', category: 'Operations', description: 'Software Subscriptions', amount: 4800 },
  { date: '2025-09-01', category: 'Inventory', description: 'Vehicle Maintenance', amount: 12500 },
  { date: '2025-08-29', category: 'Marketing', description: 'Event Sponsorship', amount: 15000 },
];

const ExpenseBreakdownReport: React.FC = () => {
  const [timeframe, setTimeframe] = useState('yearly');
  const [expenseType, setExpenseType] = useState('all');
  
  // Calculate total expenses
  const totalExpenses = expenseCategoriesData.reduce((sum, item) => sum + item.value, 0);
  
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
          <div className="text-3xl font-bold">${totalExpenses.toLocaleString()}</div>
          <div className="text-red-600 mt-1">↑ 5% from previous year</div>
        </div>
        
        <div className="stats-card bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-medium mb-2">Expense to Revenue Ratio</h3>
          <div className="text-3xl font-bold">73.2%</div>
          <div className="text-green-600 mt-1">↓ 2.1% from previous year</div>
        </div>
        
        <div className="stats-card bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-medium mb-2">Largest Expense Category</h3>
          <div className="text-3xl font-bold">Inventory</div>
          <div className="text-gray-600 mt-1">53.7% of total expenses</div>
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
