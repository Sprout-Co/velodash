// Debug utility for sales performance issues
import { collection, getDocs } from 'firebase/firestore';
import { db } from './firebase';
import { Vehicle } from '@/types';

export async function debugSalesData() {
  try {
    const vehiclesSnapshot = await getDocs(collection(db, 'vehicles'));
    const vehicles = vehiclesSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Vehicle[];

    console.log('=== SALES DEBUG INFO ===');
    console.log('Total vehicles:', vehicles.length);
    
    const soldVehicles = vehicles.filter(v => v.status === 'sold');
    console.log('Vehicles with status "sold":', soldVehicles.length);
    
    const vehiclesWithSaleDetails = vehicles.filter(v => v.saleDetails);
    console.log('Vehicles with sale details:', vehiclesWithSaleDetails.length);
    
    console.log('\n=== SOLD VEHICLES ===');
    soldVehicles.forEach(v => {
      console.log(`- ${v.year} ${v.make} ${v.model} (${v.id})`);
      console.log(`  Status: ${v.status}`);
      console.log(`  Sale Details:`, v.saleDetails);
      console.log(`  Updated At:`, v.updatedAt);
      console.log('---');
    });
    
    console.log('\n=== VEHICLES WITH SALE DETAILS ===');
    vehiclesWithSaleDetails.forEach(v => {
      console.log(`- ${v.year} ${v.make} ${v.model} (${v.id})`);
      console.log(`  Status: ${v.status}`);
      console.log(`  Sale Details:`, v.saleDetails);
      console.log('---');
    });

    return {
      totalVehicles: vehicles.length,
      soldVehicles: soldVehicles.length,
      vehiclesWithSaleDetails: vehiclesWithSaleDetails.length,
      soldVehiclesList: soldVehicles,
      vehiclesWithSaleDetailsList: vehiclesWithSaleDetails
    };
  } catch (error) {
    console.error('Error debugging sales data:', error);
    throw error;
  }
}
