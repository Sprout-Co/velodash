// Utility Functions
// Helper functions for VelocityDash

import { type ClassValue, clsx } from 'clsx';

// Class name utility
export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

// Currency formatting
export function formatCurrency(amount: number, currency: string = 'NGN'): string {
  const formatter = new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });
  
  return formatter.format(amount);
}

// Number formatting
export function formatNumber(number: number): string {
  return new Intl.NumberFormat('en-NG').format(number);
}

// Percentage formatting
export function formatPercentage(value: number, decimals: number = 1): string {
  return `${value.toFixed(decimals)}%`;
}

// Date formatting
export function formatDate(date: Date | string | any): string {
  // Handle various date formats
  let dateObj: Date;
  
  if (date instanceof Date) {
    dateObj = date;
  } else if (typeof date === 'string') {
    dateObj = new Date(date);
  } else if (date && typeof date === 'object' && date.toDate) {
    // Handle Firestore Timestamp objects
    dateObj = date.toDate();
  } else if (date && typeof date === 'object' && date.seconds) {
    // Handle Firestore Timestamp-like objects
    dateObj = new Date(date.seconds * 1000);
  } else if (typeof date === 'number') {
    dateObj = new Date(date);
  } else {
    return 'Invalid Date';
  }
  
  // Check if the date is valid
  if (!dateObj || !(dateObj instanceof Date) || isNaN(dateObj.getTime())) {
    return 'Invalid Date';
  }
  
  return new Intl.DateTimeFormat('en-NG', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(dateObj);
}

// Date and time formatting
export function formatDateTime(date: Date | string | any): string {
  // Handle various date formats
  let dateObj: Date;
  
  if (date instanceof Date) {
    dateObj = date;
  } else if (typeof date === 'string') {
    dateObj = new Date(date);
  } else if (date && typeof date === 'object' && date.toDate) {
    // Handle Firestore Timestamp objects
    dateObj = date.toDate();
  } else if (date && typeof date === 'object' && date.seconds) {
    // Handle Firestore Timestamp-like objects
    dateObj = new Date(date.seconds * 1000);
  } else if (typeof date === 'number') {
    dateObj = new Date(date);
  } else {
    return 'Invalid Date';
  }
  
  // Check if the date is valid
  if (!dateObj || !(dateObj instanceof Date) || isNaN(dateObj.getTime())) {
    return 'Invalid Date';
  }
  
  return new Intl.DateTimeFormat('en-NG', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(dateObj);
}

// Relative time formatting
export function formatRelativeTime(date: Date | string | any): string {
  // Handle various date formats
  let dateObj: Date;
  
  if (date instanceof Date) {
    dateObj = date;
  } else if (typeof date === 'string') {
    dateObj = new Date(date);
  } else if (date && typeof date === 'object' && date.toDate) {
    // Handle Firestore Timestamp objects
    dateObj = date.toDate();
  } else if (date && typeof date === 'object' && date.seconds) {
    // Handle Firestore Timestamp-like objects
    dateObj = new Date(date.seconds * 1000);
  } else if (typeof date === 'number') {
    dateObj = new Date(date);
  } else {
    return 'Invalid Date';
  }
  
  // Check if the date is valid
  if (!dateObj || !(dateObj instanceof Date) || isNaN(dateObj.getTime())) {
    return 'Invalid Date';
  }
  
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - dateObj.getTime()) / 1000);
  
  if (diffInSeconds < 60) {
    return 'Just now';
  }
  
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) {
    return `${diffInMinutes} minute${diffInMinutes === 1 ? '' : 's'} ago`;
  }
  
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) {
    return `${diffInHours} hour${diffInHours === 1 ? '' : 's'} ago`;
  }
  
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 7) {
    return `${diffInDays} day${diffInDays === 1 ? '' : 's'} ago`;
  }
  
  return formatDate(dateObj);
}

// Currency conversion
export function convertCurrency(
  amount: number,
  fromCurrency: string,
  toCurrency: string,
  exchangeRate: number
): number {
  if (fromCurrency === toCurrency) {
    return amount;
  }
  
  // Convert to NGN first, then to target currency
  if (fromCurrency !== 'NGN') {
    amount = amount * exchangeRate;
  }
  
  if (toCurrency !== 'NGN') {
    amount = amount / exchangeRate;
  }
  
  return Math.round(amount * 100) / 100; // Round to 2 decimal places
}

// VIN validation
export function isValidVIN(vin: string): boolean {
  // Basic VIN validation (17 characters, alphanumeric except I, O, Q)
  const vinRegex = /^[A-HJ-NPR-Z0-9]{17}$/i;
  return vinRegex.test(vin);
}

// Generate unique ID
export function generateId(): string {
  return Math.random().toString(36).substr(2, 9);
}

// Calculate age in days
export function calculateAgeInDays(date: Date | string | any): number {
  // Handle various date formats
  let dateObj: Date;
  
  if (date instanceof Date) {
    dateObj = date;
  } else if (typeof date === 'string') {
    dateObj = new Date(date);
  } else if (date && typeof date === 'object' && date.toDate) {
    // Handle Firestore Timestamp objects
    dateObj = date.toDate();
  } else if (date && typeof date === 'object' && date.seconds) {
    // Handle Firestore Timestamp-like objects
    dateObj = new Date(date.seconds * 1000);
  } else if (typeof date === 'number') {
    dateObj = new Date(date);
  } else {
    console.warn('Invalid date format in calculateAgeInDays:', date);
    return 0;
  }
  
  // Check if the date is valid
  if (!dateObj || !(dateObj instanceof Date) || isNaN(dateObj.getTime())) {
    console.warn('Invalid date object in calculateAgeInDays:', dateObj);
    return 0;
  }
  
  const now = new Date();
  const diffInTime = now.getTime() - dateObj.getTime();
  return Math.floor(diffInTime / (1000 * 3600 * 24));
}

// Calculate days in inventory
export function calculateDaysInInventory(date: Date | string | any): number {
  return calculateAgeInDays(date);
}

// Calculate profit metrics
export function calculateProfitMetrics(
  totalCost: number,
  salePrice: number
): {
  grossProfit: number;
  profitMargin: number;
  roi: number;
} {
  const grossProfit = salePrice - totalCost;
  const profitMargin = salePrice > 0 ? (grossProfit / salePrice) * 100 : 0;
  const roi = totalCost > 0 ? (grossProfit / totalCost) * 100 : 0;
  
  return {
    grossProfit,
    profitMargin: Math.round(profitMargin * 100) / 100,
    roi: Math.round(roi * 100) / 100,
  };
}

// Debounce function
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

// Throttle function
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;
  
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}

// Local storage helpers
export function getFromLocalStorage<T>(key: string, defaultValue: T): T {
  if (typeof window === 'undefined') {
    return defaultValue;
  }
  
  try {
    const item = window.localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch {
    return defaultValue;
  }
}

export function setToLocalStorage<T>(key: string, value: T): void {
  if (typeof window === 'undefined') {
    return;
  }
  
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Handle storage quota exceeded
  }
}

// File size formatting
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// Email validation
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// Phone number validation (Nigerian format)
export function isValidPhoneNumber(phone: string): boolean {
  const phoneRegex = /^(\+234|0)?[789][01]\d{8}$/;
  return phoneRegex.test(phone.replace(/\s/g, ''));
}
