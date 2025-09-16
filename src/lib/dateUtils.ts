// Date Utility Functions
// Handle various date formats from Firestore and other sources

export function safeDateConversion(date: any): Date | null {
  if (!date) return null;
  
  if (date instanceof Date) {
    return isNaN(date.getTime()) ? null : date;
  }
  
  if (date && typeof date === 'object' && date.toDate) {
    // Firestore Timestamp
    return date.toDate();
  }
  
  if (date && typeof date === 'object' && date.seconds) {
    // Timestamp-like object
    return new Date(date.seconds * 1000);
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
}

export function safeDateToISOString(date: any): string {
  const dateObj = safeDateConversion(date);
  if (!dateObj) return '';
  return dateObj.toISOString().split('T')[0];
}

export function safeDateToISOStringFull(date: any): string {
  const dateObj = safeDateConversion(date);
  if (!dateObj) return '';
  return dateObj.toISOString();
}
