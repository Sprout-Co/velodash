'use client';

import { useState, useEffect, useRef } from 'react';
import { reportService } from '@/lib/firestore';
import { 
  SalesPerformanceReport, 
  InventoryAgingReport, 
  ExpenseBreakdownReport 
} from '@/types';

// Sales Performance Hook
export function useSalesPerformanceData(startDate: Date, endDate: Date) {
  const [data, setData] = useState<SalesPerformanceReport | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const isFetchingRef = useRef(false);

  useEffect(() => {
    // Prevent multiple simultaneous fetches
    if (isFetchingRef.current) return;
    
    const fetchData = async () => {
      try {
        isFetchingRef.current = true;
        setIsLoading(true);
        setError(null);
        
        // Add minimum loading time to prevent flickering
        const [reportData] = await Promise.all([
          reportService.getSalesPerformanceReport(startDate, endDate),
          new Promise(resolve => setTimeout(resolve, 300)) // Minimum 300ms loading
        ]);
        
        setData(reportData);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch sales performance data');
        console.error('Sales performance data fetch error:', err);
      } finally {
        setIsLoading(false);
        isFetchingRef.current = false;
      }
    };

    fetchData();
  }, [startDate, endDate]);

  return { data, isLoading, error };
}

// Inventory Aging Hook
export function useInventoryAgingData() {
  const [data, setData] = useState<InventoryAgingReport | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const isFetchingRef = useRef(false);

  useEffect(() => {
    // Prevent multiple simultaneous fetches
    if (isFetchingRef.current) return;
    
    const fetchData = async () => {
      try {
        isFetchingRef.current = true;
        setIsLoading(true);
        setError(null);
        
        // Add minimum loading time to prevent flickering
        const [reportData] = await Promise.all([
          reportService.getInventoryAgingReport(),
          new Promise(resolve => setTimeout(resolve, 300)) // Minimum 300ms loading
        ]);
        
        setData(reportData);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch inventory aging data');
        console.error('Inventory aging data fetch error:', err);
      } finally {
        setIsLoading(false);
        isFetchingRef.current = false;
      }
    };

    fetchData();
  }, []);

  return { data, isLoading, error };
}

// Expense Breakdown Hook
export function useExpenseBreakdownData(startDate: Date, endDate: Date) {
  const [data, setData] = useState<ExpenseBreakdownReport | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const isFetchingRef = useRef(false);

  useEffect(() => {
    // Prevent multiple simultaneous fetches
    if (isFetchingRef.current) return;
    
    const fetchData = async () => {
      try {
        isFetchingRef.current = true;
        setIsLoading(true);
        setError(null);
        
        // Add minimum loading time to prevent flickering
        const [reportData] = await Promise.all([
          reportService.getExpenseBreakdownReport(startDate, endDate),
          new Promise(resolve => setTimeout(resolve, 300)) // Minimum 300ms loading
        ]);
        
        setData(reportData);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch expense breakdown data');
        console.error('Expense breakdown data fetch error:', err);
      } finally {
        setIsLoading(false);
        isFetchingRef.current = false;
      }
    };

    fetchData();
  }, [startDate, endDate]);

  return { data, isLoading, error };
}

// Dashboard Charts Hook (combines multiple data sources)
export function useDashboardChartsData() {
  const [salesData, setSalesData] = useState<any[]>([]);
  const [inventoryData, setInventoryData] = useState<any[]>([]);
  const [expenseData, setExpenseData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const isFetchingRef = useRef(false);

  useEffect(() => {
    // Prevent multiple simultaneous fetches
    if (isFetchingRef.current) return;
    
    const fetchData = async () => {
      try {
        isFetchingRef.current = true;
        setIsLoading(true);
        setError(null);

        // Get data for the last 12 months
        const endDate = new Date();
        const startDate = new Date();
        startDate.setMonth(startDate.getMonth() - 12);

        const [salesReport, inventoryReport, expenseReport] = await Promise.all([
          reportService.getSalesPerformanceReport(startDate, endDate),
          reportService.getInventoryAgingReport(),
          reportService.getExpenseBreakdownReport(startDate, endDate),
        ]);

        // Transform sales data for charts
        const monthlySales = generateMonthlySalesData(salesReport);
        setSalesData(monthlySales);

        // Transform inventory data for charts
        const inventoryMix = generateInventoryMixData(inventoryReport);
        setInventoryData(inventoryMix);

        // Transform expense data for charts
        const monthlyExpenses = generateMonthlyExpenseData(expenseReport);
        setExpenseData(monthlyExpenses);

      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch dashboard charts data');
        console.error('Dashboard charts data fetch error:', err);
      } finally {
        setIsLoading(false);
        isFetchingRef.current = false;
      }
    };

    fetchData();
  }, []);

  return { salesData, inventoryData, expenseData, isLoading, error };
}

// Helper functions to transform data for charts
function generateMonthlySalesData(salesReport: SalesPerformanceReport) {
  const monthlyData: { [key: string]: { sales: number; target: number } } = {};
  
  salesReport.vehicles.forEach(vehicle => {
    const month = vehicle.saleDate.toISOString().substring(0, 7); // YYYY-MM
    if (!monthlyData[month]) {
      monthlyData[month] = { sales: 0, target: 0 };
    }
    monthlyData[month].sales += vehicle.salePrice;
    // For now, we'll set a simple target (could be enhanced with actual targets)
    monthlyData[month].target = monthlyData[month].sales * 1.1; // 10% above actual
  });

  return Object.entries(monthlyData)
    .map(([month, data]) => ({
      month: month.substring(5), // Just the month part
      sales: data.sales,
      target: data.target,
    }))
    .sort((a, b) => a.month.localeCompare(b.month));
}

function generateInventoryMixData(inventoryReport: InventoryAgingReport) {
  const makeCounts: { [key: string]: number } = {};
  
  inventoryReport.vehicles.forEach(vehicle => {
    const make = vehicle.vehicleName.split(' ')[1]; // Extract make from "Year Make Model"
    makeCounts[make] = (makeCounts[make] || 0) + 1;
  });

  const colors = ['#3B82F6', '#10B981', '#F59E0B', '#8B5CF6', '#EC4899', '#6B7280'];
  
  return Object.entries(makeCounts)
    .map(([make, count], index) => ({
      name: make,
      value: count,
      color: colors[index % colors.length],
    }));
}

function generateMonthlyExpenseData(expenseReport: ExpenseBreakdownReport) {
  // This would need to be enhanced to get actual monthly data
  // For now, we'll create a simple representation
  return expenseReport.categories.map(category => ({
    month: 'Current',
    expenses: category.totalAmount,
    category: category.category,
  }));
}
