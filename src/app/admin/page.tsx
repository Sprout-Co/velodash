'use client';

import { useState } from 'react';
import { Database, Trash2, CheckCircle, AlertCircle } from 'lucide-react';
import { seedDatabase, clearDatabase } from '@/lib/seedData';

export default function AdminPage() {
  const [isSeeding, setIsSeeding] = useState(false);
  const [isClearing, setIsClearing] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);

  const handleSeedDatabase = async () => {
    setIsSeeding(true);
    setMessage(null);

    try {
      const result = await seedDatabase();
      
      if (result.success) {
        setMessage({
          type: 'success',
          text: `✅ ${result.message} Created ${result.vehiclesCreated} vehicles.`,
        });
      } else {
        setMessage({
          type: 'error',
          text: `❌ ${result.message} ${result.error || ''}`,
        });
      }
    } catch (error) {
      setMessage({
        type: 'error',
        text: `❌ Failed to seed database: ${error instanceof Error ? error.message : 'Unknown error'}`,
      });
    } finally {
      setIsSeeding(false);
    }
  };

  const handleClearDatabase = async () => {
    if (!confirm('⚠️ Are you sure you want to clear the database? This action cannot be undone!')) {
      return;
    }

    setIsClearing(true);
    setMessage(null);

    try {
      const result = await clearDatabase();
      
      if (result.success) {
        setMessage({
          type: 'info',
          text: `ℹ️ ${result.message}`,
        });
      } else {
        setMessage({
          type: 'error',
          text: `❌ ${result.message} ${result.error || ''}`,
        });
      }
    } catch (error) {
      setMessage({
        type: 'error',
        text: `❌ Failed to clear database: ${error instanceof Error ? error.message : 'Unknown error'}`,
      });
    } finally {
      setIsClearing(false);
    }
  };

  return (
    <div className="admin-container">
      <div className="page-header">
        <h1>Database Administration</h1>
        <p>Manage your Firestore database for development and testing</p>
      </div>

      <div className="admin-content">
        <div className="admin-cards">
          <div className="admin-card">
            <div className="admin-card-header">
              <Database className="icon" />
              <h2>Seed Database</h2>
            </div>
            <div className="admin-card-content">
              <p>
                Populate your Firestore database with sample vehicle data, costs, and activities 
                for testing and development purposes.
              </p>
              <ul>
                <li>5 sample vehicles with different statuses</li>
                <li>Additional cost entries</li>
                <li>Sample activity logs</li>
                <li>Realistic test data</li>
              </ul>
            </div>
            <div className="admin-card-actions">
              <button
                className="seed-button"
                onClick={handleSeedDatabase}
                disabled={isSeeding || isClearing}
              >
                {isSeeding ? (
                  <>
                    <div className="loading-spinner" />
                    Seeding Database...
                  </>
                ) : (
                  <>
                    <Database className="icon" />
                    Seed Database
                  </>
                )}
              </button>
            </div>
          </div>

          <div className="admin-card">
            <div className="admin-card-header">
              <Trash2 className="icon" />
              <h2>Clear Database</h2>
            </div>
            <div className="admin-card-content">
              <p>
                <strong>⚠️ Warning:</strong> This will remove all data from your Firestore database. 
                This action cannot be undone and should only be used for development/testing.
              </p>
              <p>
                For safety, this function is not fully implemented. To clear data, 
                manually delete collections in the Firebase Console.
              </p>
            </div>
            <div className="admin-card-actions">
              <button
                className="clear-button"
                onClick={handleClearDatabase}
                disabled={isSeeding || isClearing}
              >
                {isClearing ? (
                  <>
                    <div className="loading-spinner" />
                    Clearing Database...
                  </>
                ) : (
                  <>
                    <Trash2 className="icon" />
                    Clear Database
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {message && (
          <div className={`message-banner ${message.type}`}>
            <div className="message-content">
              {message.type === 'success' && <CheckCircle className="icon" />}
              {message.type === 'error' && <AlertCircle className="icon" />}
              {message.type === 'info' && <AlertCircle className="icon" />}
              <p>{message.text}</p>
            </div>
          </div>
        )}

        <div className="admin-info">
          <h3>Firebase Configuration</h3>
          <p>
            Make sure your Firebase configuration is properly set up in your environment variables:
          </p>
          <ul>
            <li><code>NEXT_PUBLIC_FIREBASE_API_KEY</code></li>
            <li><code>NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN</code></li>
            <li><code>NEXT_PUBLIC_FIREBASE_PROJECT_ID</code></li>
            <li><code>NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET</code></li>
            <li><code>NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID</code></li>
            <li><code>NEXT_PUBLIC_FIREBASE_APP_ID</code></li>
          </ul>
          
          <h3>Database Structure</h3>
          <p>The following collections will be created:</p>
          <ul>
            <li><strong>vehicles</strong> - Vehicle inventory data</li>
            <li><strong>costs</strong> - Cost entries for each vehicle</li>
            <li><strong>activities</strong> - Activity logs and audit trail</li>
            <li><strong>users</strong> - User management (future)</li>
            <li><strong>reports</strong> - Generated reports (future)</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
