// VelocityDash Type Definitions
// Core types for the vehicle management platform

export type VehicleStatus = 
  | 'sourced'
  | 'in-transit'
  | 'in-customs'
  | 'in-workshop'
  | 'for-sale'
  | 'sale-pending'
  | 'sold'
  | 'archived';

export type CostCategory = 
  | 'purchase-price'
  | 'shipping'
  | 'customs-duty'
  | 'terminal-charges'
  | 'transportation'
  | 'mechanical-parts'
  | 'body-parts'
  | 'mechanical-labor'
  | 'bodywork-labor'
  | 'detailing'
  | 'marketing'
  | 'overhead-allocation'
  | 'others';

export type Currency = 'USD' | 'EUR' | 'GBP' | 'CAD' | 'NGN';

export interface GoogleDriveFileReference {
  id: string;
  name: string;
  webViewLink: string;
  webContentLink: string;
  mimeType: string;
  size: string;
  createdTime: string;
  modifiedTime: string;
}

export interface CloudinaryFileReference {
  id: string;
  publicId: string;
  name: string;
  url: string;
  format: string;
  resourceType: 'image' | 'video' | 'raw';
  size: number;
  width?: number;
  height?: number;
  createdAt: string;
  vehicleId: string;
  type: 'photos' | 'videos' | 'documents';
  thumbnailUrl: string;
  downloadUrl: string;
}

// Union type for file references (supports both Google Drive and Cloudinary)
export type FileReference = GoogleDriveFileReference | CloudinaryFileReference;

export interface Vehicle {
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
    purchaseDate: Date | string | any; // Flexible date handling for Firestore
    purchasePrice: number;
    currency: Currency;
    auctionLot?: string;
    listingUrl?: string;
  };
  media: {
    photos: FileReference[];
    videos: FileReference[];
  };
  documents: {
    billOfLading?: FileReference;
    customsDeclaration?: FileReference;
    title?: FileReference;
    purchaseInvoice?: FileReference;
    repairReceipts: FileReference[];
  };
  costs: CostEntry[];
  saleDetails?: {
    listingPrice?: number;
    finalSalePrice?: number;
    saleDate: Date | string | any; // Flexible date handling for Firestore
    notes?: string;
  };
  createdAt: Date | string | any; // Flexible date handling for Firestore
  updatedAt: Date | string | any; // Flexible date handling for Firestore
}

export interface CostEntry {
  id: string;
  vehicleId: string;
  date: Date | string | any; // Flexible date handling for Firestore
  category: CostCategory;
  description: string;
  amount: number;
  currency: Currency;
  createdAt: Date | string | any; // Flexible date handling for Firestore
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'standard';
  createdAt: Date | string | any; // Flexible date handling for Firestore
  lastLoginAt?: Date | string | any; // Flexible date handling for Firestore
}

export interface DashboardKPIs {
  liveInventoryCount: number;
  capitalDeployed: number;
  readyForSaleValue: number;
  grossProfit: number;
  netProfit30Days: number;
}

export interface InventoryStatusFunnel {
  sourced: number;
  inTransit: number;
  inCustoms: number;
  inWorkshop: number;
  forSale: number;
  sold: number;
}

export interface ActionRequired {
  id: string;
  type: 'customs-delay' | 'workshop-delay' | 'unsold-aging';
  vehicleId: string;
  vehicleName: string;
  days: number;
  description: string;
  priority: 'low' | 'medium' | 'high';
}

export interface RecentActivity {
  id: string;
  userId: string;
  userName: string;
  action: string;
  vehicleId?: string;
  vehicleName?: string;
  timestamp: Date | string | any; // Flexible date handling for Firestore
}

export interface SalesPerformanceReport {
  period: {
    start: Date | string | any; // Flexible date handling for Firestore
    end: Date | string | any; // Flexible date handling for Firestore
  };
  vehicles: Array<{
    vehicleId: string;
    vehicleName: string;
    totalCost: number;
    salePrice: number;
    profitMargin: number;
    roi: number;
    saleDate: Date | string | any; // Flexible date handling for Firestore
  }>;
  summary: {
    totalRevenue: number;
    totalCostOfGoodsSold: number;
    averageProfitMargin: number;
    averageROI: number;
  };
}

export interface InventoryAgingReport {
  period: {
    start: Date | string | any; // Flexible date handling for Firestore
    end: Date | string | any; // Flexible date handling for Firestore
  };
  vehicles: Array<{
    vehicleId: string;
    vehicleName: string;
    status: VehicleStatus;
    daysInInventory: number;
    totalCost: number;
    listingPrice?: number;
  }>;
  summary: {
    totalVehicles: number;
    averageAge: number;
    vehiclesOver90Days: number;
  };
}

export interface ExpenseBreakdownReport {
  period: {
    start: Date | string | any; // Flexible date handling for Firestore
    end: Date | string | any; // Flexible date handling for Firestore
  };
  categories: Array<{
    category: CostCategory;
    totalAmount: number;
    percentage: number;
    vehicleCount: number;
  }>;
  summary: {
    totalExpenses: number;
    averagePerVehicle: number;
  };
}

// Form types
export interface VehicleFormData {
  vin: string;
  make: string;
  model: string;
  year: number;
  color: string;
  mileage: number;
  acquisitionDetails: {
    sourceChannel: string;
    purchaseDate: string;
    purchasePrice: number;
    currency: Currency;
    auctionLot?: string;
    listingUrl?: string;
  };
}

export interface CostFormData {
  date: string;
  category: CostCategory;
  description: string;
  amount: number;
  currency: Currency;
  exchangeRate?: number;
}

export interface SaleFormData {
  listingPrice?: number;
  finalSalePrice?: number;
  saleDate: string;
  notes?: string;
}

// API Response types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Filter types
export interface VehicleFilters {
  status?: VehicleStatus[];
  make?: string[];
  year?: {
    min?: number;
    max?: number;
  };
  priceRange?: {
    min?: number;
    max?: number;
  };
  search?: string;
}

export interface DateRange {
  start: Date | string | any; // Flexible date handling for Firestore
  end: Date | string | any; // Flexible date handling for Firestore
}

// Chart data types
export interface ChartDataPoint {
  label: string;
  value: number;
  color?: string;
}

export interface TimeSeriesDataPoint {
  date: string;
  value: number;
}

// Notification types
export interface Notification {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error';
  title: string;
  message: string;
  timestamp: Date | string | any; // Flexible date handling for Firestore
  read: boolean;
}
