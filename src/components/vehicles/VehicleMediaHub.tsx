import React, { useState } from 'react';
import { Vehicle } from '@/types';
import { Upload, X, ImageIcon, Film, Loader2, AlertCircle } from 'lucide-react';
import Image from 'next/image';
import { storageService, generateThumbnail } from '@/lib/storage';
import { vehicleService } from '@/lib/firestore';

interface VehicleMediaHubProps {
  media: Vehicle['media'];
  vehicleId: string;
  onMediaUpdate?: (media: Vehicle['media']) => void;
}

export default function VehicleMediaHub({ media, vehicleId, onMediaUpdate }: VehicleMediaHubProps) {
  const [activeTab, setActiveTab] = useState<'photos' | 'videos'>('photos');
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<{ [key: number]: number }>({});
  const [error, setError] = useState<string | null>(null);
  const [localMedia, setLocalMedia] = useState<Vehicle['media']>(media);
  
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };
  
  const handleDragLeave = () => {
    setIsDragging(false);
  };
  
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length === 0) return;
    
    uploadMedia(files);
  };
  
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.length) return;
    
    const files = Array.from(e.target.files);
    uploadMedia(files);
  };

  const uploadMedia = async (files: File[]) => {
    if (files.length === 0) return;
    
    setIsUploading(true);
    setError(null);
    
    try {
      // Validate files
      for (const file of files) {
        const validation = storageService.validateFile(file, activeTab);
        if (!validation.valid) {
          throw new Error(validation.error);
        }
      }
      
      // Upload files
      const downloadURLs = await storageService.uploadMultipleFiles(
        files,
        vehicleId,
        activeTab,
        (fileIndex, progress) => {
          setUploadProgress(prev => ({ ...prev, [fileIndex]: progress }));
        }
      );
      
      // Update local media state
      const updatedMedia = {
        ...localMedia,
        [activeTab]: [...localMedia[activeTab], ...downloadURLs]
      };
      
      setLocalMedia(updatedMedia);
      
      // Update in Firestore
      await vehicleService.updateVehicleMedia(vehicleId, updatedMedia);
      
      // Notify parent component
      if (onMediaUpdate) {
        onMediaUpdate(updatedMedia);
      }
      
      // Clear progress
      setUploadProgress({});
      
    } catch (err) {
      console.error('Upload error:', err);
      setError(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setIsUploading(false);
    }
  };

  const removeMedia = async (index: number) => {
    try {
      const mediaArray = localMedia[activeTab];
      const urlToRemove = mediaArray[index];
      
      // Delete from storage
      await storageService.deleteFile(urlToRemove);
      
      // Update local state
      const updatedArray = mediaArray.filter((_, i) => i !== index);
      const updatedMedia = {
        ...localMedia,
        [activeTab]: updatedArray
      };
      
      setLocalMedia(updatedMedia);
      
      // Update in Firestore
      await vehicleService.updateVehicleMedia(vehicleId, updatedMedia);
      
      // Notify parent component
      if (onMediaUpdate) {
        onMediaUpdate(updatedMedia);
      }
      
    } catch (err) {
      console.error('Delete error:', err);
      setError(err instanceof Error ? err.message : 'Failed to delete media');
    }
  };
  
  return (
    <div className="bg-white rounded-lg shadow p-6 vehicle-media-hub">
      <h2 className="text-xl font-semibold text-gray-800 mb-4">Media Hub</h2>
      
      <div className="flex border-b mb-4">
        <button
          className={`py-2 px-4 ${
            activeTab === 'photos'
              ? 'text-primary border-b-2 border-primary'
              : 'text-gray-500 hover:text-gray-700'
          }`}
          onClick={() => setActiveTab('photos')}
        >
          Photos ({localMedia.photos.length})
        </button>
        <button
          className={`py-2 px-4 ${
            activeTab === 'videos'
              ? 'text-primary border-b-2 border-primary'
              : 'text-gray-500 hover:text-gray-700'
          }`}
          onClick={() => setActiveTab('videos')}
        >
          Videos ({localMedia.videos.length})
        </button>
      </div>
      
      {/* Error Message */}
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md flex items-center">
          <AlertCircle className="h-4 w-4 text-red-500 mr-2" />
          <p className="text-red-700 text-sm">{error}</p>
          <button
            onClick={() => setError(null)}
            className="ml-auto text-red-500 hover:text-red-700"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Upload Area */}
      <div
        className={`border-2 border-dashed rounded-lg p-6 mb-4 text-center ${
          isDragging ? 'border-primary bg-primary/5' : 'border-gray-300'
        } ${isUploading ? 'opacity-50 pointer-events-none' : ''}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <div className="flex flex-col items-center">
          {isUploading ? (
            <>
              <Loader2 className="h-10 w-10 text-primary animate-spin mb-2" />
              <p className="mb-2 text-gray-500">Uploading files...</p>
              {Object.keys(uploadProgress).length > 0 && (
                <div className="w-full max-w-xs">
                  <div className="bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-primary h-2 rounded-full transition-all duration-300"
                      style={{ 
                        width: `${Object.values(uploadProgress).reduce((a, b) => a + b, 0) / Object.keys(uploadProgress).length}%` 
                      }}
                    />
                  </div>
                </div>
              )}
            </>
          ) : (
            <>
              <Upload className="h-10 w-10 text-gray-400 mb-2" />
              <p className="mb-2 text-gray-500">
                Drag & drop {activeTab === 'photos' ? 'images' : 'videos'} here
              </p>
              <p className="text-xs text-gray-400 mb-4">
                or click to browse from your device
              </p>
              
              <label className="bg-primary text-white px-4 py-2 rounded-md cursor-pointer hover:bg-primary/90">
                Upload {activeTab === 'photos' ? 'Photos' : 'Videos'}
                <input
                  type="file"
                  accept={activeTab === 'photos' ? 'image/*' : 'video/*'}
                  onChange={handleFileSelect}
                  className="hidden"
                  multiple
                />
              </label>
            </>
          )}
        </div>
      </div>
      
      {/* Media Display */}
      {activeTab === 'photos' ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {localMedia.photos.length > 0 ? (
            localMedia.photos.map((photo, index) => (
              <div key={index} className="relative aspect-square rounded-lg overflow-hidden bg-gray-100 group">
                <Image
                  src={photo}
                  alt={`Vehicle photo ${index + 1}`}
                  fill
                  className="object-cover"
                />
                <button 
                  onClick={() => removeMedia(index)}
                  className="absolute top-1 right-1 bg-white rounded-full p-1 shadow hover:bg-gray-100 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X className="h-4 w-4 text-gray-600" />
                </button>
              </div>
            ))
          ) : (
            <div className="col-span-full text-center py-8 text-gray-500">
              <ImageIcon className="h-12 w-12 mx-auto mb-2" />
              <p>No photos uploaded yet</p>
            </div>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {localMedia.videos.length > 0 ? (
            localMedia.videos.map((video, index) => (
              <div key={index} className="relative aspect-video rounded-lg overflow-hidden bg-gray-100 group">
                <video
                  src={video}
                  controls
                  className="w-full h-full object-cover"
                />
                <button 
                  onClick={() => removeMedia(index)}
                  className="absolute top-1 right-1 bg-white rounded-full p-1 shadow hover:bg-gray-100 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X className="h-4 w-4 text-gray-600" />
                </button>
              </div>
            ))
          ) : (
            <div className="col-span-full text-center py-8 text-gray-500">
              <Film className="h-12 w-12 mx-auto mb-2" />
              <p>No videos uploaded yet</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
