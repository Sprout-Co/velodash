// Test Activity Feed
// Simple test page to verify activity feed date handling

"use client";

import { useState, useEffect } from "react";
import { RecentActivityFeed } from "@/components/dashboard/RecentActivityFeed";


export default function TestActivityPage() {
  const [activities, setActivities] = useState<RecentActivity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Create test activities with various date formats
    const testActivities: RecentActivity[] = [
      {
        id: "1",
        userId: "user1",
        userName: "John Doe",
        action: "added vehicle",
        vehicleId: "vehicle1",
        vehicleName: "Toyota Camry",
        timestamp: new Date(), // Regular Date object
      },
      {
        id: "2",
        userId: "user2",
        userName: "Jane Smith",
        action: "updated vehicle",
        vehicleId: "vehicle2",
        vehicleName: "Honda Civic",
        timestamp: new Date(Date.now() - 3600000), // 1 hour ago
      },
      {
        id: "3",
        userId: "user3",
        userName: "Bob Johnson",
        action: "added cost",
        vehicleId: "vehicle3",
        vehicleName: "Ford Focus",
        timestamp: "2024-01-15T10:30:00Z", // ISO string
      },
      {
        id: "4",
        userId: "user4",
        userName: "Alice Brown",
        action: "changed status",
        vehicleId: "vehicle4",
        vehicleName: "BMW X5",
        timestamp: Date.now() - 86400000, // 1 day ago (timestamp)
      },
      {
        id: "5",
        userId: "user5",
        userName: "Charlie Wilson",
        action: "updated vehicle",
        vehicleId: "vehicle5",
        vehicleName: "Mercedes C-Class",
        timestamp: null, // Invalid date to test error handling
      },
    ];

    setActivities(testActivities);
    setLoading(false);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">
            Activity Feed Date Handling Test
          </h1>

          <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h3 className="text-sm font-medium text-blue-800 mb-2">
              Test Cases
            </h3>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• Regular Date object (now)</li>
              <li>• Date object (1 hour ago)</li>
              <li>• ISO string format</li>
              <li>• Timestamp number (1 day ago)</li>
              <li>
                • Invalid/null date (should show &quot;Unknown time&quot;)
              </li>
            </ul>
          </div>

          <div className="activity-feed">
            <RecentActivityFeed activities={activities} isLoading={loading} />
          </div>

          <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
            <h3 className="text-sm font-medium text-green-800 mb-2">
              Expected Results
            </h3>
            <ul className="text-sm text-green-700 space-y-1">
              <li>• All activities should display without errors</li>
              <li>• Time ago should be calculated correctly</li>
              <li>• Invalid dates should show &quot;Unknown time&quot;</li>
              <li>• No console errors should appear</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
