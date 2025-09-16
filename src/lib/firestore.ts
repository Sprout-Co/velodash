// Firestore Database Operations
// Comprehensive CRUD operations for VelocityDash data models

import {
  collection,
  doc,
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  startAfter,
  Timestamp,
  writeBatch,
  onSnapshot,
  QuerySnapshot,
  DocumentSnapshot,
  Query,
  WhereFilterOp,
} from 'firebase/firestore';
import { db } from './firebase';
import { calculateDaysInInventory } from './utils';
import {
  Vehicle,
  CostEntry,
  User,
  DashboardKPIs,
  InventoryStatusFunnel,
  ActionRequired,
  RecentActivity,
  SalesPerformanceReport,
  InventoryAgingReport,
  ExpenseBreakdownReport,
  VehicleFilters,
  PaginatedResponse,
  VehicleFormData,
  CostFormData,
  SaleFormData,
} from '@/types';

// Collection names
const COLLECTIONS = {
  VEHICLES: 'vehicles',
  COSTS: 'costs',
  USERS: 'users',
  ACTIVITIES: 'activities',
  REPORTS: 'reports',
} as const;

// Helper function to convert Firestore timestamps to Date objects
const convertTimestamps = (data: any): any => {
  if (!data) return data;
  
  const converted = { ...data };
  
  // Convert Firestore Timestamps to Date objects
  Object.keys(converted).forEach(key => {
    const value = converted[key];
    
    // Handle Timestamp objects first
    if (value instanceof Timestamp) {
      converted[key] = safeDateConversion(value);
    }
    // Handle nested objects
    else if (value && typeof value === 'object' && value.constructor === Object) {
      converted[key] = convertTimestamps(value);
    }
    // Handle arrays
    else if (Array.isArray(value)) {
      converted[key] = value.map(item => convertTimestamps(item));
    }
    // Handle date-like strings
    else if (typeof value === 'string' && (key.includes('date') || key.includes('Date') || key.includes('time') || key.includes('Time'))) {
      const convertedDate = safeDateConversion(value);
      if (convertedDate) {
        converted[key] = convertedDate;
      }
    }
  });
  
  return converted;
};

// Helper function to convert Date objects to Firestore Timestamps
const convertDatesToTimestamps = (data: any): any => {
  if (!data) return data;
  
  const converted = { ...data };
  
  Object.keys(converted).forEach(key => {
    if (converted[key] instanceof Date) {
      converted[key] = Timestamp.fromDate(converted[key]);
    } else if (typeof converted[key] === 'object' && converted[key] !== null) {
      converted[key] = convertDatesToTimestamps(converted[key]);
    }
  });
  
  return converted;
};

// Helper function to clean undefined values for Firestore
const cleanUndefinedValues = (data: any): any => {
  if (!data) return data;
  
  if (Array.isArray(data)) {
    return data.map(item => cleanUndefinedValues(item));
  }
  
  if (typeof data === 'object') {
    const cleaned: any = {};
    Object.keys(data).forEach(key => {
      const value = data[key];
      if (value !== undefined) {
        cleaned[key] = cleanUndefinedValues(value);
      }
    });
    return cleaned;
  }
  
  return data;
};

// Helper function to safely convert dates
const safeDateConversion = (date: any): Date | null => {
  if (!date) return null;
  
  if (date instanceof Date) {
    return isNaN(date.getTime()) ? null : date;
  }
  
  if (date instanceof Timestamp) {
    return date.toDate();
  }
  
  // Handle Firestore Timestamp objects that come through as plain objects
  if (date && typeof date === 'object' && date.seconds && typeof date.seconds === 'number') {
    return new Date(date.seconds * 1000 + (date.nanoseconds || 0) / 1000000);
  }
  
  if (typeof date === 'string') {
    const parsed = new Date(date);
    return isNaN(parsed.getTime()) ? null : parsed;
  }
  
  if (typeof date === 'number') {
    const parsed = new Date(date);
    return isNaN(parsed.getTime()) ? null : parsed;
  }
  
  return null;
};

// ==================== VEHICLE OPERATIONS ====================

export const vehicleService = {
  // Get all vehicles with optional filtering and pagination
  async getVehicles(
    filters?: VehicleFilters,
    page: number = 1,
    pageSize: number = 20
  ): Promise<PaginatedResponse<Vehicle>> {
    try {
      let q: Query = collection(db, COLLECTIONS.VEHICLES);
      
      // Apply filters
      if (filters?.status?.length) {
        q = query(q, where('status', 'in', filters.status));
      }
      
      if (filters?.make?.length) {
        q = query(q, where('make', 'in', filters.make));
      }
      
      if (filters?.year?.min || filters?.year?.max) {
        if (filters.year.min) {
          q = query(q, where('year', '>=', filters.year.min));
        }
        if (filters.year.max) {
          q = query(q, where('year', '<=', filters.year.max));
        }
      }
      
      // Order by creation date (newest first)
      q = query(q, orderBy('createdAt', 'desc'));
      
      // Apply pagination
      const startIndex = (page - 1) * pageSize;
      if (startIndex > 0) {
        // For pagination, we'd need to implement cursor-based pagination
        // For now, we'll use offset-based pagination
        q = query(q, limit(startIndex + pageSize));
      } else {
        q = query(q, limit(pageSize));
      }
      
      const snapshot = await getDocs(q);
      const vehicles = await Promise.all(
        snapshot.docs.map(async (doc) => {
          const data = doc.data();
          const vehicle = convertTimestamps({ id: doc.id, ...data }) as Vehicle;
          
          // Load costs for this vehicle
          try {
            const costs = await costService.getCostsByVehicle(vehicle.id);
            console.log(`Loaded ${costs.length} costs for vehicle ${vehicle.id}:`, costs);
            vehicle.costs = costs;
          } catch (error) {
            console.warn(`Failed to load costs for vehicle ${vehicle.id}:`, error);
            vehicle.costs = [];
          }
          
          return vehicle;
        })
      );
      
      // Apply client-side filters that can't be done in Firestore
      let filteredVehicles = vehicles;
      
      if (filters?.priceRange?.min || filters?.priceRange?.max) {
        filteredVehicles = filteredVehicles.filter(vehicle => {
          const price = vehicle.acquisitionDetails.purchasePrice;
          if (filters.priceRange?.min && filters.priceRange?.max) {
            return price >= filters.priceRange.min && price <= filters.priceRange.max;
          }
          if (filters.priceRange?.min) return price >= filters.priceRange.min;
          if (filters.priceRange?.max) return price <= filters.priceRange.max;
          return true;
        });
      }
      
      if (filters?.search) {
        const searchTerm = filters.search.toLowerCase();
        filteredVehicles = filteredVehicles.filter(vehicle =>
          vehicle.vin.toLowerCase().includes(searchTerm) ||
          vehicle.make.toLowerCase().includes(searchTerm) ||
          vehicle.model.toLowerCase().includes(searchTerm) ||
          `${vehicle.make} ${vehicle.model}`.toLowerCase().includes(searchTerm)
        );
      }
      
      // Get total count for pagination
      const totalSnapshot = await getDocs(collection(db, COLLECTIONS.VEHICLES));
      const total = totalSnapshot.size;
      
      return {
        data: filteredVehicles,
        pagination: {
          page,
          limit: pageSize,
          total,
          totalPages: Math.ceil(total / pageSize),
        },
      };
    } catch (error) {
      console.error('Error fetching vehicles:', error);
      throw new Error('Failed to fetch vehicles');
    }
  },

  // Get a single vehicle by ID
  async getVehicleById(id: string): Promise<Vehicle | null> {
    try {
      const docRef = doc(db, COLLECTIONS.VEHICLES, id);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        const data = docSnap.data();
        const vehicle = convertTimestamps({ id: docSnap.id, ...data }) as Vehicle;
        
        // Load costs for this vehicle
        try {
          const costs = await costService.getCostsByVehicle(vehicle.id);
          vehicle.costs = costs;
        } catch (error) {
          console.warn(`Failed to load costs for vehicle ${vehicle.id}:`, error);
          vehicle.costs = [];
        }
        
        return vehicle;
      }
      
      return null;
    } catch (error) {
      console.error('Error fetching vehicle:', error);
      throw new Error('Failed to fetch vehicle');
    }
  },

  // Create a new vehicle
  async createVehicle(formData: VehicleFormData): Promise<Vehicle> {
    try {
      const now = new Date();
      const vehicleData = {
        vin: formData.vin,
        make: formData.make,
        model: formData.model,
        year: formData.year,
        color: formData.color,
        trim: formData.trim,
        mileage: formData.mileage,
        status: 'sourced' as const,
      acquisitionDetails: {
        sourceChannel: formData.acquisitionDetails.sourceChannel,
        purchaseDate: new Date(formData.acquisitionDetails.purchaseDate),
        purchasePrice: formData.acquisitionDetails.purchasePrice,
        currency: formData.acquisitionDetails.currency,
        auctionLot: formData.acquisitionDetails.auctionLot?.trim() || undefined,
        listingUrl: formData.acquisitionDetails.listingUrl?.trim() || undefined,
      },
        media: {
          photos: [],
          videos: [],
        },
        documents: {
          repairReceipts: [],
        },
        costs: [],
        createdAt: now,
        updatedAt: now,
      };

      // Convert dates to timestamps and clean undefined values for Firestore
      const vehicleDataWithTimestamps = convertDatesToTimestamps(vehicleData);
      const cleanedVehicleData = cleanUndefinedValues(vehicleDataWithTimestamps);
      
      const docRef = await addDoc(collection(db, COLLECTIONS.VEHICLES), cleanedVehicleData);
      
      // Create initial cost entry for purchase price
      const costData: CostFormData = {
        date: formData.acquisitionDetails.purchaseDate,
        category: 'purchase-price',
        description: 'Initial purchase',
        amount: formData.acquisitionDetails.purchasePrice,
        currency: formData.acquisitionDetails.currency,
        exchangeRate: 850, // Default exchange rate
      };
      
      await costService.createCost(docRef.id, costData);
      
      // Log activity
      await activityService.logActivity({
        userId: 'system', // In a real app, this would be the current user ID
        userName: 'System',
        action: 'created vehicle',
        vehicleId: docRef.id,
        vehicleName: `${formData.year} ${formData.make} ${formData.model}`,
        timestamp: now,
      });
      
      return convertTimestamps({ id: docRef.id, ...vehicleData }) as Vehicle;
    } catch (error) {
      console.error('Error creating vehicle:', error);
      throw new Error('Failed to create vehicle');
    }
  },

  // Update a vehicle
  async updateVehicle(id: string, formData: VehicleFormData): Promise<Vehicle> {
    try {
      const docRef = doc(db, COLLECTIONS.VEHICLES, id);
      const now = new Date();
      
      const updateData = {
        vin: formData.vin,
        make: formData.make,
        model: formData.model,
        year: formData.year,
        color: formData.color,
        trim: formData.trim,
        mileage: formData.mileage,
      acquisitionDetails: {
        sourceChannel: formData.acquisitionDetails.sourceChannel,
        purchaseDate: new Date(formData.acquisitionDetails.purchaseDate),
        purchasePrice: formData.acquisitionDetails.purchasePrice,
        currency: formData.acquisitionDetails.currency,
        auctionLot: formData.acquisitionDetails.auctionLot?.trim() || undefined,
        listingUrl: formData.acquisitionDetails.listingUrl?.trim() || undefined,
      },
        updatedAt: now,
      };

      const updateDataWithTimestamps = convertDatesToTimestamps(updateData);
      const cleanedUpdateData = cleanUndefinedValues(updateDataWithTimestamps);
      await updateDoc(docRef, cleanedUpdateData);
      
      // Log activity
      await activityService.logActivity({
        userId: 'system',
        userName: 'System',
        action: 'updated vehicle details',
        vehicleId: id,
        vehicleName: `${formData.year} ${formData.make} ${formData.model}`,
        timestamp: now,
      });
      
      // Return updated vehicle
      const updatedVehicle = await this.getVehicleById(id);
      if (!updatedVehicle) {
        throw new Error('Vehicle not found after update');
      }
      
      return updatedVehicle;
    } catch (error) {
      console.error('Error updating vehicle:', error);
      throw new Error('Failed to update vehicle');
    }
  },

  // Update vehicle status
  async updateVehicleStatus(id: string, status: Vehicle['status']): Promise<void> {
    try {
      const docRef = doc(db, COLLECTIONS.VEHICLES, id);
      const now = new Date();
      
      await updateDoc(docRef, {
        status,
        updatedAt: Timestamp.fromDate(now),
      });
      
      // Log activity
      await activityService.logActivity({
        userId: 'system',
        userName: 'System',
        action: `changed status to ${status}`,
        vehicleId: id,
        timestamp: now,
      });
    } catch (error) {
      console.error('Error updating vehicle status:', error);
      throw new Error('Failed to update vehicle status');
    }
  },

  // Update vehicle sale details
  async updateVehicleSaleDetails(id: string, saleDetails: Vehicle['saleDetails']): Promise<Vehicle> {
    try {
      const docRef = doc(db, COLLECTIONS.VEHICLES, id);
      const now = new Date();
      
      const updateData = {
        saleDetails: {
          ...saleDetails,
          saleDate: saleDetails?.saleDate ? Timestamp.fromDate(new Date(saleDetails.saleDate)) : Timestamp.fromDate(now),
        },
        updatedAt: Timestamp.fromDate(now),
      };

      const cleanedUpdateData = cleanUndefinedValues(updateData);
      await updateDoc(docRef, cleanedUpdateData);

      // Log activity
      await activityService.logActivity({
        userId: 'system',
        userName: 'System',
        action: 'updated sale details',
        vehicleId: id,
        timestamp: now,
      });

      const updatedVehicle = await this.getVehicleById(id);
      if (!updatedVehicle) {
        throw new Error('Vehicle not found after update');
      }

      return updatedVehicle;
    } catch (error) {
      console.error('Error updating vehicle sale details:', error);
      throw new Error('Failed to update vehicle sale details');
    }
  },

  // Update vehicle media
  async updateVehicleMedia(id: string, media: Vehicle['media']): Promise<Vehicle> {
    try {
      const docRef = doc(db, COLLECTIONS.VEHICLES, id);
      const now = new Date();
      
      const updateData = {
        media,
        updatedAt: Timestamp.fromDate(now),
      };

      const cleanedUpdateData = cleanUndefinedValues(updateData);
      await updateDoc(docRef, cleanedUpdateData);
      
      // Log activity
      await activityService.logActivity({
        userId: 'system',
        userName: 'System',
        action: 'updated vehicle media',
        vehicleId: id,
        timestamp: now,
      });
      
      // Return updated vehicle
      const updatedVehicle = await this.getVehicleById(id);
      if (!updatedVehicle) {
        throw new Error('Vehicle not found after update');
      }
      
      return updatedVehicle;
    } catch (error) {
      console.error('Error updating vehicle media:', error);
      throw new Error('Failed to update vehicle media');
    }
  },

  // Delete a vehicle
  async deleteVehicle(id: string): Promise<void> {
    try {
      // First, get the vehicle to log the activity
      const vehicle = await this.getVehicleById(id);
      
      // Delete all associated costs
      const costsQuery = query(
        collection(db, COLLECTIONS.COSTS),
        where('vehicleId', '==', id)
      );
      const costsSnapshot = await getDocs(costsQuery);
      
      const batch = writeBatch(db);
      costsSnapshot.docs.forEach(doc => {
        batch.delete(doc.ref);
      });
      
      // Delete the vehicle
      const vehicleRef = doc(db, COLLECTIONS.VEHICLES, id);
      batch.delete(vehicleRef);
      
      await batch.commit();
      
      // Log activity
      if (vehicle) {
        await activityService.logActivity({
          userId: 'system',
          userName: 'System',
          action: 'deleted vehicle',
          vehicleId: id,
          vehicleName: `${vehicle.year} ${vehicle.make} ${vehicle.model}`,
          timestamp: new Date(),
        });
      }
    } catch (error) {
      console.error('Error deleting vehicle:', error);
      throw new Error('Failed to delete vehicle');
    }
  },

  // Get vehicles by status for dashboard funnel
  async getVehiclesByStatus(): Promise<InventoryStatusFunnel> {
    try {
      const statuses: Vehicle['status'][] = ['sourced', 'in-transit', 'in-customs', 'in-workshop', 'for-sale'];
      const funnelData: InventoryStatusFunnel = {
        sourced: 0,
        inTransit: 0,
        inCustoms: 0,
        inWorkshop: 0,
        forSale: 0,
      };

      for (const status of statuses) {
        const q = query(
          collection(db, COLLECTIONS.VEHICLES),
          where('status', '==', status)
        );
        const snapshot = await getDocs(q);
        
        switch (status) {
          case 'sourced':
            funnelData.sourced = snapshot.size;
            break;
          case 'in-transit':
            funnelData.inTransit = snapshot.size;
            break;
          case 'in-customs':
            funnelData.inCustoms = snapshot.size;
            break;
          case 'in-workshop':
            funnelData.inWorkshop = snapshot.size;
            break;
          case 'for-sale':
            funnelData.forSale = snapshot.size;
            break;
        }
      }

      return funnelData;
    } catch (error) {
      console.error('Error fetching vehicles by status:', error);
      throw new Error('Failed to fetch inventory funnel data');
    }
  },
};

// ==================== COST OPERATIONS ====================

export const costService = {
  // Create a new cost entry
  async createCost(vehicleId: string, formData: CostFormData): Promise<CostEntry> {
    try {
      const now = new Date();
      const costData = {
        vehicleId,
        date: new Date(formData.date),
        category: formData.category,
        description: formData.description,
        amount: formData.amount,
        currency: formData.currency,
        ngnAmount: formData.amount * formData.exchangeRate,
        exchangeRate: formData.exchangeRate,
        createdAt: now,
      };

      const costDataWithTimestamps = convertDatesToTimestamps(costData);
      const cleanedCostData = cleanUndefinedValues(costDataWithTimestamps);
      const docRef = await addDoc(collection(db, COLLECTIONS.COSTS), cleanedCostData);
      
      // Log activity
      await activityService.logActivity({
        userId: 'system',
        userName: 'System',
        action: `added ${formData.category} cost of ₦${(formData.amount * formData.exchangeRate).toLocaleString()} to`,
        vehicleId,
        timestamp: now,
      });
      
      return convertTimestamps({ id: docRef.id, ...costData }) as CostEntry;
    } catch (error) {
      console.error('Error creating cost:', error);
      throw new Error('Failed to create cost entry');
    }
  },

  // Get costs for a vehicle
  async getCostsByVehicle(vehicleId: string): Promise<CostEntry[]> {
    try {
      const q = query(
        collection(db, COLLECTIONS.COSTS),
        where('vehicleId', '==', vehicleId)
      );
      
      const snapshot = await getDocs(q);
      const costs = snapshot.docs.map(doc => {
        const data = doc.data();
        return convertTimestamps({ id: doc.id, ...data }) as CostEntry;
      });
      
      // Sort by date in descending order (newest first)
      return costs.sort((a, b) => {
        const dateA = new Date(a.date);
        const dateB = new Date(b.date);
        return dateB.getTime() - dateA.getTime();
      });
    } catch (error) {
      console.error('Error fetching costs:', error);
      throw new Error('Failed to fetch costs');
    }
  },

  // Update a cost entry
  async updateCost(costId: string, formData: CostFormData): Promise<CostEntry> {
    try {
      const docRef = doc(db, COLLECTIONS.COSTS, costId);
      const now = new Date();
      
      const updateData = {
        date: new Date(formData.date),
        category: formData.category,
        description: formData.description,
        amount: formData.amount,
        currency: formData.currency,
        ngnAmount: formData.amount * formData.exchangeRate,
        exchangeRate: formData.exchangeRate,
        updatedAt: now,
      };

      const updateDataWithTimestamps = convertDatesToTimestamps(updateData);
      const cleanedUpdateData = cleanUndefinedValues(updateDataWithTimestamps);
      await updateDoc(docRef, cleanedUpdateData);
      
      // Get the updated cost entry
      const updatedDoc = await getDoc(docRef);
      if (!updatedDoc.exists()) {
        throw new Error('Cost entry not found after update');
      }
      
      return convertTimestamps({ id: updatedDoc.id, ...updatedDoc.data() }) as CostEntry;
    } catch (error) {
      console.error('Error updating cost:', error);
      throw new Error('Failed to update cost entry');
    }
  },

  // Delete a cost entry
  async deleteCost(costId: string): Promise<void> {
    try {
      const docRef = doc(db, COLLECTIONS.COSTS, costId);
      await deleteDoc(docRef);
    } catch (error) {
      console.error('Error deleting cost:', error);
      throw new Error('Failed to delete cost entry');
    }
  },
};

// ==================== DASHBOARD OPERATIONS ====================

export const dashboardService = {
  // Get dashboard KPIs
  async getKPIs(): Promise<DashboardKPIs> {
    try {
      // Get all vehicles with costs loaded
      const vehiclesResponse = await vehicleService.getVehicles();
      const vehicles = vehiclesResponse.data;

      // Calculate KPIs
      const liveInventoryCount = vehicles.filter(v => v.status !== 'sold' && v.status !== 'archived').length;
      
      let capitalDeployed = 0;
      let readyForSaleValue = 0;
      let grossProfit = 0;
      let netProfit30Days = 0;
      
      // Calculate 30 days ago date
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      
      console.log('Calculating KPIs for vehicles:', vehicles.length);
      
      for (const vehicle of vehicles) {
        console.log(`Vehicle ${vehicle.id} (${vehicle.make} ${vehicle.model}):`, {
          costs: vehicle.costs,
          costsLength: vehicle.costs?.length || 0,
          costsType: typeof vehicle.costs
        });
        
        const totalCost = Array.isArray(vehicle.costs) 
          ? vehicle.costs.reduce((sum, cost) => {
              console.log(`Cost: ${cost.description} - ${cost.ngnAmount} NGN`);
              return sum + cost.ngnAmount;
            }, 0)
          : 0;
        
        console.log(`Total cost for vehicle ${vehicle.id}: ${totalCost} NGN`);
        capitalDeployed += totalCost;
        
        if (vehicle.status === 'for-sale' && vehicle.saleDetails?.listingPrice) {
          readyForSaleValue += vehicle.saleDetails.listingPrice;
        }
        
        // Calculate gross profit for sold vehicles
        if (vehicle.status === 'sold' && vehicle.saleDetails?.finalSalePrice) {
          const profit = vehicle.saleDetails.finalSalePrice - totalCost;
          grossProfit += profit;
          console.log(`Vehicle ${vehicle.id} sold for ${vehicle.saleDetails.finalSalePrice} NGN, cost ${totalCost} NGN, profit: ${profit} NGN`);
          
          // Check if sold within last 30 days for net profit
          if (vehicle.saleDetails?.saleDate) {
            console.log(`DEBUG: Vehicle ${vehicle.id} - raw saleDate:`, vehicle.saleDetails.saleDate, 'type:', typeof vehicle.saleDetails.saleDate);
            const saleDate = safeDateConversion(vehicle.saleDetails.saleDate);
            console.log(`DEBUG: Vehicle ${vehicle.id} - converted saleDate:`, saleDate, 'thirtyDaysAgo:', thirtyDaysAgo);
            console.log(`DEBUG: Vehicle ${vehicle.id} - saleDate >= thirtyDaysAgo:`, saleDate && saleDate >= thirtyDaysAgo);
            if (saleDate && saleDate >= thirtyDaysAgo) {
              netProfit30Days += profit;
              console.log(`===> Vehicle ${vehicle.id} sold within last 30 days (${saleDate.toDateString()}), adding ${profit} NGN to net profit`);
            } else {
              console.log(`DEBUG: Vehicle ${vehicle.id} NOT added to net profit - saleDate:`, saleDate, 'thirtyDaysAgo:', thirtyDaysAgo);
            }
          } else {
            console.log(`DEBUG: Vehicle ${vehicle.id} has no saleDate`);
          }
        }
      }
      
      console.log('Capital deployed calculation:', {
        totalVehicles: vehicles.length,
        capitalDeployed,
        readyForSaleValue
      });

      // Debug logging
      console.log('Dashboard KPIs calculated:', {
        totalVehicles: vehicles.length,
        liveInventoryCount,
        capitalDeployed,
        readyForSaleValue,
        grossProfit,
        netProfit30Days,
      });

      return {
        liveInventoryCount,
        capitalDeployed,
        readyForSaleValue,
        grossProfit,
        netProfit30Days,
      };
    } catch (error) {
      console.error('Error fetching KPIs:', error);
      throw new Error('Failed to fetch dashboard KPIs');
    }
  },

  // Get action items requiring attention
  async getActionItems(): Promise<ActionRequired[]> {
    try {
      const vehiclesSnapshot = await getDocs(collection(db, COLLECTIONS.VEHICLES));
      const vehicles = vehiclesSnapshot.docs.map(doc => {
        const data = doc.data();
        return convertTimestamps({ id: doc.id, ...data }) as Vehicle;
      });

      const actionItems: ActionRequired[] = [];
      const now = new Date();

      for (const vehicle of vehicles) {
        const vehicleName = `${vehicle.year} ${vehicle.make} ${vehicle.model}`;
        
        // Check for customs delays
        if (vehicle.status === 'in-customs') {
          const updatedAt = safeDateConversion(vehicle.updatedAt);
          if (updatedAt) {
            const daysInCustoms = Math.floor((now.getTime() - updatedAt.getTime()) / (1000 * 60 * 60 * 24));
            if (daysInCustoms > 10) {
              actionItems.push({
                id: `customs-${vehicle.id}`,
                type: 'customs-delay',
                vehicleId: vehicle.id,
                vehicleName,
                days: daysInCustoms,
                description: `Vehicle has been in customs for ${daysInCustoms} days, exceeding the 10-day threshold`,
                priority: daysInCustoms > 15 ? 'high' : 'medium',
              });
            }
          }
        }

        // Check for workshop delays
        if (vehicle.status === 'in-workshop') {
          const updatedAt = safeDateConversion(vehicle.updatedAt);
          if (updatedAt) {
            const daysInWorkshop = Math.floor((now.getTime() - updatedAt.getTime()) / (1000 * 60 * 60 * 24));
            if (daysInWorkshop > 21) {
              actionItems.push({
                id: `workshop-${vehicle.id}`,
                type: 'workshop-delay',
                vehicleId: vehicle.id,
                vehicleName,
                days: daysInWorkshop,
                description: `Vehicle has been in workshop for ${daysInWorkshop} days, exceeding the 21-day threshold`,
                priority: daysInWorkshop > 30 ? 'high' : 'medium',
              });
            }
          }
        }

        // Check for unsold aging
        if (vehicle.status === 'for-sale') {
          const updatedAt = safeDateConversion(vehicle.updatedAt);
          if (updatedAt) {
            const daysForSale = Math.floor((now.getTime() - updatedAt.getTime()) / (1000 * 60 * 60 * 24));
            if (daysForSale > 90) {
              actionItems.push({
                id: `aging-${vehicle.id}`,
                type: 'unsold-aging',
                vehicleId: vehicle.id,
                vehicleName,
                days: daysForSale,
                description: `Vehicle has been unsold for ${daysForSale} days, exceeding the 90-day threshold`,
                priority: daysForSale > 120 ? 'high' : 'medium',
              });
            }
          }
        }
      }

      // Sort by priority and days
      actionItems.sort((a, b) => {
        const priorityOrder = { high: 3, medium: 2, low: 1 };
        if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
          return priorityOrder[b.priority] - priorityOrder[a.priority];
        }
        return b.days - a.days;
      });

      return actionItems;
    } catch (error) {
      console.error('Error fetching action items:', error);
      throw new Error('Failed to fetch action items');
    }
  },
};

// ==================== ACTIVITY OPERATIONS ====================

export const activityService = {
  // Log a new activity
  async logActivity(activity: Omit<RecentActivity, 'id'>): Promise<void> {
    try {
      const activityData = {
        ...activity,
        timestamp: Timestamp.fromDate(activity.timestamp),
      };
      
      const cleanedActivityData = cleanUndefinedValues(activityData);
      await addDoc(collection(db, COLLECTIONS.ACTIVITIES), cleanedActivityData);
    } catch (error) {
      console.error('Error logging activity:', error);
      // Don't throw error for activity logging to avoid breaking main operations
    }
  },

  // Get recent activities
  async getRecentActivities(limitCount: number = 10): Promise<RecentActivity[]> {
    try {
      const q = query(
        collection(db, COLLECTIONS.ACTIVITIES),
        orderBy('timestamp', 'desc'),
        limit(limitCount)
      );
      
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => {
        const data = doc.data();
        return convertTimestamps({ id: doc.id, ...data }) as RecentActivity;
      });
    } catch (error) {
      console.error('Error fetching activities:', error);
      throw new Error('Failed to fetch recent activities');
    }
  },
};

// ==================== REPORT OPERATIONS ====================

export const reportService = {
  // Generate sales performance report
  async getSalesPerformanceReport(startDate: Date, endDate: Date): Promise<SalesPerformanceReport> {
    try {
      const vehiclesSnapshot = await getDocs(collection(db, COLLECTIONS.VEHICLES));
      const vehicles = vehiclesSnapshot.docs.map(doc => {
        const data = doc.data();
        return convertTimestamps({ id: doc.id, ...data }) as Vehicle;
      });

      // Get vehicles that are sold, either by status or by having sale details
      const soldVehicles = vehicles.filter(v => {
        // Check if vehicle is marked as sold by status
        if (v.status === 'sold') {
          // If it has sale details with a date, check the date range
          if (v.saleDetails?.saleDate) {
            return v.saleDetails.saleDate >= startDate && v.saleDetails.saleDate <= endDate;
          }
          // If no sale date, include it regardless of date (sold vehicles should always be included)
          return true;
        }
        // Check if vehicle has sale details with date in range
        return v.saleDetails?.saleDate && 
               v.saleDetails.saleDate >= startDate && 
               v.saleDetails.saleDate <= endDate;
      });


      const reportVehicles = soldVehicles.map(vehicle => {
        const totalCost = Array.isArray(vehicle.costs) 
          ? vehicle.costs.reduce((sum, cost) => sum + cost.ngnAmount, 0)
          : 0;
        
        // Use sale details if available, otherwise use listing price or total cost as fallback
        const salePrice = vehicle.saleDetails?.finalSalePrice || 
                         vehicle.saleDetails?.listingPrice || 
                         totalCost; // Fallback to cost if no sale price
        
        const profitMargin = salePrice > 0 ? ((salePrice - totalCost) / salePrice) * 100 : 0;
        const roi = totalCost > 0 ? ((salePrice - totalCost) / totalCost) * 100 : 0;
        
        // Use sale date if available, otherwise use updatedAt as fallback
        const saleDate = vehicle.saleDetails?.saleDate || vehicle.updatedAt;

        return {
          vehicleId: vehicle.id,
          vehicleName: `${vehicle.year} ${vehicle.make} ${vehicle.model}`,
          totalCost,
          salePrice,
          profitMargin,
          roi,
          saleDate,
        };
      });

      const summary = {
        totalRevenue: reportVehicles.reduce((sum, v) => sum + v.salePrice, 0),
        totalCostOfGoodsSold: reportVehicles.reduce((sum, v) => sum + v.totalCost, 0),
        averageProfitMargin: reportVehicles.length > 0 
          ? reportVehicles.reduce((sum, v) => sum + v.profitMargin, 0) / reportVehicles.length 
          : 0,
        averageROI: reportVehicles.length > 0 
          ? reportVehicles.reduce((sum, v) => sum + v.roi, 0) / reportVehicles.length 
          : 0,
      };

      return {
        period: { start: startDate, end: endDate },
        vehicles: reportVehicles,
        summary,
      };
    } catch (error) {
      console.error('Error generating sales performance report:', error);
      throw new Error('Failed to generate sales performance report');
    }
  },

  // Generate inventory aging report
  async getInventoryAgingReport(): Promise<InventoryAgingReport> {
    try {
      const vehiclesSnapshot = await getDocs(collection(db, COLLECTIONS.VEHICLES));
      const vehicles = vehiclesSnapshot.docs.map(doc => {
        const data = doc.data();
        return convertTimestamps({ id: doc.id, ...data }) as Vehicle;
      });

      const now = new Date();
      const reportVehicles = vehicles
        .filter(v => v.status !== 'sold' && v.status !== 'archived')
        .map(vehicle => {
          const daysInInventory = calculateDaysInInventory(vehicle);
          const totalCost = Array.isArray(vehicle.costs) 
          ? vehicle.costs.reduce((sum, cost) => sum + cost.ngnAmount, 0)
          : 0;

          return {
            vehicleId: vehicle.id,
            vehicleName: `${vehicle.year} ${vehicle.make} ${vehicle.model}`,
            status: vehicle.status,
            daysInInventory,
            totalCost,
            listingPrice: vehicle.saleDetails?.listingPrice,
          };
        });

      const vehiclesOver90Days = reportVehicles.filter(v => v.daysInInventory > 90).length;
      const averageAge = reportVehicles.length > 0 
        ? reportVehicles.reduce((sum, v) => sum + v.daysInInventory, 0) / reportVehicles.length 
        : 0;

      return {
        period: { start: now, end: now }, // Current snapshot
        vehicles: reportVehicles,
        summary: {
          totalVehicles: reportVehicles.length,
          averageAge: Math.round(averageAge),
          vehiclesOver90Days,
        },
      };
    } catch (error) {
      console.error('Error generating inventory aging report:', error);
      throw new Error('Failed to generate inventory aging report');
    }
  },

  // Generate expense breakdown report
  async getExpenseBreakdownReport(startDate: Date, endDate: Date): Promise<ExpenseBreakdownReport> {
    try {
      const costsQuery = query(
        collection(db, COLLECTIONS.COSTS),
        where('date', '>=', Timestamp.fromDate(startDate)),
        where('date', '<=', Timestamp.fromDate(endDate))
      );
      
      const costsSnapshot = await getDocs(costsQuery);
      const costs = costsSnapshot.docs.map(doc => {
        const data = doc.data();
        return convertTimestamps({ id: doc.id, ...data }) as CostEntry;
      });

      // Group costs by category
      const categoryTotals = new Map<string, { amount: number; vehicleIds: Set<string> }>();
      
      costs.forEach(cost => {
        const existing = categoryTotals.get(cost.category) || { amount: 0, vehicleIds: new Set() };
        existing.amount += cost.ngnAmount;
        existing.vehicleIds.add(cost.vehicleId);
        categoryTotals.set(cost.category, existing);
      });

      const totalExpenses = costs.reduce((sum, cost) => sum + cost.ngnAmount, 0);
      const uniqueVehicles = new Set(costs.map(cost => cost.vehicleId)).size;

      const categories = Array.from(categoryTotals.entries()).map(([category, data]) => ({
        category: category as any,
        totalAmount: data.amount,
        percentage: totalExpenses > 0 ? (data.amount / totalExpenses) * 100 : 0,
        vehicleCount: data.vehicleIds.size,
      }));

      return {
        period: { start: startDate, end: endDate },
        categories,
        summary: {
          totalExpenses,
          averagePerVehicle: uniqueVehicles > 0 ? totalExpenses / uniqueVehicles : 0,
        },
      };
    } catch (error) {
      console.error('Error generating expense breakdown report:', error);
      throw new Error('Failed to generate expense breakdown report');
    }
  },
};

// ==================== REAL-TIME SUBSCRIPTIONS ====================

export const realtimeService = {
  // Subscribe to vehicles changes
  subscribeToVehicles(
    callback: (vehicles: Vehicle[]) => void,
    filters?: VehicleFilters
  ): () => void {
    let q: Query = collection(db, COLLECTIONS.VEHICLES);
    
    if (filters?.status?.length) {
      q = query(q, where('status', 'in', filters.status));
    }
    
    q = query(q, orderBy('createdAt', 'desc'));
    
    return onSnapshot(q, (snapshot: QuerySnapshot) => {
      const vehicles = snapshot.docs.map(doc => {
        const data = doc.data();
        return convertTimestamps({ id: doc.id, ...data }) as Vehicle;
      });
      
      // Apply client-side filters
      let filteredVehicles = vehicles;
      
      if (filters?.make?.length) {
        filteredVehicles = filteredVehicles.filter(vehicle => 
          filters.make!.includes(vehicle.make)
        );
      }
      
      if (filters?.search) {
        const searchTerm = filters.search.toLowerCase();
        filteredVehicles = filteredVehicles.filter(vehicle =>
          vehicle.vin.toLowerCase().includes(searchTerm) ||
          vehicle.make.toLowerCase().includes(searchTerm) ||
          vehicle.model.toLowerCase().includes(searchTerm) ||
          `${vehicle.make} ${vehicle.model}`.toLowerCase().includes(searchTerm)
        );
      }
      
      callback(filteredVehicles);
    });
  },

  // Subscribe to recent activities
  subscribeToActivities(
    callback: (activities: RecentActivity[]) => void,
    limitCount: number = 10
  ): () => void {
    const q = query(
      collection(db, COLLECTIONS.ACTIVITIES),
      orderBy('timestamp', 'desc'),
      limit(limitCount)
    );
    
    return onSnapshot(q, (snapshot: QuerySnapshot) => {
      const activities = snapshot.docs.map(doc => {
        const data = doc.data();
        return convertTimestamps({ id: doc.id, ...data }) as RecentActivity;
      });
      
      callback(activities);
    });
  },
};
