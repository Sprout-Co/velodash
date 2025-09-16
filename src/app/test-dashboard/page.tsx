// Test Dashboard Data
// Simple test page to verify dashboard data is loading from Firestore

'use client';

import { useState, useEffect } from 'react';
import { useDashboardData } from '@/hooks/useDashboardData';

export default function TestDashboardPage() {
  const { 
    kpis, 
    funnelData, 
    actionItems, 
    recentActivity, 
    isLoading, 
    error 
  } = useDashboardData();

  const [debugInfo, setDebugInfo] = useState<any>(null);

  useEffect(() => {
    if (!isLoading && !error) {
      setDebugInfo({
        kpis,
        funnelData,
        actionItemsCount: actionItems.length,
        recentActivityCount: recentActivity.length,
        timestamp: new Date().toISOString()
      });
    }
  }, [kpis, funnelData, actionItems, recentActivity, isLoading, error]);

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">
            Dashboard Data Test
          </h1>
          
          {isLoading && (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-gray-600">Loading dashboard data...</p>
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <h3 className="text-sm font-medium text-red-800 mb-2">Error</h3>
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          {!isLoading && !error && (
            <div className="space-y-6">
              {/* KPIs Section */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="text-lg font-medium text-blue-800 mb-3">KPIs</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">{kpis.liveInventoryCount}</div>
                    <div className="text-sm text-blue-700">Live Inventory</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">₦{kpis.capitalDeployed.toLocaleString()}</div>
                    <div className="text-sm text-blue-700">Capital Deployed</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">₦{kpis.readyForSaleValue.toLocaleString()}</div>
                    <div className="text-sm text-blue-700">Ready for Sale</div>
                  </div>
                </div>
              </div>

              {/* Funnel Data Section */}
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <h3 className="text-lg font-medium text-green-800 mb-3">Inventory Funnel</h3>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">{funnelData.sourced}</div>
                    <div className="text-sm text-green-700">Sourced</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">{funnelData.inTransit}</div>
                    <div className="text-sm text-green-700">In Transit</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">{funnelData.inCustoms}</div>
                    <div className="text-sm text-green-700">In Customs</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">{funnelData.inWorkshop}</div>
                    <div className="text-sm text-green-700">In Workshop</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">{funnelData.forSale}</div>
                    <div className="text-sm text-green-700">For Sale</div>
                  </div>
                </div>
              </div>

              {/* Action Items Section */}
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <h3 className="text-lg font-medium text-yellow-800 mb-3">Action Items ({actionItems.length})</h3>
                {actionItems.length > 0 ? (
                  <div className="space-y-2">
                    {actionItems.slice(0, 5).map((item, index) => (
                      <div key={index} className="text-sm text-yellow-700">
                        • {item.description}
                      </div>
                    ))}
                    {actionItems.length > 5 && (
                      <div className="text-sm text-yellow-600 italic">
                        ... and {actionItems.length - 5} more
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-sm text-yellow-600">No action items</div>
                )}
              </div>

              {/* Recent Activity Section */}
              <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                <h3 className="text-lg font-medium text-purple-800 mb-3">Recent Activity ({recentActivity.length})</h3>
                {recentActivity.length > 0 ? (
                  <div className="space-y-2">
                    {recentActivity.slice(0, 5).map((activity, index) => (
                      <div key={index} className="text-sm text-purple-700">
                        • {activity.userName} {activity.action}
                        {activity.vehicleName && ` - ${activity.vehicleName}`}
                      </div>
                    ))}
                    {recentActivity.length > 5 && (
                      <div className="text-sm text-purple-600 italic">
                        ... and {recentActivity.length - 5} more
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-sm text-purple-600">No recent activity</div>
                )}
              </div>

              {/* Debug Info */}
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <h3 className="text-lg font-medium text-gray-800 mb-3">Debug Info</h3>
                <pre className="text-xs text-gray-600 overflow-auto">
                  {JSON.stringify(debugInfo, null, 2)}
                </pre>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
