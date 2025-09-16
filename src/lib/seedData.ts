// Seed data script for Firestore
// Run this to populate the database with sample data for testing

import { 
  vehicleService, 
  costService, 
  activityService 
} from './firestore';
import { VehicleFormData, CostFormData } from '@/types';

const sampleVehicles: VehicleFormData[] = [
  {
    vin: '1HGBH41JXMN109186',
    make: 'Toyota',
    model: 'Camry',
    year: 2021,
    color: 'Silver',
    trim: 'XLE',
    mileage: 15000,
    acquisitionDetails: {
      sourceChannel: 'Adesa Auction Canada',
      purchaseDate: '2023-10-15',
      purchasePrice: 14500,
      currency: 'USD',
      auctionLot: 'A21532',
      listingUrl: 'https://example.com/listing/a21532',
    },
  },
  {
    vin: 'WBAVA375X9P189287',
    make: 'BMW',
    model: '3 Series',
    year: 2019,
    color: 'Black',
    trim: '330i',
    mileage: 35000,
    acquisitionDetails: {
      sourceChannel: 'Local Owner Ikeja',
      purchaseDate: '2023-09-10',
      purchasePrice: 18000,
      currency: 'USD',
    },
  },
  {
    vin: 'KNDJT2A58C7454592',
    make: 'Kia',
    model: 'Soul',
    year: 2018,
    color: 'White',
    trim: 'EX',
    mileage: 42000,
    acquisitionDetails: {
      sourceChannel: 'Copart USA',
      purchaseDate: '2023-11-05',
      purchasePrice: 9800,
      currency: 'USD',
      auctionLot: 'C54839',
      listingUrl: 'https://example.com/listing/c54839',
    },
  },
  {
    vin: '1FTFW1ET5DFC12345',
    make: 'Ford',
    model: 'F-150',
    year: 2020,
    color: 'Blue',
    trim: 'XLT',
    mileage: 28000,
    acquisitionDetails: {
      sourceChannel: 'Manheim Auction',
      purchaseDate: '2023-08-20',
      purchasePrice: 22000,
      currency: 'USD',
      auctionLot: 'M78901',
    },
  },
  {
    vin: 'JH4TB2H26CC000000',
    make: 'Honda',
    model: 'Accord',
    year: 2019,
    color: 'Red',
    trim: 'Sport',
    mileage: 32000,
    acquisitionDetails: {
      sourceChannel: 'Local Dealer',
      purchaseDate: '2023-07-15',
      purchasePrice: 16500,
      currency: 'USD',
    },
  },
];

const sampleCosts: Array<{ vehicleId: string; cost: CostFormData }> = [
  {
    vehicleId: '', // Will be set after vehicle creation
    cost: {
      date: '2023-10-20',
      category: 'shipping',
      description: 'Shipping from Toronto to Lagos',
      amount: 3200,
      currency: 'USD',
      exchangeRate: 850,
    },
  },
  {
    vehicleId: '', // Will be set after vehicle creation
    cost: {
      date: '2023-11-05',
      category: 'customs-duty',
      description: 'Import duties',
      amount: 2800,
      currency: 'USD',
      exchangeRate: 850,
    },
  },
  {
    vehicleId: '', // Will be set after vehicle creation
    cost: {
      date: '2023-09-15',
      category: 'mechanical-labor',
      description: 'Engine tune-up and oil change',
      amount: 450,
      currency: 'USD',
      exchangeRate: 845,
    },
  },
  {
    vehicleId: '', // Will be set after vehicle creation
    cost: {
      date: '2023-08-25',
      category: 'bodywork-labor',
      description: 'Paint touch-up and dent repair',
      amount: 1200,
      currency: 'USD',
      exchangeRate: 840,
    },
  },
];

export async function seedDatabase() {
  try {
    console.log('🌱 Starting database seeding...');
    
    // Create vehicles
    const createdVehicles = [];
    for (const vehicleData of sampleVehicles) {
      try {
        const vehicle = await vehicleService.createVehicle(vehicleData);
        createdVehicles.push(vehicle);
        console.log(`✅ Created vehicle: ${vehicle.year} ${vehicle.make} ${vehicle.model}`);
      } catch (error) {
        console.error(`❌ Failed to create vehicle ${vehicleData.vin}:`, error);
      }
    }
    
    // Add additional costs to some vehicles
    if (createdVehicles.length > 0) {
      // Add shipping cost to first vehicle
      if (createdVehicles[0]) {
        await costService.createCost(createdVehicles[0].id, sampleCosts[0].cost);
        console.log(`✅ Added shipping cost to ${createdVehicles[0].year} ${createdVehicles[0].make} ${createdVehicles[0].model}`);
      }
      
      // Add customs duty to first vehicle
      if (createdVehicles[0]) {
        await costService.createCost(createdVehicles[0].id, sampleCosts[1].cost);
        console.log(`✅ Added customs duty to ${createdVehicles[0].year} ${createdVehicles[0].make} ${createdVehicles[0].model}`);
      }
      
      // Add mechanical labor to second vehicle
      if (createdVehicles[1]) {
        await costService.createCost(createdVehicles[1].id, sampleCosts[2].cost);
        console.log(`✅ Added mechanical labor to ${createdVehicles[1].year} ${createdVehicles[1].make} ${createdVehicles[1].model}`);
      }
      
      // Add bodywork to third vehicle
      if (createdVehicles[2]) {
        await costService.createCost(createdVehicles[2].id, sampleCosts[3].cost);
        console.log(`✅ Added bodywork to ${createdVehicles[2].year} ${createdVehicles[2].make} ${createdVehicles[2].model}`);
      }
    }
    
    // Update some vehicle statuses
    if (createdVehicles.length > 1) {
      await vehicleService.updateVehicleStatus(createdVehicles[0].id, 'for-sale');
      console.log(`✅ Updated ${createdVehicles[0].year} ${createdVehicles[0].make} ${createdVehicles[0].model} to for-sale`);
      
      await vehicleService.updateVehicleStatus(createdVehicles[1].id, 'in-workshop');
      console.log(`✅ Updated ${createdVehicles[1].year} ${createdVehicles[1].make} ${createdVehicles[1].model} to in-workshop`);
    }
    
    // Add sale details to some vehicles to test gross profit calculation
    if (createdVehicles.length > 2) {
      // Mark first vehicle as sold with recent sale date (within 30 days)
      const recentSaleDate = new Date();
      recentSaleDate.setDate(recentSaleDate.getDate() - 15); // 15 days ago
      
      await vehicleService.updateVehicleSaleDetails(createdVehicles[0].id, {
        saleDate: recentSaleDate,
        finalSalePrice: 18000000, // ₦18,000,000
        listingPrice: 17500000,   // ₦17,500,000
        notes: 'Sold to local buyer'
      });
      await vehicleService.updateVehicleStatus(createdVehicles[0].id, 'sold');
      console.log(`✅ Marked ${createdVehicles[0].year} ${createdVehicles[0].make} ${createdVehicles[0].model} as sold`);
      
      // Mark second vehicle as sold with older sale date (outside 30 days)
      const olderSaleDate = new Date();
      olderSaleDate.setDate(olderSaleDate.getDate() - 45); // 45 days ago
      
      await vehicleService.updateVehicleSaleDetails(createdVehicles[1].id, {
        saleDate: olderSaleDate,
        finalSalePrice: 22000000, // ₦22,000,000
        listingPrice: 21000000,   // ₦21,000,000
        notes: 'Sold to corporate buyer'
      });
      await vehicleService.updateVehicleStatus(createdVehicles[1].id, 'sold');
      console.log(`✅ Marked ${createdVehicles[1].year} ${createdVehicles[1].make} ${createdVehicles[1].model} as sold (older sale)`);
      
      // Mark third vehicle as sold with very recent sale date (within 30 days)
      const veryRecentSaleDate = new Date();
      veryRecentSaleDate.setDate(veryRecentSaleDate.getDate() - 5); // 5 days ago
      
      await vehicleService.updateVehicleSaleDetails(createdVehicles[2].id, {
        saleDate: veryRecentSaleDate,
        finalSalePrice: 12500000, // ₦12,500,000
        listingPrice: 12000000,   // ₦12,000,000
        notes: 'Sold to individual buyer'
      });
      await vehicleService.updateVehicleStatus(createdVehicles[2].id, 'sold');
      console.log(`✅ Marked ${createdVehicles[2].year} ${createdVehicles[2].make} ${createdVehicles[2].model} as sold (recent sale)`);
    }
    
    // Add some sample activities
    const sampleActivities = [
      {
        userId: 'admin-1',
        userName: 'Admin',
        action: 'created vehicle',
        vehicleId: createdVehicles[0]?.id || 'unknown',
        vehicleName: createdVehicles[0] ? `${createdVehicles[0].year} ${createdVehicles[0].make} ${createdVehicles[0].model}` : 'Unknown Vehicle',
        timestamp: new Date(),
      },
      {
        userId: 'staff-1',
        userName: 'Staff Member',
        action: 'added shipping cost',
        vehicleId: createdVehicles[0]?.id || 'unknown',
        vehicleName: createdVehicles[0] ? `${createdVehicles[0].year} ${createdVehicles[0].make} ${createdVehicles[0].model}` : 'Unknown Vehicle',
        timestamp: new Date(Date.now() - 1000 * 60 * 30), // 30 minutes ago
      },
      {
        userId: 'admin-1',
        userName: 'Admin',
        action: 'changed status to for-sale',
        vehicleId: createdVehicles[0]?.id || 'unknown',
        vehicleName: createdVehicles[0] ? `${createdVehicles[0].year} ${createdVehicles[0].make} ${createdVehicles[0].model}` : 'Unknown Vehicle',
        timestamp: new Date(Date.now() - 1000 * 60 * 15), // 15 minutes ago
      },
    ];
    
    for (const activity of sampleActivities) {
      await activityService.logActivity(activity);
    }
    console.log(`✅ Added ${sampleActivities.length} sample activities`);
    
    console.log('🎉 Database seeding completed successfully!');
    console.log(`📊 Created ${createdVehicles.length} vehicles with sample data`);
    
    return {
      success: true,
      vehiclesCreated: createdVehicles.length,
      message: 'Database seeded successfully!',
    };
  } catch (error) {
    console.error('❌ Database seeding failed:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      message: 'Database seeding failed',
    };
  }
}

// Function to clear all data (use with caution)
export async function clearDatabase() {
  try {
    console.log('🗑️ Clearing database...');
    
    // Note: In a real application, you'd want to implement proper cleanup
    // This is a placeholder for development/testing purposes
    console.log('⚠️ Clear database function not implemented for safety');
    console.log('💡 To clear data, manually delete collections in Firebase Console');
    
    return {
      success: true,
      message: 'Clear database function not implemented for safety',
    };
  } catch (error) {
    console.error('❌ Failed to clear database:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}
