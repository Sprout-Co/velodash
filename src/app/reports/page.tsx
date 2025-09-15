'use client';

import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import SalesPerformanceReport from '@/components/reports/SalesPerformanceReport';
import InventoryAgingReport from '@/components/reports/InventoryAgingReport';
import ExpenseBreakdownReport from '@/components/reports/ExpenseBreakdownReport';
import DashboardChartsReport from '@/components/reports/DashboardChartsReport';

export default function ReportsPage() {
  const [activeTab, setActiveTab] = useState('sales');

  return (
    <div className="reports-container p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Reports & Analytics</h1>
        <div className="flex gap-4">
          <button className="btn-export">Export Data</button>
          <button className="btn-print">Print Report</button>
        </div>
      </div>

      <Tabs defaultValue="sales" value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="sales">Sales Performance</TabsTrigger>
          <TabsTrigger value="inventory">Inventory Aging</TabsTrigger>
          <TabsTrigger value="expenses">Expense Breakdown</TabsTrigger>
          <TabsTrigger value="dashboard">Dashboard Charts</TabsTrigger>
        </TabsList>
        
        <TabsContent value="sales" className="report-content">
          <SalesPerformanceReport />
        </TabsContent>
        
        <TabsContent value="inventory" className="report-content">
          <InventoryAgingReport />
        </TabsContent>
        
        <TabsContent value="expenses" className="report-content">
          <ExpenseBreakdownReport />
        </TabsContent>
        
        <TabsContent value="dashboard" className="report-content">
          <DashboardChartsReport />
        </TabsContent>
      </Tabs>
    </div>
  );
}
