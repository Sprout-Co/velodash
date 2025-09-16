// VelocityDash Constants
// Application constants and configuration

export const APP_NAME = 'VelocityDash';
export const APP_VERSION = '1.0.0';

// Vehicle Status Options
export const VEHICLE_STATUS_OPTIONS = [
  { value: 'sourced', label: 'Sourced', color: '#4299E1' },
  { value: 'in-transit', label: 'In Transit', color: '#D69E2E' },
  { value: 'in-customs', label: 'In Customs', color: '#D69E2E' },
  { value: 'in-workshop', label: 'In Workshop', color: '#4299E1' },
  { value: 'for-sale', label: 'For Sale', color: '#38A169' },
  { value: 'sale-pending', label: 'Sale Pending', color: '#D69E2E' },
  { value: 'sold', label: 'Sold', color: '#A0AEC0' },
  { value: 'archived', label: 'Archived', color: '#A0AEC0' },
] as const;

// Cost Categories
export const COST_CATEGORIES = [
  { value: 'purchase-price', label: 'Purchase Price' },
  { value: 'shipping', label: 'Shipping' },
  { value: 'customs-duty', label: 'Customs Duty' },
  { value: 'terminal-charges', label: 'Terminal Charges' },
  { value: 'transportation', label: 'Transportation' },
  { value: 'mechanical-parts', label: 'Mechanical Parts' },
  { value: 'body-parts', label: 'Body Parts' },
  { value: 'mechanical-labor', label: 'Mechanical Labor' },
  { value: 'bodywork-labor', label: 'Bodywork Labor' },
  { value: 'detailing', label: 'Detailing' },
  { value: 'marketing', label: 'Marketing' },
  { value: 'overhead-allocation', label: 'Overhead Allocation' },
] as const;

// Currency Options
export const CURRENCY_OPTIONS = [
  { value: 'NGN', label: 'Nigerian Naira (₦)', symbol: '₦' },
  { value: 'USD', label: 'US Dollar ($)', symbol: '$' },
  { value: 'EUR', label: 'Euro (€)', symbol: '€' },
  { value: 'GBP', label: 'British Pound (£)', symbol: '£' },
  { value: 'CAD', label: 'Canadian Dollar (C$)', symbol: 'C$' },
] as const;

// Vehicle Makes (Common in Nigeria)
export const VEHICLE_MAKES = [
  'Toyota',
  'Honda',
  'Nissan',
  'Hyundai',
  'Kia',
  'Mazda',
  'Ford',
  'Chevrolet',
  'BMW',
  'Mercedes-Benz',
  'Audi',
  'Volkswagen',
  'Lexus',
  'Acura',
  'Infiniti',
  'Genesis',
  'Subaru',
  'Mitsubishi',
  'Suzuki',
  'Isuzu',
  'Other',
] as const;

// Source Channels
export const SOURCE_CHANNELS = [
  'Adesa Auction Canada',
  'Manheim Auction USA',
  'Copart Auction USA',
  'Local Owner Lagos',
  'Local Owner Abuja',
  'Local Owner Port Harcourt',
  'Dealer Trade',
  'Bank Repossession',
  'Insurance Total Loss',
  'Other',
] as const;

// Pagination
export const PAGINATION_LIMITS = [10, 25, 50, 100] as const;
export const DEFAULT_PAGINATION_LIMIT = 25;

// File Upload
export const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
export const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
export const ALLOWED_DOCUMENT_TYPES = [
  'application/pdf',
  'image/jpeg',
  'image/png',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
];


// Action Required Thresholds
export const ACTION_THRESHOLDS = {
  CUSTOMS_DELAY_DAYS: 10,
  WORKSHOP_DELAY_DAYS: 21,
  UNSOLD_AGING_DAYS: 90,
} as const;

// Chart Colors
export const CHART_COLORS = [
  '#38A169', // Velocity Green
  '#4299E1', // Signal Blue
  '#D69E2E', // Amber
  '#E53E3E', // Crimson Red
  '#9F7AEA', // Purple
  '#ED8936', // Orange
  '#48BB78', // Green
  '#38B2AC', // Teal
  '#3182CE', // Blue
  '#805AD5', // Violet
] as const;

// API Endpoints
export const API_ENDPOINTS = {
  VEHICLES: '/api/vehicles',
  COSTS: '/api/costs',
  UPLOAD: '/api/upload',
} as const;

// Local Storage Keys
export const STORAGE_KEYS = {
  USER_PREFERENCES: 'velocity-dash-user-preferences',
  DASHBOARD_FILTERS: 'velocity-dash-dashboard-filters',
  VEHICLE_FILTERS: 'velocity-dash-vehicle-filters',
} as const;

// Notification Types
export const NOTIFICATION_TYPES = {
  SUCCESS: 'success',
  ERROR: 'error',
  WARNING: 'warning',
  INFO: 'info',
} as const;

// User Roles
export const USER_ROLES = {
  ADMIN: 'admin',
  STANDARD: 'standard',
} as const;

// Validation Rules
export const VALIDATION_RULES = {
  VIN_LENGTH: 17,
  MIN_YEAR: 1990,
  MAX_YEAR: new Date().getFullYear() + 1,
  MIN_MILEAGE: 0,
  MAX_MILEAGE: 999999,
  MIN_PRICE: 0,
  MAX_PRICE: 999999999,
} as const;
