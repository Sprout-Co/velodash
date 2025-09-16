# Firestore Integration Guide

This document explains how the VelocityDash application has been integrated with Google Firestore for data persistence.

## Overview

The application has been fully migrated from mock data to use Google Firestore as the backend database. All CRUD operations for vehicles, costs, activities, and reports are now handled through Firestore.

## Architecture

### Database Structure

The Firestore database is organized into the following collections:

- **`vehicles`** - Vehicle inventory data
- **`costs`** - Cost entries linked to vehicles
- **`activities`** - Activity logs and audit trail
- **`users`** - User management (future implementation)
- **`reports`** - Generated reports (future implementation)

### Service Layer

The application uses a comprehensive service layer (`src/lib/firestore.ts`) that provides:

- **Vehicle Service** - CRUD operations for vehicles
- **Cost Service** - Cost entry management
- **Dashboard Service** - KPI calculations and action items
- **Activity Service** - Activity logging
- **Report Service** - Report generation
- **Realtime Service** - Real-time data subscriptions

## Key Features

### 1. Data Conversion
- Automatic conversion between Firestore Timestamps and JavaScript Date objects
- Type-safe data handling with TypeScript interfaces
- Proper error handling and validation

### 2. Real-time Updates
- Live data subscriptions for vehicles and activities
- Automatic UI updates when data changes
- Optimized for performance with proper cleanup

### 3. Advanced Queries
- Filtering and pagination support
- Complex queries for dashboard KPIs
- Efficient data aggregation

### 4. Activity Logging
- Automatic activity logging for all major operations
- User action tracking
- Audit trail maintenance

## Setup Instructions

### 1. Firebase Configuration

Create a `.env.local` file in the project root with your Firebase configuration:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key_here
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id_here
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id_here
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id_here
```

### 2. Firebase Project Setup

1. Create a new Firebase project at [console.firebase.google.com](https://console.firebase.google.com)
2. Enable Firestore Database
3. Set up security rules (see Security Rules section below)
4. Get your configuration from Project Settings > General > Your apps

### 3. Database Seeding

Use the admin panel to seed the database with sample data:

1. Navigate to `/admin` in your application
2. Click "Seed Database" to populate with sample vehicles and data
3. This will create 5 sample vehicles with various statuses and costs

## Security Rules

Here are the recommended Firestore security rules for development:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Allow read/write access to all documents for development
    // In production, implement proper authentication and authorization
    match /{document=**} {
      allow read, write: if true;
    }
  }
}
```

**⚠️ Warning:** The above rules allow unrestricted access. For production, implement proper authentication and role-based access control.

## API Reference

### Vehicle Service

```typescript
// Get all vehicles with optional filtering
const vehicles = await vehicleService.getVehicles(filters, page, pageSize);

// Get a single vehicle
const vehicle = await vehicleService.getVehicleById(id);

// Create a new vehicle
const newVehicle = await vehicleService.createVehicle(formData);

// Update a vehicle
const updatedVehicle = await vehicleService.updateVehicle(id, formData);

// Delete a vehicle
await vehicleService.deleteVehicle(id);

// Update vehicle status
await vehicleService.updateVehicleStatus(id, 'for-sale');

// Get vehicles by status for dashboard
const funnelData = await vehicleService.getVehiclesByStatus();
```

### Cost Service

```typescript
// Create a cost entry
const cost = await costService.createCost(vehicleId, costData);

// Get costs for a vehicle
const costs = await costService.getCostsByVehicle(vehicleId);

// Update a cost entry
const updatedCost = await costService.updateCost(costId, costData);

// Delete a cost entry
await costService.deleteCost(costId);
```

### Dashboard Service

```typescript
// Get dashboard KPIs
const kpis = await dashboardService.getKPIs();

// Get action items requiring attention
const actionItems = await dashboardService.getActionItems();
```

### Real-time Subscriptions

```typescript
// Subscribe to vehicles changes
const unsubscribe = realtimeService.subscribeToVehicles(
  (vehicles) => {
    // Handle updated vehicles
  },
  filters
);

// Subscribe to activities
const unsubscribe = realtimeService.subscribeToActivities(
  (activities) => {
    // Handle updated activities
  },
  limit
);

// Cleanup subscription
unsubscribe();
```

## Data Models

### Vehicle

```typescript
interface Vehicle {
  id: string;
  vin: string;
  make: string;
  model: string;
  year: number;
  color: string;
  mileage: number;
  status: VehicleStatus;
  acquisitionDetails: {
    sourceChannel: string;
    purchaseDate: Date;
    purchasePrice: number;
    currency: Currency;
    auctionLot?: string;
    listingUrl?: string;
  };
  media: {
    photos: string[];
    videos: string[];
  };
  documents: {
    billOfLading?: string;
    customsDeclaration?: string;
    title?: string;
    purchaseInvoice?: string;
    repairReceipts: string[];
  };
  costs: CostEntry[];
  saleDetails?: {
    listingPrice: number;
    finalSalePrice: number;
    saleDate: Date;
    notes?: string;
  };
  createdAt: Date;
  updatedAt: Date;
}
```

### Cost Entry

```typescript
interface CostEntry {
  id: string;
  vehicleId: string;
  date: Date;
  category: CostCategory;
  description: string;
  amount: number;
  currency: Currency;
  ngnAmount: number;
  exchangeRate: number;
  createdAt: Date;
}
```

## Error Handling

The service layer includes comprehensive error handling:

- Network errors are caught and re-thrown with user-friendly messages
- Validation errors are handled at the form level
- Database errors are logged and displayed to users
- Graceful degradation for non-critical operations

## Performance Considerations

### 1. Pagination
- All list queries support pagination to handle large datasets
- Default page size is 20 items
- Cursor-based pagination for better performance

### 2. Caching
- Real-time subscriptions provide automatic caching
- Data is cached in component state
- Optimistic updates for better UX

### 3. Query Optimization
- Indexes are created automatically for common queries
- Complex aggregations are done client-side for flexibility
- Efficient filtering and sorting

## Testing

### 1. Unit Tests
- Service functions can be tested with Firebase emulators
- Mock data is available for testing components
- Error scenarios are covered

### 2. Integration Tests
- Use Firebase emulators for local testing
- Test real-time subscriptions
- Verify data consistency

### 3. Manual Testing
- Use the admin panel to seed test data
- Test all CRUD operations
- Verify real-time updates

## Troubleshooting

### Common Issues

1. **Firebase configuration errors**
   - Check environment variables
   - Verify project ID and API key
   - Ensure Firestore is enabled

2. **Permission denied errors**
   - Check Firestore security rules
   - Verify authentication (if implemented)
   - Check collection and document paths

3. **Real-time subscription issues**
   - Ensure proper cleanup of subscriptions
   - Check for memory leaks
   - Verify network connectivity

4. **Data conversion errors**
   - Check Date object handling
   - Verify TypeScript types
   - Ensure proper serialization

### Debug Mode

Enable debug logging by setting:

```javascript
// In your browser console
localStorage.setItem('debug', 'firestore:*');
```

## Migration from Mock Data

The migration from mock data to Firestore is complete:

- ✅ All mock data functions replaced with Firestore calls
- ✅ Data hooks updated to use real database
- ✅ Forms work with actual data persistence
- ✅ Real-time updates implemented
- ✅ Error handling improved
- ✅ Type safety maintained

## Next Steps

1. **Authentication**: Implement user authentication and authorization
2. **Security Rules**: Set up proper security rules for production
3. **File Storage**: Integrate Firebase Storage for vehicle images and documents
4. **Offline Support**: Add offline capabilities with Firestore offline persistence
5. **Advanced Queries**: Implement more complex reporting queries
6. **Data Validation**: Add server-side validation rules
7. **Backup Strategy**: Implement automated backups and data retention policies

## Support

For issues or questions regarding the Firestore integration:

1. Check the browser console for error messages
2. Verify Firebase configuration
3. Check Firestore security rules
4. Review the service layer implementation
5. Test with the admin panel seed data

The integration provides a solid foundation for a production-ready vehicle management system with real-time capabilities and scalable data storage.
