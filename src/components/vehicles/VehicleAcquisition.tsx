import React from 'react';
import { Vehicle } from '@/types';
import { formatCurrency, formatDate } from '@/lib/utils';
import { ExternalLink } from 'lucide-react';

interface VehicleAcquisitionProps {
  acquisitionDetails: Vehicle['acquisitionDetails'];
}

export default function VehicleAcquisition({ acquisitionDetails }: VehicleAcquisitionProps) {
  const {
    sourceChannel,
    purchaseDate,
    purchasePrice,
    currency,
    auctionLot,
    listingUrl
  } = acquisitionDetails;
  
  return (
    <div className="bg-white rounded-lg shadow p-6 vehicle-acquisition">
      <h2 className="text-xl font-semibold text-gray-800 mb-4">Acquisition Details</h2>
      
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <div className="acquisition-field col-span-2 md:col-span-1">
          <label className="text-sm text-gray-500">Source Channel</label>
          <p className="font-medium">{sourceChannel}</p>
        </div>
        
        <div className="acquisition-field">
          <label className="text-sm text-gray-500">Purchase Date</label>
          <p className="font-medium">{formatDate(purchaseDate)}</p>
        </div>
        
        <div className="acquisition-field">
          <label className="text-sm text-gray-500">Purchase Price</label>
          <p className="font-medium">{formatCurrency(purchasePrice, currency)}</p>
        </div>
        
        {auctionLot && (
          <div className="acquisition-field">
            <label className="text-sm text-gray-500">Auction Lot #</label>
            <p className="font-medium">{auctionLot}</p>
          </div>
        )}
        
        {listingUrl && (
          <div className="acquisition-field col-span-2">
            <label className="text-sm text-gray-500">Original Listing</label>
            <a 
              href={listingUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center text-primary hover:underline font-medium"
            >
              View original listing
              <ExternalLink className="ml-1 h-4 w-4" />
            </a>
          </div>
        )}
      </div>
    </div>
  );
}
