'use client';

import React, { useState, useEffect } from 'react';
import { formatCurrency } from '@/lib/utils';
import { reportService } from '@/lib/firestore';

interface GrossProfitCardProps {
  totalGrossProfit: number;
  isLoading: boolean;
}

interface MonthlyGrossProfit {
  month: string;
  grossProfit: number;
  vehicleCount: number;
}

export function GrossProfitCard({ totalGrossProfit, isLoading }: GrossProfitCardProps) {
  const [selectedMonth, setSelectedMonth] = useState<string>('all');
  const [monthlyData, setMonthlyData] = useState<MonthlyGrossProfit[]>([]);
  const [isLoadingMonthly, setIsLoadingMonthly] = useState(false);

  // Generate last 12 months for filter
  const generateMonthOptions = () => {
    const months = [];
    const now = new Date();
    
    for (let i = 0; i < 12; i++) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      const monthLabel = date.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'long' 
      });
      months.push({ key: monthKey, label: monthLabel });
    }
    
    return months;
  };

  const monthOptions = generateMonthOptions();

  // Fetch monthly gross profit data
  useEffect(() => {
    const fetchMonthlyData = async () => {
      setIsLoadingMonthly(true);
      try {
        const monthlyProfits: MonthlyGrossProfit[] = [];
        
        for (const month of monthOptions) {
          const [year, monthNum] = month.key.split('-');
          const startDate = new Date(parseInt(year), parseInt(monthNum) - 1, 1);
          const endDate = new Date(parseInt(year), parseInt(monthNum), 0, 23, 59, 59);
          
          try {
            const report = await reportService.getSalesPerformanceReport(startDate, endDate);
            const grossProfit = report.summary.totalRevenue - report.summary.totalCostOfGoodsSold;
            
            monthlyProfits.push({
              month: month.label,
              grossProfit,
              vehicleCount: report.vehicles.length
            });
          } catch (error) {
            console.error(`Error fetching data for ${month.label}:`, error);
            monthlyProfits.push({
              month: month.label,
              grossProfit: 0,
              vehicleCount: 0
            });
          }
        }
        
        setMonthlyData(monthlyProfits);
      } catch (error) {
        console.error('Error fetching monthly gross profit data:', error);
      } finally {
        setIsLoadingMonthly(false);
      }
    };

    fetchMonthlyData();
  }, []);

  const getDisplayValue = () => {
    if (selectedMonth === 'all') {
      return totalGrossProfit;
    }
    
    const selectedData = monthlyData.find(data => 
      data.month === monthOptions.find(opt => opt.key === selectedMonth)?.label
    );
    
    return selectedData?.grossProfit || 0;
  };

  const getDisplayDescription = () => {
    if (selectedMonth === 'all') {
      return 'Total gross profit from all sales';
    }
    
    const selectedData = monthlyData.find(data => 
      data.month === monthOptions.find(opt => opt.key === selectedMonth)?.label
    );
    
    if (selectedData) {
      return `${selectedData.vehicleCount} vehicles sold in ${selectedData.month}`;
    }
    
    return 'No sales data for selected month';
  };

  if (isLoading) {
    return (
      <div className="kpi-card kpi-card--loading">
        <div className="kpi-card__skeleton">
          <div className="kpi-card__skeleton-icon"></div>
          <div className="kpi-card__skeleton-content">
            <div className="kpi-card__skeleton-title"></div>
            <div className="kpi-card__skeleton-value"></div>
            <div className="kpi-card__skeleton-description"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="kpi-card kpi-card--orange">
      <div className="kpi-card__icon">
        <span className="kpi-card__emoji">📈</span>
      </div>
      <div className="kpi-card__content">
        <div className="kpi-card__header">
          <h3 className="kpi-card__title">Gross Profit</h3>
          <div className="kpi-card__filter">
            <select 
              value={selectedMonth} 
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="kpi-card__month-select"
              disabled={isLoadingMonthly}
            >
              <option value="all">All Time</option>
              {monthOptions.map(month => (
                <option key={month.key} value={month.key}>
                  {month.label}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div className="kpi-card__value">
          {formatCurrency(getDisplayValue(), 'NGN')}
        </div>
        <p className="kpi-card__description">
          {getDisplayDescription()}
        </p>
      </div>
    </div>
  );
}
