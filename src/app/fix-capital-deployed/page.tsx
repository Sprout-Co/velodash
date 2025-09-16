'use client';

import React, { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { vehicleService, costService, dashboardService } from '@/lib/firestore';
import { Vehicle, CostFormData } from '@/types';

export default function FixCapitalDeployedPage() {
  const [fixing, setFixing] = useState(false);
  const [results, setResults] = useState<any>(null);
  const [testResults, setTestResults] = useState<any>(null);

  const testCurrentState = async () => {
    try {
      console.log('Testing current state...');
      
      // Get current KPIs
      const kpis = await dashboardService.getKPIs();
      
      // Get all vehicles
      const vehiclesResponse = await vehicleService.getVehicles();
      const vehicles = vehiclesResponse.data;
      
      // Check cost entries for each vehicle
      let vehiclesWithCosts = 0;
      let vehiclesWithoutCosts = 0;
      let totalCostEntries = 0;
      let totalCalculatedCost = 0;
      
      for (const vehicle of vehicles) {
        const costs = await costService.getCostsByVehicle(vehicle.id);
        
        if (costs.length > 0) {
          vehiclesWithCosts++;
          totalCostEntries += costs.length;
          totalCalculatedCost += costs.reduce((sum, cost) => sum + (cost.ngnAmount || 0), 0);
        } else {
          vehiclesWithoutCosts++;
        }
      }
      
      setTestResults({
        currentCapitalDeployed: kpis.capitalDeployed,
        totalVehicles: vehicles.length,
        vehiclesWithCosts,
        vehiclesWithoutCosts,
        totalCostEntries,
        totalCalculatedCost,
        vehiclesNeedingFix: vehiclesWithoutCosts
      });
      
    } catch (error) {
      console.error('Error testing state:', error);
      setTestResults({ error: error instanceof Error ? error.message : 'Unknown error' });
    }
  };

  const fixCapitalDeployed = async () => {
    try {
      setFixing(true);
      setResults(null);
      
      console.log('Starting Capital Deployed fix...');
      
      // Get all vehicles
      const vehiclesResponse = await vehicleService.getVehicles();
      const vehicles = vehiclesResponse.data;
      
      console.log(`Found ${vehicles.length} vehicles`);
      
      let fixedVehicles = 0;
      let skippedVehicles = 0;
      let errors = 0;
      const vehicleResults = [];
      
      for (const vehicle of vehicles) {
        try {
          console.log(`Processing vehicle ${vehicle.id} (${vehicle.make} ${vehicle.model})`);
          
          // Check if vehicle already has cost entries
          const existingCosts = await costService.getCostsByVehicle(vehicle.id);
          
          if (existingCosts.length > 0) {
            console.log(`Vehicle ${vehicle.id} already has ${existingCosts.length} cost entries, skipping`);
            skippedVehicles++;
            vehicleResults.push({
              vehicleId: vehicle.id,
              vehicleName: `${vehicle.year} ${vehicle.make} ${vehicle.model}`,
              action: 'skipped',
              reason: `Already has ${existingCosts.length} cost entries`
            });
            continue;
          }
          
          // Create cost entry from purchase price
          const purchasePrice = vehicle.acquisitionDetails.purchasePrice;
          const currency = vehicle.acquisitionDetails.currency;
          const purchaseDate = vehicle.acquisitionDetails.purchaseDate;
          
          if (!purchasePrice || purchasePrice <= 0) {
            console.log(`Vehicle ${vehicle.id} has no valid purchase price, skipping`);
            skippedVehicles++;
            vehicleResults.push({
              vehicleId: vehicle.id,
              vehicleName: `${vehicle.year} ${vehicle.make} ${vehicle.model}`,
              action: 'skipped',
              reason: 'No valid purchase price'
            });
            continue;
          }
          
          // Determine exchange rate based on currency
          let exchangeRate = 1;
          if (currency === 'USD') exchangeRate = 850;
          else if (currency === 'EUR') exchangeRate = 900;
          else if (currency === 'GBP') exchangeRate = 1050;
          else if (currency === 'CAD') exchangeRate = 650;
          else if (currency === 'NGN') exchangeRate = 1;
          
          const costData: CostFormData = {
            date: purchaseDate,
            category: 'purchase-price',
            description: 'Initial purchase (backfilled)',
            amount: purchasePrice,
            currency: currency,
            exchangeRate: exchangeRate,
          };
          
          console.log(`Creating cost entry for vehicle ${vehicle.id}:`, {
            amount: purchasePrice,
            currency,
            exchangeRate,
            ngnAmount: purchasePrice * exchangeRate
          });
          
          await costService.createCost(vehicle.id, costData);
          
          fixedVehicles++;
          vehicleResults.push({
            vehicleId: vehicle.id,
            vehicleName: `${vehicle.year} ${vehicle.make} ${vehicle.model}`,
            action: 'fixed',
            amount: purchasePrice,
            currency,
            ngnAmount: purchasePrice * exchangeRate
          });
          
          console.log(`Successfully created cost entry for vehicle ${vehicle.id}`);
          
        } catch (error) {
          console.error(`Error processing vehicle ${vehicle.id}:`, error);
          errors++;
          vehicleResults.push({
            vehicleId: vehicle.id,
            vehicleName: `${vehicle.year} ${vehicle.make} ${vehicle.model}`,
            action: 'error',
            error: error instanceof Error ? error.message : 'Unknown error'
          });
        }
      }
      
      // Test the fix by getting updated KPIs
      const updatedKpis = await dashboardService.getKPIs();
      
      setResults({
        totalVehicles: vehicles.length,
        fixedVehicles,
        skippedVehicles,
        errors,
        oldCapitalDeployed: 0, // We know it was 0 before
        newCapitalDeployed: updatedKpis.capitalDeployed,
        vehicleResults
      });
      
      console.log('Fix completed!', {
        totalVehicles: vehicles.length,
        fixedVehicles,
        skippedVehicles,
        errors,
        newCapitalDeployed: updatedKpis.capitalDeployed
      });
      
    } catch (error) {
      console.error('Error during fix:', error);
      setResults({
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      });
    } finally {
      setFixing(false);
    }
  };

  return (
    <DashboardLayout>
      <div style={{ padding: '20px', fontFamily: 'monospace' }}>
        <h1>Fix Capital Deployed Issue</h1>
        
        <div style={{ marginBottom: '30px', padding: '20px', backgroundColor: '#f9f9f9', borderRadius: '8px' }}>
          <h2>Issue Description</h2>
          <p>The "Capital Deployed" metric shows ₦0 because vehicles don't have cost entries in the database.</p>
          <p>This tool will:</p>
          <ul>
            <li>Check all vehicles for existing cost entries</li>
            <li>Create cost entries for vehicles that don't have them (using their purchase price)</li>
            <li>Use appropriate exchange rates to convert to NGN</li>
            <li>Update the Capital Deployed calculation</li>
          </ul>
        </div>

        <div style={{ marginBottom: '20px' }}>
          <button 
            onClick={testCurrentState}
            style={{ 
              padding: '10px 20px', 
              marginRight: '10px',
              backgroundColor: '#007bff', 
              color: 'white', 
              border: 'none', 
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Test Current State
          </button>
          
          <button 
            onClick={fixCapitalDeployed}
            disabled={fixing}
            style={{ 
              padding: '10px 20px', 
              backgroundColor: fixing ? '#6c757d' : '#28a745', 
              color: 'white', 
              border: 'none', 
              borderRadius: '4px',
              cursor: fixing ? 'not-allowed' : 'pointer'
            }}
          >
            {fixing ? 'Fixing...' : 'Fix Capital Deployed'}
          </button>
        </div>

        {testResults && (
          <div style={{ marginBottom: '30px', padding: '20px', backgroundColor: '#e9ecef', borderRadius: '8px' }}>
            <h2>Current State Test Results</h2>
            {testResults.error ? (
              <p style={{ color: 'red' }}>Error: {testResults.error}</p>
            ) : (
              <div>
                <p><strong>Current Capital Deployed:</strong> ₦{testResults.currentCapitalDeployed?.toLocaleString() || 0}</p>
                <p><strong>Total Vehicles:</strong> {testResults.totalVehicles}</p>
                <p><strong>Vehicles with Costs:</strong> {testResults.vehiclesWithCosts}</p>
                <p><strong>Vehicles without Costs:</strong> {testResults.vehiclesWithoutCosts}</p>
                <p><strong>Total Cost Entries:</strong> {testResults.totalCostEntries}</p>
                <p><strong>Total Calculated Cost:</strong> ₦{testResults.totalCalculatedCost?.toLocaleString() || 0}</p>
                <p style={{ color: testResults.vehiclesNeedingFix > 0 ? 'red' : 'green' }}>
                  <strong>Vehicles Needing Fix:</strong> {testResults.vehiclesNeedingFix}
                </p>
              </div>
            )}
          </div>
        )}

        {results && (
          <div style={{ padding: '20px', backgroundColor: '#d4edda', borderRadius: '8px' }}>
            <h2>Fix Results</h2>
            {results.error ? (
              <p style={{ color: 'red' }}>Error: {results.error}</p>
            ) : (
              <div>
                <p><strong>Total Vehicles:</strong> {results.totalVehicles}</p>
                <p><strong>Fixed Vehicles:</strong> {results.fixedVehicles}</p>
                <p><strong>Skipped Vehicles:</strong> {results.skippedVehicles}</p>
                <p><strong>Errors:</strong> {results.errors}</p>
                <p><strong>Old Capital Deployed:</strong> ₦{results.oldCapitalDeployed.toLocaleString()}</p>
                <p style={{ fontSize: '18px', fontWeight: 'bold', color: 'green' }}>
                  <strong>New Capital Deployed:</strong> ₦{results.newCapitalDeployed.toLocaleString()}
                </p>
                
                {results.vehicleResults && results.vehicleResults.length > 0 && (
                  <div style={{ marginTop: '20px' }}>
                    <h3>Vehicle Details</h3>
                    <table style={{ width: '100%', borderCollapse: 'collapse', border: '1px solid #ddd' }}>
                      <thead>
                        <tr style={{ backgroundColor: '#f0f0f0' }}>
                          <th style={{ padding: '8px', border: '1px solid #ddd' }}>Vehicle</th>
                          <th style={{ padding: '8px', border: '1px solid #ddd' }}>Action</th>
                          <th style={{ padding: '8px', border: '1px solid #ddd' }}>Details</th>
                        </tr>
                      </thead>
                      <tbody>
                        {results.vehicleResults.map((result: any, index: number) => (
                          <tr key={index}>
                            <td style={{ padding: '8px', border: '1px solid #ddd' }}>
                              {result.vehicleName}
                            </td>
                            <td style={{ 
                              padding: '8px', 
                              border: '1px solid #ddd',
                              color: result.action === 'fixed' ? 'green' : result.action === 'error' ? 'red' : 'orange'
                            }}>
                              {result.action}
                            </td>
                            <td style={{ padding: '8px', border: '1px solid #ddd' }}>
                              {result.action === 'fixed' && (
                                `${result.amount} ${result.currency} → ₦${result.ngnAmount.toLocaleString()}`
                              )}
                              {result.action === 'skipped' && result.reason}
                              {result.action === 'error' && result.error}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
