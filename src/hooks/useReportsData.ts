'use client';

import { useState, useEffect } from 'react';
import { 
  SalesPerformanceReport, 
  InventoryAgingReport, 
  ExpenseBreakdownReport,
  Vehicle,
  CostEntry,
  CostCategory
} from '@/types';
import { getVehiclesData } from './useVehiclesData';

interface DateRange {
  start: Date;
  end: Date;
}

interface ProfitabilityData {
  vehicles: Array<{
    vehicleId: string;
    vehicleName: string;
    totalCost: number;
    salePrice?: number;
    profit?: number;
    profitMargin?: number;
    roi?: number;
    status: string;
  }>;
  summary: {
    totalVehicles: number;
    totalCost: number;
    totalRevenue: number;
    totalProfit: number;
    averageProfitMargin: number;
    averageROI: number;
  };
}

export function useReportsData(dateRange: DateRange) {
  const [salesData, setSalesData] = useState<SalesPerformanceReport | null>(null);
  const [inventoryData, setInventoryData] = useState<InventoryAgingReport | null>(null);
  const [expenseData, setExpenseData] = useState<ExpenseBreakdownReport | null>(null);
  const [profitabilityData, setProfitabilityData] = useState<ProfitabilityData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchReportsData = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const vehicles = await getVehiclesData();
        
        // Process sales performance data
        const salesReport = generateSalesPerformanceReport(vehicles, dateRange);
        setSalesData(salesReport);

        // Process inventory aging data
        const inventoryReport = generateInventoryAgingReport(vehicles, dateRange);
        setInventoryData(inventoryReport);

        // Process expense breakdown data
        const expenseReport = generateExpenseBreakdownReport(vehicles, dateRange);
        setExpenseData(expenseReport);

        // Process profitability data
        const profitabilityReport = generateProfitabilityData(vehicles, dateRange);
        setProfitabilityData(profitabilityReport);

      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch reports data');
        console.error('Error fetching reports data:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchReportsData();
  }, [dateRange]);

  return {
    salesData,
    inventoryData,
    expenseData,
    profitabilityData,
    isLoading,
    error
  };
}

function generateSalesPerformanceReport(vehicles: Vehicle[], dateRange: DateRange): SalesPerformanceReport {
  const soldVehicles = vehicles.filter(vehicle => 
    vehicle.saleDetails && 
    vehicle.saleDetails.saleDate &&
    new Date(vehicle.saleDetails.saleDate) >= dateRange.start &&
    new Date(vehicle.saleDetails.saleDate) <= dateRange.end
  );

  const salesVehicles = soldVehicles.map(vehicle => {
    const totalCost = vehicle.costs.reduce((sum, cost) => sum + cost.amount, 0);
    const salePrice = vehicle.saleDetails?.finalSalePrice || 0;
    const profit = salePrice - totalCost;
    const profitMargin = salePrice > 0 ? (profit / salePrice) * 100 : 0;
    const roi = totalCost > 0 ? (profit / totalCost) * 100 : 0;

    return {
      vehicleId: vehicle.id,
      vehicleName: `${vehicle.year} ${vehicle.make} ${vehicle.model}`,
      totalCost,
      salePrice,
      profitMargin,
      roi,
      saleDate: vehicle.saleDetails?.saleDate || new Date()
    };
  });

  const totalRevenue = salesVehicles.reduce((sum, vehicle) => sum + vehicle.salePrice, 0);
  const totalCostOfGoodsSold = salesVehicles.reduce((sum, vehicle) => sum + vehicle.totalCost, 0);
  const averageProfitMargin = salesVehicles.length > 0 
    ? salesVehicles.reduce((sum, vehicle) => sum + vehicle.profitMargin, 0) / salesVehicles.length 
    : 0;
  const averageROI = salesVehicles.length > 0 
    ? salesVehicles.reduce((sum, vehicle) => sum + vehicle.roi, 0) / salesVehicles.length 
    : 0;

  return {
    period: {
      start: dateRange.start,
      end: dateRange.end
    },
    vehicles: salesVehicles,
    summary: {
      totalRevenue,
      totalCostOfGoodsSold,
      averageProfitMargin,
      averageROI
    }
  };
}

function generateInventoryAgingReport(vehicles: Vehicle[], dateRange: DateRange): InventoryAgingReport {
  const activeVehicles = vehicles.filter(vehicle => 
    vehicle.status !== 'sold' && vehicle.status !== 'archived'
  );

  const inventoryVehicles = activeVehicles.map(vehicle => {
    const totalCost = vehicle.costs.reduce((sum, cost) => sum + cost.amount, 0);
    const daysInInventory = calculateDaysInInventory(vehicle);
    
    return {
      vehicleId: vehicle.id,
      vehicleName: `${vehicle.year} ${vehicle.make} ${vehicle.model}`,
      status: vehicle.status,
      daysInInventory,
      totalCost,
      listingPrice: vehicle.saleDetails?.listingPrice
    };
  });

  const totalVehicles = inventoryVehicles.length;
  const averageAge = totalVehicles > 0 
    ? inventoryVehicles.reduce((sum, vehicle) => sum + vehicle.daysInInventory, 0) / totalVehicles 
    : 0;
  const vehiclesOver90Days = inventoryVehicles.filter(vehicle => vehicle.daysInInventory > 90).length;

  return {
    period: {
      start: dateRange.start,
      end: dateRange.end
    },
    vehicles: inventoryVehicles,
    summary: {
      totalVehicles,
      averageAge,
      vehiclesOver90Days
    }
  };
}

function generateExpenseBreakdownReport(vehicles: Vehicle[], dateRange: DateRange): ExpenseBreakdownReport {
  const allCosts: CostEntry[] = [];
  
  vehicles.forEach(vehicle => {
    vehicle.costs.forEach(cost => {
      if (new Date(cost.date) >= dateRange.start && new Date(cost.date) <= dateRange.end) {
        allCosts.push(cost);
      }
    });
  });

  const categoryTotals = new Map<CostCategory, { total: number; count: number }>();
  
  allCosts.forEach(cost => {
    const existing = categoryTotals.get(cost.category) || { total: 0, count: 0 };
    categoryTotals.set(cost.category, {
      total: existing.total + cost.amount,
      count: existing.count + 1
    });
  });

  const totalExpenses = allCosts.reduce((sum, cost) => sum + cost.amount, 0);
  const uniqueVehicles = new Set(allCosts.map(cost => cost.vehicleId)).size;

  const categories = Array.from(categoryTotals.entries()).map(([category, data]) => ({
    category,
    totalAmount: data.total,
    percentage: totalExpenses > 0 ? (data.total / totalExpenses) * 100 : 0,
    vehicleCount: data.count
  })).sort((a, b) => b.totalAmount - a.totalAmount);

  return {
    period: {
      start: dateRange.start,
      end: dateRange.end
    },
    categories,
    summary: {
      totalExpenses,
      averagePerVehicle: uniqueVehicles > 0 ? totalExpenses / uniqueVehicles : 0
    }
  };
}

function generateProfitabilityData(vehicles: Vehicle[], dateRange: DateRange): ProfitabilityData {
  const profitabilityVehicles = vehicles.map(vehicle => {
    const totalCost = vehicle.costs.reduce((sum, cost) => sum + cost.amount, 0);
    const salePrice = vehicle.saleDetails?.finalSalePrice;
    const profit = salePrice ? salePrice - totalCost : undefined;
    const profitMargin = salePrice && profit ? (profit / salePrice) * 100 : undefined;
    const roi = totalCost > 0 && profit ? (profit / totalCost) * 100 : undefined;

    return {
      vehicleId: vehicle.id,
      vehicleName: `${vehicle.year} ${vehicle.make} ${vehicle.model}`,
      totalCost,
      salePrice,
      profit,
      profitMargin,
      roi,
      status: vehicle.status
    };
  });

  const soldVehicles = profitabilityVehicles.filter(v => v.salePrice);
  const totalCost = profitabilityVehicles.reduce((sum, v) => sum + v.totalCost, 0);
  const totalRevenue = soldVehicles.reduce((sum, v) => sum + (v.salePrice || 0), 0);
  const totalProfit = soldVehicles.reduce((sum, v) => sum + (v.profit || 0), 0);
  const averageProfitMargin = soldVehicles.length > 0 
    ? soldVehicles.reduce((sum, v) => sum + (v.profitMargin || 0), 0) / soldVehicles.length 
    : 0;
  const averageROI = soldVehicles.length > 0 
    ? soldVehicles.reduce((sum, v) => sum + (v.roi || 0), 0) / soldVehicles.length 
    : 0;

  return {
    vehicles: profitabilityVehicles,
    summary: {
      totalVehicles: vehicles.length,
      totalCost,
      totalRevenue,
      totalProfit,
      averageProfitMargin,
      averageROI
    }
  };
}

function calculateDaysInInventory(vehicle: Vehicle): number {
  const startDate = new Date(vehicle.acquisitionDetails.purchaseDate);
  const endDate = vehicle.saleDetails?.saleDate ? new Date(vehicle.saleDetails.saleDate) : new Date();
  const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}
