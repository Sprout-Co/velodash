'use client';

import { useState } from 'react';
import { seedDatabase } from '@/lib/seedData';

export default function SeedDatabasePage() {
  const [isSeeding, setIsSeeding] = useState(false);
  const [result, setResult] = useState<any>(null);

  const handleSeed = async () => {
    setIsSeeding(true);
    setResult(null);
    
    try {
      const seedResult = await seedDatabase();
      setResult(seedResult);
    } catch (error) {
      setResult({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        message: 'Seeding failed'
      });
    } finally {
      setIsSeeding(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white shadow rounded-lg p-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">
            Database Seeding - Sales Scenarios
          </h1>
          
          <div className="mb-6">
            <p className="text-gray-600 mb-4">
              This will populate your database with comprehensive vehicle data showing different sales scenarios:
            </p>
            <ul className="list-disc list-inside text-gray-600 space-y-2">
              <li><span className="font-semibold text-green-600">High Profit:</span> Toyota Camry (₦1.7M profit)</li>
              <li><span className="font-semibold text-yellow-600">Moderate Profit:</span> BMW 3 Series (₦350K profit)</li>
              <li><span className="font-semibold text-orange-600">Break-even:</span> Kia Soul (small loss)</li>
              <li><span className="font-semibold text-red-600">Loss:</span> Ford F-150 (₦1.6M loss)</li>
              <li><span className="font-semibold text-green-600">High-end Profit:</span> Mercedes C-Class (₦4M profit)</li>
              <li><span className="font-semibold text-green-600">Budget Profit:</span> Nissan Altima (₦1.1M profit)</li>
              <li><span className="font-semibold text-blue-600">Current Inventory:</span> Honda Accord & Lexus RX (for sale)</li>
            </ul>
          </div>

          <button
            onClick={handleSeed}
            disabled={isSeeding}
            className="w-full bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed font-medium"
          >
            {isSeeding ? 'Seeding Database...' : 'Seed Database with Sales Data'}
          </button>

          {result && (
            <div className={`mt-6 p-4 rounded-md ${
              result.success 
                ? 'bg-green-50 border border-green-200' 
                : 'bg-red-50 border border-red-200'
            }`}>
              <h3 className={`font-medium ${
                result.success ? 'text-green-800' : 'text-red-800'
              }`}>
                {result.success ? '✅ Seeding Successful!' : '❌ Seeding Failed'}
              </h3>
              <p className={`mt-2 ${
                result.success ? 'text-green-700' : 'text-red-700'
              }`}>
                {result.message}
              </p>
              {result.error && (
                <p className="mt-2 text-red-600 text-sm">
                  Error: {result.error}
                </p>
              )}
              {result.vehiclesCreated && (
                <p className="mt-2 text-green-600 text-sm">
                  Created {result.vehiclesCreated} vehicles with comprehensive cost and sale data.
                </p>
              )}
            </div>
          )}

          <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-md">
            <h3 className="font-medium text-blue-800 mb-2">What This Creates:</h3>
            <ul className="text-blue-700 text-sm space-y-1">
              <li>• 8 vehicles with realistic purchase prices and dates</li>
              <li>• Comprehensive cost structures (shipping, customs, repairs, etc.)</li>
              <li>• Sale data for 6 sold vehicles with different profit scenarios</li>
              <li>• 2 vehicles currently for sale in inventory</li>
              <li>• Total 30-day revenue: ~₦4.2M from recent sales</li>
              <li>• Perfect for testing dashboard KPIs</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
