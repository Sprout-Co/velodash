// Seed data script for Firestore
// Run this to populate the database with sample data for testing

import { 
  vehicleService, 
  costService, 
  activityService 
} from './firestore';
import { VehicleFormData, CostFormData } from '@/types';

const sampleVehicles: VehicleFormData[] = [
  // High Profit Vehicle - Toyota Camry (sold)
  {
    vin: '1HGBH41JXMN109186',
    make: 'Toyota',
    model: 'Camry',
    year: 2021,
    color: 'Silver',
    mileage: 15000,
    acquisitionDetails: {
      sourceChannel: 'Adesa Auction Canada',
      purchaseDate: '2023-10-15',
      purchasePrice: 14500, // $14,500 USD = ~₦12.3M
      currency: 'USD',
      auctionLot: 'A21532',
      listingUrl: 'https://example.com/listing/a21532',
    },
  },
  // Moderate Profit Vehicle - BMW 3 Series (sold)
  {
    vin: 'WBAVA375X9P189287',
    make: 'BMW',
    model: '3 Series',
    year: 2019,
    color: 'Black',
    mileage: 35000,
    acquisitionDetails: {
      sourceChannel: 'Local Owner Ikeja',
      purchaseDate: '2023-09-10',
      purchasePrice: 18000, // $18,000 USD = ~₦15.3M
      currency: 'USD',
    },
  },
  // Break-even Vehicle - Kia Soul (sold)
  {
    vin: 'KNDJT2A58C7454592',
    make: 'Kia',
    model: 'Soul',
    year: 2018,
    color: 'White',
    mileage: 42000,
    acquisitionDetails: {
      sourceChannel: 'Copart USA',
      purchaseDate: '2023-11-05',
      purchasePrice: 9800, // $9,800 USD = ~₦8.3M
      currency: 'USD',
      auctionLot: 'C54839',
      listingUrl: 'https://example.com/listing/c54839',
    },
  },
  // Loss Vehicle - Ford F-150 (sold)
  {
    vin: '1FTFW1ET5DFC12345',
    make: 'Ford',
    model: 'F-150',
    year: 2020,
    color: 'Blue',
    mileage: 28000,
    acquisitionDetails: {
      sourceChannel: 'Manheim Auction',
      purchaseDate: '2023-08-20',
      purchasePrice: 22000, // $22,000 USD = ~₦18.7M
      currency: 'USD',
      auctionLot: 'M78901',
    },
  },
  // Current Inventory - Honda Accord (for sale)
  {
    vin: 'JH4TB2H26CC000000',
    make: 'Honda',
    model: 'Accord',
    year: 2019,
    color: 'Red',
    mileage: 32000,
    acquisitionDetails: {
      sourceChannel: 'Local Dealer',
      purchaseDate: '2023-07-15',
      purchasePrice: 16500, // $16,500 USD = ~₦14M
      currency: 'USD',
    },
  },
  // High-end Vehicle - Mercedes C-Class (sold)
  {
    vin: 'WDD2050461A123456',
    make: 'Mercedes-Benz',
    model: 'C-Class',
    year: 2020,
    color: 'White',
    mileage: 25000,
    acquisitionDetails: {
      sourceChannel: 'Adesa Auction Canada',
      purchaseDate: '2023-06-10',
      purchasePrice: 28000, // $28,000 USD = ~₦23.8M
      currency: 'USD',
      auctionLot: 'A45678',
    },
  },
  // Budget Vehicle - Nissan Altima (sold)
  {
    vin: '1N4AL3AP8JC123456',
    make: 'Nissan',
    model: 'Altima',
    year: 2018,
    color: 'Gray',
    mileage: 45000,
    acquisitionDetails: {
      sourceChannel: 'Copart USA',
      purchaseDate: '2023-05-20',
      purchasePrice: 8500, // $8,500 USD = ~₦7.2M
      currency: 'USD',
      auctionLot: 'C78901',
    },
  },
  // Luxury SUV - Lexus RX (for sale)
  {
    vin: '2T2HZMAA8LC123456',
    make: 'Lexus',
    model: 'RX',
    year: 2019,
    color: 'Black',
    mileage: 30000,
    acquisitionDetails: {
      sourceChannel: 'Manheim Auction',
      purchaseDate: '2023-04-15',
      purchasePrice: 32000, // $32,000 USD = ~₦27.2M
      currency: 'USD',
      auctionLot: 'M12345',
    },
  },
];

// Comprehensive cost data for different vehicles
const sampleCosts: Array<{ vehicleId: string; cost: CostFormData }> = [
  // Toyota Camry costs (High profit scenario)
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
    vehicleId: '',
    cost: {
      date: '2023-10-25',
      category: 'customs-duty',
      description: 'Import duties and taxes',
      amount: 2800,
      currency: 'USD',
      exchangeRate: 850,
    },
  },
  {
    vehicleId: '',
    cost: {
      date: '2023-11-01',
      category: 'detailing',
      description: 'Full detail and ceramic coating',
      amount: 800,
      currency: 'USD',
      exchangeRate: 850,
    },
  },
  
  // BMW 3 Series costs (Moderate profit scenario)
  {
    vehicleId: '',
    cost: {
      date: '2023-09-15',
      category: 'mechanical-labor',
      description: 'Engine tune-up, oil change, and brake service',
      amount: 1200,
      currency: 'USD',
      exchangeRate: 845,
    },
  },
  {
    vehicleId: '',
    cost: {
      date: '2023-09-20',
      category: 'bodywork-labor',
      description: 'Paint touch-up and minor dent repair',
      amount: 1800,
      currency: 'USD',
      exchangeRate: 845,
    },
  },
  {
    vehicleId: '',
    cost: {
      date: '2023-09-25',
      category: 'mechanical-parts',
      description: 'Replacement brake pads and rotors',
      amount: 650,
      currency: 'USD',
      exchangeRate: 845,
    },
  },
  
  // Kia Soul costs (Break-even scenario)
  {
    vehicleId: '',
    cost: {
      date: '2023-11-10',
      category: 'shipping',
      description: 'Shipping from USA to Lagos',
      amount: 2800,
      currency: 'USD',
      exchangeRate: 850,
    },
  },
  {
    vehicleId: '',
    cost: {
      date: '2023-11-15',
      category: 'customs-duty',
      description: 'Import duties',
      amount: 2400,
      currency: 'USD',
      exchangeRate: 850,
    },
  },
  {
    vehicleId: '',
    cost: {
      date: '2023-11-20',
      category: 'mechanical-labor',
      description: 'Transmission service and fluid change',
      amount: 950,
      currency: 'USD',
      exchangeRate: 850,
    },
  },
  {
    vehicleId: '',
    cost: {
      date: '2023-11-25',
      category: 'bodywork-labor',
      description: 'Paint correction and minor repairs',
      amount: 1200,
      currency: 'USD',
      exchangeRate: 850,
    },
  },
  
  // Ford F-150 costs (Loss scenario - high costs)
  {
    vehicleId: '',
    cost: {
      date: '2023-08-25',
      category: 'shipping',
      description: 'Shipping from USA to Lagos (large vehicle)',
      amount: 4500,
      currency: 'USD',
      exchangeRate: 840,
    },
  },
  {
    vehicleId: '',
    cost: {
      date: '2023-08-30',
      category: 'customs-duty',
      description: 'Import duties (high value vehicle)',
      amount: 4200,
      currency: 'USD',
      exchangeRate: 840,
    },
  },
  {
    vehicleId: '',
    cost: {
      date: '2023-09-05',
      category: 'mechanical-labor',
      description: 'Major engine work and transmission rebuild',
      amount: 3500,
      currency: 'USD',
      exchangeRate: 840,
    },
  },
  {
    vehicleId: '',
    cost: {
      date: '2023-09-10',
      category: 'bodywork-labor',
      description: 'Extensive bodywork and paint job',
      amount: 2800,
      currency: 'USD',
      exchangeRate: 840,
    },
  },
  {
    vehicleId: '',
    cost: {
      date: '2023-09-15',
      category: 'mechanical-parts',
      description: 'Engine parts and transmission components',
      amount: 2200,
      currency: 'USD',
      exchangeRate: 840,
    },
  },
  
  // Honda Accord costs (Current inventory)
  {
    vehicleId: '',
    cost: {
      date: '2023-07-20',
      category: 'mechanical-labor',
      description: 'Routine maintenance and inspection',
      amount: 750,
      currency: 'USD',
      exchangeRate: 840,
    },
  },
  {
    vehicleId: '',
    cost: {
      date: '2023-07-25',
      category: 'detailing',
      description: 'Interior and exterior detailing',
      amount: 600,
      currency: 'USD',
      exchangeRate: 840,
    },
  },
  
  // Mercedes C-Class costs (High-end vehicle)
  {
    vehicleId: '',
    cost: {
      date: '2023-06-15',
      category: 'shipping',
      description: 'Premium shipping from Canada',
      amount: 3800,
      currency: 'USD',
      exchangeRate: 840,
    },
  },
  {
    vehicleId: '',
    cost: {
      date: '2023-06-20',
      category: 'customs-duty',
      description: 'Import duties for luxury vehicle',
      amount: 3500,
      currency: 'USD',
      exchangeRate: 840,
    },
  },
  {
    vehicleId: '',
    cost: {
      date: '2023-06-25',
      category: 'mechanical-labor',
      description: 'Premium service and inspection',
      amount: 1500,
      currency: 'USD',
      exchangeRate: 840,
    },
  },
  {
    vehicleId: '',
    cost: {
      date: '2023-06-30',
      category: 'detailing',
      description: 'Premium detailing and paint protection',
      amount: 1200,
      currency: 'USD',
      exchangeRate: 840,
    },
  },
  
  // Nissan Altima costs (Budget vehicle)
  {
    vehicleId: '',
    cost: {
      date: '2023-05-25',
      category: 'shipping',
      description: 'Standard shipping from USA',
      amount: 2200,
      currency: 'USD',
      exchangeRate: 840,
    },
  },
  {
    vehicleId: '',
    cost: {
      date: '2023-05-30',
      category: 'customs-duty',
      description: 'Import duties',
      amount: 1800,
      currency: 'USD',
      exchangeRate: 840,
    },
  },
  {
    vehicleId: '',
    cost: {
      date: '2023-06-05',
      category: 'mechanical-labor',
      description: 'Basic service and oil change',
      amount: 400,
      currency: 'USD',
      exchangeRate: 840,
    },
  },
  
  // Lexus RX costs (Luxury SUV - current inventory)
  {
    vehicleId: '',
    cost: {
      date: '2023-04-20',
      category: 'shipping',
      description: 'Premium shipping for SUV',
      amount: 4200,
      currency: 'USD',
      exchangeRate: 840,
    },
  },
  {
    vehicleId: '',
    cost: {
      date: '2023-04-25',
      category: 'customs-duty',
      description: 'Import duties for luxury SUV',
      amount: 3800,
      currency: 'USD',
      exchangeRate: 840,
    },
  },
  {
    vehicleId: '',
    cost: {
      date: '2023-04-30',
      category: 'mechanical-labor',
      description: 'Premium service and inspection',
      amount: 1800,
      currency: 'USD',
      exchangeRate: 840,
    },
  },
  {
    vehicleId: '',
    cost: {
      date: '2023-05-05',
      category: 'detailing',
      description: 'Premium SUV detailing',
      amount: 1400,
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
    
    // Add comprehensive costs to vehicles
    if (createdVehicles.length > 0) {
      // Toyota Camry (index 0) - High profit scenario
      if (createdVehicles[0]) {
        await costService.createCost(createdVehicles[0].id, sampleCosts[0].cost); // Shipping
        await costService.createCost(createdVehicles[0].id, sampleCosts[1].cost); // Customs
        await costService.createCost(createdVehicles[0].id, sampleCosts[2].cost); // Detailing
        console.log(`✅ Added 3 costs to Toyota Camry (High profit scenario)`);
      }
      
      // BMW 3 Series (index 1) - Moderate profit scenario
      if (createdVehicles[1]) {
        await costService.createCost(createdVehicles[1].id, sampleCosts[3].cost); // Mechanical
        await costService.createCost(createdVehicles[1].id, sampleCosts[4].cost); // Bodywork
        await costService.createCost(createdVehicles[1].id, sampleCosts[5].cost); // Parts
        console.log(`✅ Added 3 costs to BMW 3 Series (Moderate profit scenario)`);
      }
      
      // Kia Soul (index 2) - Break-even scenario
      if (createdVehicles[2]) {
        await costService.createCost(createdVehicles[2].id, sampleCosts[6].cost); // Shipping
        await costService.createCost(createdVehicles[2].id, sampleCosts[7].cost); // Customs
        await costService.createCost(createdVehicles[2].id, sampleCosts[8].cost); // Mechanical
        await costService.createCost(createdVehicles[2].id, sampleCosts[9].cost); // Bodywork
        console.log(`✅ Added 4 costs to Kia Soul (Break-even scenario)`);
      }
      
      // Ford F-150 (index 3) - Loss scenario
      if (createdVehicles[3]) {
        await costService.createCost(createdVehicles[3].id, sampleCosts[10].cost); // Shipping
        await costService.createCost(createdVehicles[3].id, sampleCosts[11].cost); // Customs
        await costService.createCost(createdVehicles[3].id, sampleCosts[12].cost); // Major mechanical
        await costService.createCost(createdVehicles[3].id, sampleCosts[13].cost); // Bodywork
        await costService.createCost(createdVehicles[3].id, sampleCosts[14].cost); // Parts
        console.log(`✅ Added 5 costs to Ford F-150 (Loss scenario)`);
      }
      
      // Honda Accord (index 4) - Current inventory
      if (createdVehicles[4]) {
        await costService.createCost(createdVehicles[4].id, sampleCosts[15].cost); // Mechanical
        await costService.createCost(createdVehicles[4].id, sampleCosts[16].cost); // Detailing
        console.log(`✅ Added 2 costs to Honda Accord (Current inventory)`);
      }
      
      // Mercedes C-Class (index 5) - High-end vehicle
      if (createdVehicles[5]) {
        await costService.createCost(createdVehicles[5].id, sampleCosts[17].cost); // Shipping
        await costService.createCost(createdVehicles[5].id, sampleCosts[18].cost); // Customs
        await costService.createCost(createdVehicles[5].id, sampleCosts[19].cost); // Mechanical
        await costService.createCost(createdVehicles[5].id, sampleCosts[20].cost); // Detailing
        console.log(`✅ Added 4 costs to Mercedes C-Class (High-end vehicle)`);
      }
      
      // Nissan Altima (index 6) - Budget vehicle
      if (createdVehicles[6]) {
        await costService.createCost(createdVehicles[6].id, sampleCosts[21].cost); // Shipping
        await costService.createCost(createdVehicles[6].id, sampleCosts[22].cost); // Customs
        await costService.createCost(createdVehicles[6].id, sampleCosts[23].cost); // Mechanical
        console.log(`✅ Added 3 costs to Nissan Altima (Budget vehicle)`);
      }
      
      // Lexus RX (index 7) - Luxury SUV
      if (createdVehicles[7]) {
        await costService.createCost(createdVehicles[7].id, sampleCosts[24].cost); // Shipping
        await costService.createCost(createdVehicles[7].id, sampleCosts[25].cost); // Customs
        await costService.createCost(createdVehicles[7].id, sampleCosts[26].cost); // Mechanical
        await costService.createCost(createdVehicles[7].id, sampleCosts[27].cost); // Detailing
        console.log(`✅ Added 4 costs to Lexus RX (Luxury SUV)`);
      }
    }
    
    // Update vehicle statuses and add sale details for realistic sales scenarios
    if (createdVehicles.length > 0) {
      // Toyota Camry (index 0) - HIGH PROFIT: Purchase $14,500 + costs ~$5,800 = ~$20,300 total cost, sold for ₦18M
      const recentSaleDate = new Date();
      recentSaleDate.setDate(recentSaleDate.getDate() - 15); // 15 days ago
      
      await vehicleService.updateVehicleSaleDetails(createdVehicles[0].id, {
        saleDate: recentSaleDate,
        finalSalePrice: 18000000, // ₦18,000,000 (High profit - ~₦1.7M profit)
        listingPrice: 17500000,   // ₦17,500,000
        notes: 'Sold to local buyer - High profit margin'
      });
      await vehicleService.updateVehicleStatus(createdVehicles[0].id, 'sold');
      console.log(`✅ Toyota Camry SOLD - High profit scenario (₦18M sale price)`);
      
      // BMW 3 Series (index 1) - MODERATE PROFIT: Purchase $18,000 + costs ~$3,650 = ~$21,650 total cost, sold for ₦22M
      const moderateSaleDate = new Date();
      moderateSaleDate.setDate(moderateSaleDate.getDate() - 25); // 25 days ago
      
      await vehicleService.updateVehicleSaleDetails(createdVehicles[1].id, {
        saleDate: moderateSaleDate,
        finalSalePrice: 22000000, // ₦22,000,000 (Moderate profit - ~₦350K profit)
        listingPrice: 21500000,   // ₦21,500,000
        notes: 'Sold to corporate buyer - Moderate profit margin'
      });
      await vehicleService.updateVehicleStatus(createdVehicles[1].id, 'sold');
      console.log(`✅ BMW 3 Series SOLD - Moderate profit scenario (₦22M sale price)`);
      
      // Kia Soul (index 2) - BREAK-EVEN: Purchase $9,800 + costs ~$7,350 = ~$17,150 total cost, sold for ₦17M
      const breakEvenSaleDate = new Date();
      breakEvenSaleDate.setDate(breakEvenSaleDate.getDate() - 10); // 10 days ago
      
      await vehicleService.updateVehicleSaleDetails(createdVehicles[2].id, {
        saleDate: breakEvenSaleDate,
        finalSalePrice: 17000000, // ₦17,000,000 (Break-even - small loss)
        listingPrice: 16800000,   // ₦16,800,000
        notes: 'Sold to individual buyer - Break-even scenario'
      });
      await vehicleService.updateVehicleStatus(createdVehicles[2].id, 'sold');
      console.log(`✅ Kia Soul SOLD - Break-even scenario (₦17M sale price)`);
      
      // Ford F-150 (index 3) - LOSS: Purchase $22,000 + costs ~$15,200 = ~$37,200 total cost, sold for ₦35M
      const lossSaleDate = new Date();
      lossSaleDate.setDate(lossSaleDate.getDate() - 20); // 20 days ago
      
      await vehicleService.updateVehicleSaleDetails(createdVehicles[3].id, {
        saleDate: lossSaleDate,
        finalSalePrice: 35000000, // ₦35,000,000 (Loss - ~₦1.6M loss)
        listingPrice: 36000000,   // ₦36,000,000
        notes: 'Sold to dealer - Loss scenario due to high repair costs'
      });
      await vehicleService.updateVehicleStatus(createdVehicles[3].id, 'sold');
      console.log(`✅ Ford F-150 SOLD - Loss scenario (₦35M sale price)`);
      
      // Honda Accord (index 4) - CURRENT INVENTORY (for sale)
      await vehicleService.updateVehicleSaleDetails(createdVehicles[4].id, {
        listingPrice: 18500000, // ₦18,500,000 (Expected profit - ~₦4.5M profit)
        finalSalePrice: 0, // Not sold yet
        saleDate: null, // Not sold yet
        notes: 'Currently for sale - Expected high profit margin'
      });
      await vehicleService.updateVehicleStatus(createdVehicles[4].id, 'for-sale');
      console.log(`✅ Honda Accord FOR SALE - Current inventory (₦18.5M listing price)`);
      
      // Mercedes C-Class (index 5) - HIGH-END PROFIT: Purchase $28,000 + costs ~$10,000 = ~$38,000 total cost, sold for ₦42M
      const luxurySaleDate = new Date();
      luxurySaleDate.setDate(luxurySaleDate.getDate() - 8); // 8 days ago
      
      await vehicleService.updateVehicleSaleDetails(createdVehicles[5].id, {
        saleDate: luxurySaleDate,
        finalSalePrice: 42000000, // ₦42,000,000 (High profit - ~₦4M profit)
        listingPrice: 41000000,   // ₦41,000,000
        notes: 'Sold to luxury buyer - High-end profit margin'
      });
      await vehicleService.updateVehicleStatus(createdVehicles[5].id, 'sold');
      console.log(`✅ Mercedes C-Class SOLD - High-end profit scenario (₦42M sale price)`);
      
      // Nissan Altima (index 6) - BUDGET PROFIT: Purchase $8,500 + costs ~$4,400 = ~$12,900 total cost, sold for ₦14M
      const budgetSaleDate = new Date();
      budgetSaleDate.setDate(budgetSaleDate.getDate() - 12); // 12 days ago
      
      await vehicleService.updateVehicleSaleDetails(createdVehicles[6].id, {
        saleDate: budgetSaleDate,
        finalSalePrice: 14000000, // ₦14,000,000 (Good profit - ~₦1.1M profit)
        listingPrice: 13800000,   // ₦13,800,000
        notes: 'Sold to budget buyer - Good profit margin'
      });
      await vehicleService.updateVehicleStatus(createdVehicles[6].id, 'sold');
      console.log(`✅ Nissan Altima SOLD - Budget profit scenario (₦14M sale price)`);
      
      // Lexus RX (index 7) - LUXURY SUV (for sale)
      await vehicleService.updateVehicleSaleDetails(createdVehicles[7].id, {
        listingPrice: 45000000, // ₦45,000,000 (Expected high profit - ~₦17.8M profit)
        finalSalePrice: 0, // Not sold yet
        saleDate: null, // Not sold yet
        notes: 'Currently for sale - Luxury SUV with high expected profit'
      });
      await vehicleService.updateVehicleStatus(createdVehicles[7].id, 'for-sale');
      console.log(`✅ Lexus RX FOR SALE - Luxury SUV inventory (₦45M listing price)`);
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
    console.log(`📊 Created ${createdVehicles.length} vehicles with comprehensive sales scenarios:`);
    console.log('💰 SALES SCENARIOS:');
    console.log('   🟢 HIGH PROFIT: Toyota Camry (₦1.7M profit)');
    console.log('   🟡 MODERATE PROFIT: BMW 3 Series (₦350K profit)');
    console.log('   🟠 BREAK-EVEN: Kia Soul (small loss)');
    console.log('   🔴 LOSS: Ford F-150 (₦1.6M loss)');
    console.log('   🟢 HIGH-END PROFIT: Mercedes C-Class (₦4M profit)');
    console.log('   🟢 BUDGET PROFIT: Nissan Altima (₦1.1M profit)');
    console.log('   📦 CURRENT INVENTORY: Honda Accord & Lexus RX (for sale)');
    console.log('📈 Total 30-day revenue from recent sales: ~₦4.2M');
    
    return {
      success: true,
      vehiclesCreated: createdVehicles.length,
      message: 'Database seeded with comprehensive sales scenarios!',
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
