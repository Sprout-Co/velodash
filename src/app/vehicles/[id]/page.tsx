'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import { Vehicle, VehicleStatus } from '@/types';
import { ChevronLeft, Edit, Trash2 } from 'lucide-react';
import VehicleIdentification from '@/components/vehicles/VehicleIdentification';
import VehicleAcquisition from '@/components/vehicles/VehicleAcquisition';
import VehicleStatusComponent from '@/components/vehicles/VehicleStatus';
import VehicleMediaHub from '@/components/vehicles/VehicleMediaHub';
import VehicleDocumentVault from '@/components/vehicles/VehicleDocumentVault';
import DeleteConfirmationDialog from '@/components/ui/DeleteConfirmationDialog';
import { Loader2 } from 'lucide-react';

import { getVehicleById, deleteVehicle } from '@/hooks/useVehiclesData';

function VehicleDetailsContent({ id }: { id: string }) {
  const [loading, setLoading] = useState(true);
  const [vehicle, setVehicle] = useState<Vehicle | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  
  const router = useRouter();
  
  useEffect(() => {
    const getVehicleData = async () => {
      try {
        const data = await getVehicleById(id);
        if (!data) {
          setError('Vehicle not found');
        } else {
          setVehicle(data);
        }
      } catch (err) {
        setError('Failed to load vehicle data');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    
    getVehicleData();
  }, [id]);
  
  const handleStatusChange = async (newStatus: VehicleStatus) => {
    if (!vehicle) return;
    
    try {
      // This would be an API call in production
      // await updateVehicleStatus(vehicle.id, newStatus);
      
      // Update local state
      setVehicle(prev => prev ? { ...prev, status: newStatus } : null);
    } catch (err) {
      console.error('Failed to update vehicle status:', err);
      // Show error notification
    }
  };

  const handleDeleteClick = () => {
    setShowDeleteDialog(true);
  };

  const handleDeleteConfirm = async () => {
    if (!vehicle) return;
    
    setIsDeleting(true);
    
    try {
      await deleteVehicle(vehicle.id);
      console.log('Vehicle deleted successfully');
      
      // Redirect to vehicles list
      router.push('/vehicles');
    } catch (err) {
      console.error('Failed to delete vehicle:', err);
      setError('Failed to delete vehicle. Please try again.');
      setShowDeleteDialog(false);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleDeleteCancel = () => {
    setShowDeleteDialog(false);
  };
  
  if (loading) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <Loader2 className="h-10 w-10 text-primary animate-spin" />
      </div>
    );
  }
  
  if (error || !vehicle) {
    return (
      <div className="p-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">{error || 'Vehicle not found'}</h2>
          <button 
            className="flex items-center text-primary hover:underline"
            onClick={() => router.push('/vehicles')}
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            Back to inventory
          </button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="p-6 vehicle-detail-container">
      <div className="mb-6 flex items-center justify-between">
        <button 
          className="flex items-center text-gray-600 hover:text-primary"
          onClick={() => router.push('/vehicles')}
        >
          <ChevronLeft className="h-5 w-5 mr-1" />
          Back to inventory
        </button>
        
        <div className="flex items-center space-x-4">
          <button
            className="flex items-center text-gray-500 hover:text-primary"
            onClick={() => router.push(`/vehicles/${id}/edit`)}
          >
            <Edit className="h-5 w-5 mr-1" />
            <span>Edit</span>
          </button>
          
          <button 
            className="flex items-center text-red-500 hover:text-red-700"
            onClick={handleDeleteClick}
          >
            <Trash2 className="h-5 w-5 mr-1" />
            <span>Delete</span>
          </button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <div className="lg:col-span-2">
          <h1 className="text-2xl font-bold text-gray-800 mb-2">
            {vehicle.year} {vehicle.make} {vehicle.model} {vehicle.trim}
          </h1>
          <p className="text-gray-500">VIN: {vehicle.vin}</p>
        </div>
        
        <div className="flex justify-end">
          <VehicleStatusComponent 
            currentStatus={vehicle.status} 
            onStatusChange={handleStatusChange} 
          />
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="grid grid-cols-1 gap-6">
            <VehicleIdentification vehicle={vehicle} />
            <VehicleAcquisition acquisitionDetails={vehicle.acquisitionDetails} />
            <VehicleMediaHub media={vehicle.media} vehicleId={vehicle.id} />
          </div>
        </div>
        
        <div className="lg:col-span-1">
          <VehicleDocumentVault documents={vehicle.documents} vehicleId={vehicle.id} />
        </div>
      </div>
      
      <DeleteConfirmationDialog
        isOpen={showDeleteDialog}
        onClose={handleDeleteCancel}
        onConfirm={handleDeleteConfirm}
        title="Delete Vehicle"
        message="Are you sure you want to delete this vehicle? This action cannot be undone."
        itemName={`${vehicle.year} ${vehicle.make} ${vehicle.model} ${vehicle.trim}`}
        isDeleting={isDeleting}
      />
    </div>
  );
}

export default function VehicleDetailsPage({ params }: { params: { id: string } }) {
  return (
    <Suspense fallback={
      <div className="w-full h-full flex items-center justify-center p-6">
        <Loader2 className="h-10 w-10 text-primary animate-spin" />
      </div>
    }>
      <VehicleDetailsContent id={params.id} />
    </Suspense>
  );
}
