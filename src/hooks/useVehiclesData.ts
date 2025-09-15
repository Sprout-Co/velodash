import { useState, useEffect } from 'react';
import { Vehicle, PaginatedResponse, VehicleFilters } from '@/types';
import { generateId } from '@/lib/utils';

// Mock data - to be replaced with actual API calls
const mockVehicles: Vehicle[] = [
  {
    id: '1',
    vin: '1HGBH41JXMN109186',
    make: 'Toyota',
    model: 'Camry',
    year: 2021,
    color: 'Silver',
    trim: 'XLE',
    mileage: 15000,
    status: 'for-sale',
    acquisitionDetails: {
      sourceChannel: 'Adesa Auction Canada',
      purchaseDate: new Date('2023-10-15'),
      purchasePrice: 14500,
      currency: 'USD',
      auctionLot: 'A21532',
      listingUrl: 'https://example.com/listing/a21532',
    },
    media: {
      photos: [
        'https://example.com/photos/1.jpg',
        'https://example.com/photos/2.jpg',
      ],
      videos: [],
    },
    documents: {
      billOfLading: 'https://example.com/documents/bill-1.pdf',
      customsDeclaration: 'https://example.com/documents/customs-1.pdf',
      title: 'https://example.com/documents/title-1.pdf',
      purchaseInvoice: 'https://example.com/documents/invoice-1.pdf',
      repairReceipts: [
        'https://example.com/documents/repair-1.pdf',
        'https://example.com/documents/repair-2.pdf',
      ],
    },
    costs: [
      {
        id: 'c1',
        vehicleId: '1',
        date: new Date('2023-10-15'),
        category: 'purchase-price',
        description: 'Initial purchase',
        amount: 14500,
        currency: 'USD',
        ngnAmount: 14500 * 850, // conversion rate
        exchangeRate: 850,
        createdAt: new Date('2023-10-15'),
      },
      {
        id: 'c2',
        vehicleId: '1',
        date: new Date('2023-10-20'),
        category: 'shipping',
        description: 'Shipping from Toronto to Lagos',
        amount: 3200,
        currency: 'USD',
        ngnAmount: 3200 * 850, // conversion rate
        exchangeRate: 850,
        createdAt: new Date('2023-10-20'),
      },
      {
        id: 'c3',
        vehicleId: '1',
        date: new Date('2023-11-05'),
        category: 'customs-duty',
        description: 'Import duties',
        amount: 2800,
        currency: 'USD',
        ngnAmount: 2800 * 850, // conversion rate
        exchangeRate: 850,
        createdAt: new Date('2023-11-05'),
      },
    ],
    createdAt: new Date('2023-10-15'),
    updatedAt: new Date('2023-11-10'),
  },
  {
    id: '2',
    vin: 'WBAVA375X9P189287',
    make: 'BMW',
    model: '3 Series',
    year: 2019,
    color: 'Black',
    trim: '330i',
    mileage: 35000,
    status: 'in-workshop',
    acquisitionDetails: {
      sourceChannel: 'Local Owner Ikeja',
      purchaseDate: new Date('2023-09-10'),
      purchasePrice: 18000,
      currency: 'USD',
    },
    media: {
      photos: [
        'https://example.com/photos/3.jpg',
      ],
      videos: [],
    },
    documents: {
      title: 'https://example.com/documents/title-2.pdf',
      purchaseInvoice: 'https://example.com/documents/invoice-2.pdf',
      repairReceipts: [],
    },
    costs: [
      {
        id: 'c4',
        vehicleId: '2',
        date: new Date('2023-09-10'),
        category: 'purchase-price',
        description: 'Initial purchase',
        amount: 18000,
        currency: 'USD',
        ngnAmount: 18000 * 845, // conversion rate
        exchangeRate: 845,
        createdAt: new Date('2023-09-10'),
      },
    ],
    createdAt: new Date('2023-09-10'),
    updatedAt: new Date('2023-09-15'),
  },
  {
    id: '3',
    vin: 'KNDJT2A58C7454592',
    make: 'Kia',
    model: 'Soul',
    year: 2018,
    color: 'White',
    trim: 'EX',
    mileage: 42000,
    status: 'sourced',
    acquisitionDetails: {
      sourceChannel: 'Copart USA',
      purchaseDate: new Date('2023-11-05'),
      purchasePrice: 9800,
      currency: 'USD',
      auctionLot: 'C54839',
      listingUrl: 'https://example.com/listing/c54839',
    },
    media: {
      photos: [],
      videos: [],
    },
    documents: {
      purchaseInvoice: 'https://example.com/documents/invoice-3.pdf',
      repairReceipts: [],
    },
    costs: [
      {
        id: 'c5',
        vehicleId: '3',
        date: new Date('2023-11-05'),
        category: 'purchase-price',
        description: 'Initial purchase',
        amount: 9800,
        currency: 'USD',
        ngnAmount: 9800 * 855, // conversion rate
        exchangeRate: 855,
        createdAt: new Date('2023-11-05'),
      },
    ],
    createdAt: new Date('2023-11-05'),
    updatedAt: new Date('2023-11-05'),
  }
];

export const getVehiclesData = async (): Promise<Vehicle[]> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 500));
  
  // This would be an actual API call in production
  return mockVehicles;
};

export const getVehicleById = async (id: string): Promise<Vehicle | null> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 300));
  
  // This would be an actual API call in production
  const vehicle = mockVehicles.find(v => v.id === id);
  return vehicle || null;
};

export const createVehicle = async (formData: any): Promise<Vehicle> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // This would be an actual API call in production
  const newVehicle: Vehicle = {
    id: generateId(),
    vin: formData.vin,
    make: formData.make,
    model: formData.model,
    year: formData.year,
    color: formData.color,
    trim: formData.trim,
    mileage: formData.mileage,
    status: 'sourced', // Default status for new vehicles
    acquisitionDetails: {
      sourceChannel: formData.acquisitionDetails.sourceChannel,
      purchaseDate: new Date(formData.acquisitionDetails.purchaseDate),
      purchasePrice: formData.acquisitionDetails.purchasePrice,
      currency: formData.acquisitionDetails.currency,
      auctionLot: formData.acquisitionDetails.auctionLot || undefined,
      listingUrl: formData.acquisitionDetails.listingUrl || undefined,
    },
    media: {
      photos: [],
      videos: [],
    },
    documents: {
      repairReceipts: [],
    },
    costs: [
      {
        id: generateId(),
        vehicleId: '', // Will be set after vehicle creation
        date: new Date(formData.acquisitionDetails.purchaseDate),
        category: 'purchase-price',
        description: 'Initial purchase',
        amount: formData.acquisitionDetails.purchasePrice,
        currency: formData.acquisitionDetails.currency,
        ngnAmount: formData.acquisitionDetails.purchasePrice * 850, // Mock conversion rate
        exchangeRate: 850,
        createdAt: new Date(),
      },
    ],
    createdAt: new Date(),
    updatedAt: new Date(),
  };
  
  // Update the vehicle ID in the cost entry
  newVehicle.costs[0].vehicleId = newVehicle.id;
  
  // Add to mock data (in production, this would be handled by the API)
  mockVehicles.push(newVehicle);
  
  return newVehicle;
};

export default function useVehiclesData(filters?: VehicleFilters) {
  const [loading, setLoading] = useState(true);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [filteredVehicles, setFilteredVehicles] = useState<Vehicle[]>([]);
  const [error, setError] = useState<Error | null>(null);
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const data = await getVehiclesData();
        setVehicles(data);
        setFilteredVehicles(data);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to fetch vehicles'));
        console.error('Error fetching vehicles:', err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);
  
  useEffect(() => {
    if (!vehicles.length || !filters) return;
    
    let results = [...vehicles];
    
    if (filters.status?.length) {
      results = results.filter(vehicle => filters.status!.includes(vehicle.status));
    }
    
    if (filters.make?.length) {
      results = results.filter(vehicle => filters.make!.includes(vehicle.make));
    }
    
    if (filters.year?.min || filters.year?.max) {
      results = results.filter(vehicle => {
        const { min, max } = filters.year!;
        if (min && max) return vehicle.year >= min && vehicle.year <= max;
        if (min) return vehicle.year >= min;
        if (max) return vehicle.year <= max;
        return true;
      });
    }
    
    if (filters.priceRange?.min || filters.priceRange?.max) {
      results = results.filter(vehicle => {
        const { min, max } = filters.priceRange!;
        const price = vehicle.acquisitionDetails.purchasePrice;
        if (min && max) return price >= min && price <= max;
        if (min) return price >= min;
        if (max) return price <= max;
        return true;
      });
    }
    
    if (filters.search) {
      const searchTerm = filters.search.toLowerCase();
      results = results.filter(vehicle =>
        vehicle.vin.toLowerCase().includes(searchTerm) ||
        vehicle.make.toLowerCase().includes(searchTerm) ||
        vehicle.model.toLowerCase().includes(searchTerm) ||
        `${vehicle.make} ${vehicle.model}`.toLowerCase().includes(searchTerm)
      );
    }
    
    setFilteredVehicles(results);
  }, [filters, vehicles]);
  
  return { loading, vehicles: filteredVehicles, error };
}
