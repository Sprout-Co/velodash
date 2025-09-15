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
  | 'overhead-allocation';

export type Currency = 'USD' | 'EUR' | 'GBP' | 'CAD' | 'NGN';

export interface Vehicle {
  id: string;
  vin: string;
  make: string;
  model: string;
  year: number;
  color: string;
  trim: string;
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

export interface CostEntry {
  id: string;
  vehicleId: string;
  date: Date;
  category: CostCategory;
  description: string;
  amount: number;
  currency: Currency;
  ngnAmount: number; // Converted amount
  exchangeRate: number;
  createdAt: Date;
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'standard';
  createdAt: Date;
  lastLoginAt?: Date;
}

export interface DashboardKPIs {
  liveInventoryCount: number;
  capitalDeployed: number;
  readyForSaleValue: number;
  thirtyDayGrossProfit: number;
}

export interface InventoryStatusFunnel {
  sourced: number;
  inTransit: number;
  inCustoms: number;
  inWorkshop: number;
  forSale: number;
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
  timestamp: Date;
}

export interface SalesPerformanceReport {
  period: {
    start: Date;
    end: Date;
  };
  vehicles: Array<{
    vehicleId: string;
    vehicleName: string;
    totalCost: number;
    salePrice: number;
    grossProfit: number;
    profitMargin: number;
    roi: number;
    saleDate: Date;
  }>;
  summary: {
    totalRevenue: number;
    totalCostOfGoodsSold: number;
    totalGrossProfit: number;
    averageProfitMargin: number;
    averageROI: number;
  };
}

export interface InventoryAgingReport {
  period: {
    start: Date;
    end: Date;
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
    start: Date;
    end: Date;
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
  trim: string;
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
  exchangeRate: number;
}

export interface SaleFormData {
  listingPrice: number;
  finalSalePrice: number;
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
  start: Date;
  end: Date;
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
  timestamp: Date;
  read: boolean;
}
