'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronLeft, Save, X } from 'lucide-react';
import VehicleForm from '@/components/forms/VehicleForm';
import { VehicleFormData } from '@/types';
import { createVehicle } from '@/hooks/useVehiclesData';

export default function NewVehiclePage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleSubmit = async (formData: VehicleFormData) => {
    setIsSubmitting(true);
    setError(null);

    try {
      const newVehicle = await createVehicle(formData);
      console.log('Vehicle created successfully:', newVehicle);
      
      // Redirect to the new vehicle's detail page
      router.push(`/vehicles/${newVehicle.id}`);
    } catch (err) {
      setError('Failed to create vehicle. Please try again.');
      console.error('Error creating vehicle:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    router.push('/vehicles');
  };

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
            Back to Vehicles
          </button>
          <h1>Add New Vehicle</h1>
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

      <VehicleForm 
        onSubmit={handleSubmit}
        isSubmitting={isSubmitting}
        submitButtonText="Add Vehicle"
        submitButtonIcon={<Save className="icon" />}
      />
    </div>
  );
}
