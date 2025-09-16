'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronLeft, Save, X } from 'lucide-react';
import VehicleForm from '@/components/forms/VehicleForm';
import { VehicleFormData, Vehicle } from '@/types';
import { getVehicleById, updateVehicle } from '@/hooks/useVehiclesData';
import { Loader2 } from 'lucide-react';
import { safeDateToISOString } from '@/lib/dateUtils';

function EditVehicleContent({ id }: { id: string }) {
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [vehicle, setVehicle] = useState<Vehicle | null>(null);
  const router = useRouter();

  useEffect(() => {
    const fetchVehicle = async () => {
      try {
        const data = await getVehicleById(id);
        if (!data) {
          setError('Vehicle not found');
        } else {
          setVehicle(data);
        }
      } catch (err) {
        setError('Failed to load vehicle data');
        console.error('Error fetching vehicle:', err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchVehicle();
  }, [id]);

  const handleSubmit = async (formData: VehicleFormData) => {
    if (!vehicle) return;
    
    setIsSubmitting(true);
    setError(null);
    setSuccess(null);

    try {
      const updatedVehicle = await updateVehicle(vehicle.id, formData);
      console.log('Vehicle updated successfully:', updatedVehicle);
      
      setSuccess('Vehicle updated successfully! Redirecting...');
      
      // Redirect to the vehicle's detail page after a short delay
      setTimeout(() => {
        router.push(`/vehicles/${vehicle.id}`);
      }, 1500);
    } catch (err) {
      setError('Failed to update vehicle. Please try again.');
      console.error('Error updating vehicle:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    router.push(`/vehicles/${id}`);
  };

  // Convert Vehicle to VehicleFormData
  const convertToFormData = (vehicle: Vehicle): VehicleFormData => {
    return {
      vin: vehicle.vin,
      make: vehicle.make,
      model: vehicle.model,
      year: vehicle.year,
      color: vehicle.color,
      trim: vehicle.trim,
      mileage: vehicle.mileage,
      acquisitionDetails: {
        sourceChannel: vehicle.acquisitionDetails.sourceChannel,
        purchaseDate: safeDateToISOString(vehicle.acquisitionDetails.purchaseDate),
        purchasePrice: vehicle.acquisitionDetails.purchasePrice,
        currency: vehicle.acquisitionDetails.currency,
        auctionLot: vehicle.acquisitionDetails.auctionLot || '',
        listingUrl: vehicle.acquisitionDetails.listingUrl || '',
      },
    };
  };

  if (loading) {
    return (
      <div className="vehicle-form-container">
        <div className="loading-container">
          <Loader2 className="loading-spinner" />
        </div>
      </div>
    );
  }

  if (error || !vehicle) {
    return (
      <div className="vehicle-form-container">
        <div className="form-header">
          <div className="form-header-left">
            <button 
              className="back-button"
              onClick={() => router.push('/vehicles')}
              type="button"
            >
              <ChevronLeft className="icon" />
              Back to Vehicles
            </button>
            <h1>Edit Vehicle</h1>
          </div>
        </div>
        
        <div className="error-banner">
          <p>{error || 'Vehicle not found'}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="vehicle-form-container">
      <div className="form-header">
        <div className="form-header-left">
          <button 
            className="back-button"
            onClick={handleCancel}
            type="button"
          >
            <ChevronLeft className="icon" />
            Back to Vehicle
          </button>
          <h1>Edit Vehicle</h1>
        </div>
        
        <div className="form-header-right">
          <button 
            className="cancel-button"
            onClick={handleCancel}
            type="button"
          >
            <X className="icon" />
            Cancel
          </button>
        </div>
      </div>

      {error && (
        <div className="error-banner">
          <p>{error}</p>
        </div>
      )}

      {success && (
        <div className="success-banner">
          <p>{success}</p>
        </div>
      )}

      <VehicleForm 
        onSubmit={handleSubmit}
        isSubmitting={isSubmitting}
        submitButtonText="Update Vehicle"
        submitButtonIcon={<Save className="icon" />}
        initialData={convertToFormData(vehicle)}
      />
    </div>
  );
}

export default function EditVehiclePage({ params }: { params: { id: string } }) {
  return (
    <Suspense fallback={
      <div className="vehicle-form-container">
        <div className="loading-container">
          <Loader2 className="loading-spinner" />
        </div>
      </div>
    }>
      <EditVehicleContent id={params.id} />
    </Suspense>
  );
}
