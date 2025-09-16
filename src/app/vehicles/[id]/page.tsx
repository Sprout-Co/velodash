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
import VehicleSale from '@/components/vehicles/VehicleSale';
import VehicleCostManagement from '@/components/vehicles/VehicleCostManagement';
import DeleteConfirmationDialog from '@/components/ui/DeleteConfirmationDialog';
import { Loader2 } from 'lucide-react';

import { getVehicleById, deleteVehicle, updateVehicleStatus, updateVehicleSaleDetails } from '@/hooks/useVehiclesData';

function VehicleDetailsContent({ id }: { id: string }) {
  const [loading, setLoading] = useState(true);
  const [vehicle, setVehicle] = useState<Vehicle | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [statusUpdateError, setStatusUpdateError] = useState<string | null>(null);
  const [statusUpdateSuccess, setStatusUpdateSuccess] = useState<string | null>(null);
  
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
    
    setIsUpdatingStatus(true);
    setStatusUpdateError(null);
    setStatusUpdateSuccess(null);
    
    try {
      // Update status in Firestore
      await updateVehicleStatus(vehicle.id, newStatus);
      
      // Update local state
      setVehicle(prev => prev ? { ...prev, status: newStatus } : null);
      
      // Show success message
      setStatusUpdateSuccess(`Status updated to ${newStatus.replace('-', ' ')}`);
      
      // Clear success message after 3 seconds
      setTimeout(() => setStatusUpdateSuccess(null), 3000);
      
    } catch (err) {
      console.error('Failed to update vehicle status:', err);
      setStatusUpdateError('Failed to update vehicle status. Please try again.');
      
      // Clear error message after 5 seconds
      setTimeout(() => setStatusUpdateError(null), 5000);
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const handleSaleUpdate = async (saleDetails: Vehicle['saleDetails']) => {
    if (!vehicle) return;
    
    try {
      // Update sale details in Firestore
      const updatedVehicle = await updateVehicleSaleDetails(vehicle.id, saleDetails);
      
      // Update local state
      setVehicle(updatedVehicle);
      
    } catch (err) {
      console.error('Failed to update vehicle sale details:', err);
      throw err; // Let the component handle the error
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
            {vehicle.year} {vehicle.make} {vehicle.model}
          </h1>
          <p className="text-gray-500">VIN: {vehicle.vin}</p>
        </div>
        
        <div className="flex flex-col items-end space-y-2">
          <VehicleStatusComponent 
            currentStatus={vehicle.status} 
            onStatusChange={handleStatusChange} 
            disabled={isUpdatingStatus}
          />
          
          {/* Status update feedback */}
          {statusUpdateSuccess && (
            <div className="text-sm text-green-600 bg-green-50 px-3 py-1 rounded-md">
              {statusUpdateSuccess}
            </div>
          )}
          
          {statusUpdateError && (
            <div className="text-sm text-red-600 bg-red-50 px-3 py-1 rounded-md">
              {statusUpdateError}
            </div>
          )}
          
          {isUpdatingStatus && (
            <div className="text-sm text-blue-600 bg-blue-50 px-3 py-1 rounded-md flex items-center">
              <Loader2 className="h-3 w-3 mr-1 animate-spin" />
              Updating status...
            </div>
          )}
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        <VehicleIdentification vehicle={vehicle} />
        <VehicleAcquisition acquisitionDetails={vehicle.acquisitionDetails} />
        <VehicleSale 
          saleDetails={vehicle.saleDetails} 
          vehicleId={vehicle.id}
          onSaleUpdate={handleSaleUpdate}
        />
        <VehicleMediaHub 
          media={vehicle.media} 
          vehicleId={vehicle.id}
          onMediaUpdate={(updatedMedia) => {
            console.log('Vehicle details page received media update:', updatedMedia);
            setVehicle(prev => {
              const updated = prev ? { ...prev, media: updatedMedia } : null;
              console.log('Updated vehicle state:', updated);
              return updated;
            });
          }}
        />
        <VehicleDocumentVault documents={vehicle.documents} vehicleId={vehicle.id} />
      </div>
      
      <div className="mt-6">
        <VehicleCostManagement 
          vehicleId={vehicle.id}
          vehicleName={`${vehicle.year} ${vehicle.make} ${vehicle.model}`}
          onCostsUpdate={(costs) => {
            // Update local vehicle state with new costs
            setVehicle(prev => prev ? { ...prev, costs } : null);
          }}
        />
      </div>
      
      <DeleteConfirmationDialog
        isOpen={showDeleteDialog}
        onClose={handleDeleteCancel}
        onConfirm={handleDeleteConfirm}
        title="Delete Vehicle"
        message="Are you sure you want to delete this vehicle? This action cannot be undone."
        itemName={`${vehicle.year} ${vehicle.make} ${vehicle.model}`}
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
