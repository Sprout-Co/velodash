// Debug utilities for troubleshooting Firestore data issues

export function debugDateConversion(data: any, path: string = 'root'): void {
  if (!data) {
    console.log(`[${path}]: null/undefined`);
    return;
  }

  if (data instanceof Date) {
    console.log(`[${path}]: Date object - ${data.toISOString()} (valid: ${!isNaN(data.getTime())})`);
    return;
  }

  if (typeof data === 'string') {
    const date = new Date(data);
    console.log(`[${path}]: String - "${data}" -> Date: ${date.toISOString()} (valid: ${!isNaN(date.getTime())})`);
    return;
  }

  if (typeof data === 'object') {
    if (Array.isArray(data)) {
      console.log(`[${path}]: Array with ${data.length} items`);
      data.forEach((item, index) => {
        debugDateConversion(item, `${path}[${index}]`);
      });
    } else {
      console.log(`[${path}]: Object with keys: ${Object.keys(data).join(', ')}`);
      Object.keys(data).forEach(key => {
        debugDateConversion(data[key], `${path}.${key}`);
      });
    }
  } else {
    console.log(`[${path}]: ${typeof data} - ${data}`);
  }
}

export function validateVehicleData(vehicle: any): string[] {
  const errors: string[] = [];

  if (!vehicle) {
    errors.push('Vehicle data is null or undefined');
    return errors;
  }

  // Check required fields
  const requiredFields = ['id', 'vin', 'make', 'model', 'year', 'color', 'trim', 'mileage', 'status'];
  requiredFields.forEach(field => {
    if (!vehicle[field]) {
      errors.push(`Missing required field: ${field}`);
    }
  });

  // Check acquisition details
  if (!vehicle.acquisitionDetails) {
    errors.push('Missing acquisitionDetails');
  } else {
    const requiredAcquisitionFields = ['sourceChannel', 'purchaseDate', 'purchasePrice', 'currency'];
    requiredAcquisitionFields.forEach(field => {
      if (!vehicle.acquisitionDetails[field]) {
        errors.push(`Missing required acquisition field: ${field}`);
      }
    });

    // Check purchase date
    if (vehicle.acquisitionDetails.purchaseDate) {
      const date = new Date(vehicle.acquisitionDetails.purchaseDate);
      if (isNaN(date.getTime())) {
        errors.push(`Invalid purchase date: ${vehicle.acquisitionDetails.purchaseDate}`);
      }
    }
  }

  // Check dates
  const dateFields = ['createdAt', 'updatedAt'];
  dateFields.forEach(field => {
    if (vehicle[field]) {
      const date = new Date(vehicle[field]);
      if (isNaN(date.getTime())) {
        errors.push(`Invalid ${field}: ${vehicle[field]}`);
      }
    }
  });

  // Check costs array
  if (vehicle.costs && Array.isArray(vehicle.costs)) {
    vehicle.costs.forEach((cost: any, index: number) => {
      if (cost.date) {
        const date = new Date(cost.date);
        if (isNaN(date.getTime())) {
          errors.push(`Invalid cost[${index}].date: ${cost.date}`);
        }
      }
      if (cost.createdAt) {
        const date = new Date(cost.createdAt);
        if (isNaN(date.getTime())) {
          errors.push(`Invalid cost[${index}].createdAt: ${cost.createdAt}`);
        }
      }
    });
  }

  return errors;
}

// Usage in browser console:
// import { debugDateConversion, validateVehicleData } from './debugUtils';
// debugDateConversion(vehicleData);
// const errors = validateVehicleData(vehicleData);
// console.log('Validation errors:', errors);
