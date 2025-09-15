import React, { useState } from 'react';
import { Vehicle } from '@/types';
import { Upload, X, ImageIcon, Film } from 'lucide-react';
import Image from 'next/image';

interface VehicleMediaHubProps {
  media: Vehicle['media'];
  vehicleId: string;
}

export default function VehicleMediaHub({ media, vehicleId }: VehicleMediaHubProps) {
  const [activeTab, setActiveTab] = useState<'photos' | 'videos'>('photos');
  const [isDragging, setIsDragging] = useState(false);
  
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
    
    // In a real application, we would handle file uploads here
    const files = Array.from(e.dataTransfer.files);
    if (files.length === 0) return;
    
    console.log('Files dropped:', files);
    // uploadMedia(files, vehicleId, activeTab);
  };
  
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.length) return;
    
    // In a real application, we would handle file uploads here
    const files = Array.from(e.target.files);
    console.log('Files selected:', files);
    // uploadMedia(files, vehicleId, activeTab);
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
          Photos ({media.photos.length})
        </button>
        <button
          className={`py-2 px-4 ${
            activeTab === 'videos'
              ? 'text-primary border-b-2 border-primary'
              : 'text-gray-500 hover:text-gray-700'
          }`}
          onClick={() => setActiveTab('videos')}
        >
          Videos ({media.videos.length})
        </button>
      </div>
      
      {/* Upload Area */}
      <div
        className={`border-2 border-dashed rounded-lg p-6 mb-4 text-center ${
          isDragging ? 'border-primary bg-primary/5' : 'border-gray-300'
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <div className="flex flex-col items-center">
          <Upload className="h-10 w-10 text-gray-400 mb-2" />
          <p className="mb-2 text-gray-500">
            Drag & drop {activeTab === 'photos' ? 'images' : 'videos'} here
          </p>
          <p className="text-xs text-gray-400 mb-4">
            or click to browse from your device
          </p>
          
          <label className="bg-primary text-white px-4 py-2 rounded-md cursor-pointer">
            Upload {activeTab === 'photos' ? 'Photos' : 'Videos'}
            <input
              type="file"
              accept={activeTab === 'photos' ? 'image/*' : 'video/*'}
              onChange={handleFileSelect}
              className="hidden"
              multiple
            />
          </label>
        </div>
      </div>
      
      {/* Media Display */}
      {activeTab === 'photos' ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {media.photos.length > 0 ? (
            media.photos.map((photo, index) => (
              <div key={index} className="relative aspect-square rounded-lg overflow-hidden bg-gray-100">
                <Image
                  src={photo}
                  alt={`Vehicle photo ${index + 1}`}
                  fill
                  className="object-cover"
                />
                <button className="absolute top-1 right-1 bg-white rounded-full p-1 shadow hover:bg-gray-100">
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
          {media.videos.length > 0 ? (
            media.videos.map((video, index) => (
              <div key={index} className="relative aspect-video rounded-lg overflow-hidden bg-gray-100">
                <video
                  src={video}
                  controls
                  className="w-full h-full object-cover"
                />
                <button className="absolute top-1 right-1 bg-white rounded-full p-1 shadow hover:bg-gray-100">
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
