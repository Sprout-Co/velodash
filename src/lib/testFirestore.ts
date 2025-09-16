// Test script to verify Firestore integration
// Run this in browser console to test the connection

import { vehicleService } from './firestore';
import { VehicleFormData } from '@/types';

export async function testVehicleCreation() {
  console.log('🧪 Testing vehicle creation...');
  
  const testVehicle: VehicleFormData = {
    vin: 'TEST12345678901234',
    make: 'Toyota',
    model: 'Camry',
    year: 2023,
    color: 'Blue',
    trim: 'LE',
    mileage: 1000,
    acquisitionDetails: {
      sourceChannel: 'Test Channel',
      purchaseDate: '2023-12-01',
      purchasePrice: 25000,
      currency: 'USD',
      auctionLot: '', // Empty string - should be handled properly
      listingUrl: '', // Empty string - should be handled properly
    },
  };

  try {
    const result = await vehicleService.createVehicle(testVehicle);
    console.log('✅ Vehicle created successfully:', result);
    return result;
  } catch (error) {
    console.error('❌ Vehicle creation failed:', error);
    throw error;
  }
}

export async function testVehicleUpdate(vehicleId: string) {
  console.log('🧪 Testing vehicle update...');
  
  const updateData: VehicleFormData = {
    vin: 'TEST12345678901234',
    make: 'Toyota',
    model: 'Camry',
    year: 2023,
    color: 'Red', // Changed color
    trim: 'XLE', // Changed trim
    mileage: 1500, // Changed mileage
    acquisitionDetails: {
      sourceChannel: 'Updated Test Channel',
      purchaseDate: '2023-12-01',
      purchasePrice: 26000, // Changed price
      currency: 'USD',
      auctionLot: 'A12345', // Now has a value
      listingUrl: 'https://example.com/listing', // Now has a value
    },
  };

  try {
    const result = await vehicleService.updateVehicle(vehicleId, updateData);
    console.log('✅ Vehicle updated successfully:', result);
    return result;
  } catch (error) {
    console.error('❌ Vehicle update failed:', error);
    throw error;
  }
}

export async function testVehicleDeletion(vehicleId: string) {
  console.log('🧪 Testing vehicle deletion...');
  
  try {
    await vehicleService.deleteVehicle(vehicleId);
    console.log('✅ Vehicle deleted successfully');
    return true;
  } catch (error) {
    console.error('❌ Vehicle deletion failed:', error);
    throw error;
  }
}

// Usage in browser console:
// import { testVehicleCreation, testVehicleUpdate, testVehicleDeletion } from './testFirestore';
// const vehicle = await testVehicleCreation();
// await testVehicleUpdate(vehicle.id);
// await testVehicleDeletion(vehicle.id);
