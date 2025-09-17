import React, { useState, useEffect } from 'react';
import { Vehicle, FileReference } from '@/types';
import { Upload, X, ImageIcon, Film, Loader2, AlertCircle, ExternalLink } from 'lucide-react';
import Image from 'next/image';
import { storageService } from '@/lib/storage';
// Removed generateThumbnail import as Cloudinary handles thumbnails automatically
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
  const [localMedia, setLocalMedia] = useState<Vehicle['media']>({
    photos: media?.photos || [],
    videos: media?.videos || []
  });
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const [selectedPhoto, setSelectedPhoto] = useState<FileReference | null>(null);

  // Sync localMedia when media prop changes
  useEffect(() => {
    console.log('VehicleMediaHub: media prop changed:', media);
    setLocalMedia({
      photos: media?.photos || [],
      videos: media?.videos || []
    });
  }, [media]);

  // Close preview on Escape key
  useEffect(() => {
    if (!isImageModalOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsImageModalOpen(false);
        setSelectedPhoto(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isImageModalOpen]);

  // Helper functions to get URLs for both Google Drive and Cloudinary files
  const getImageUrl = (file: FileReference): string => {
    console.log('getImageUrl called with file:', file);
    if ('url' in file) {
      // Cloudinary file reference
      console.log('Using Cloudinary URL:', file.url);
      return file.url;
    } else {
      // Google Drive file reference
      console.log('Using Google Drive URL:', file.webViewLink);
      return file.webViewLink;
    }
  };

  const getVideoUrl = (file: FileReference): string => {
    if ('url' in file) {
      // Cloudinary file reference
      return file.url;
    } else {
      // Google Drive file reference
      return file.webContentLink;
    }
  };

  const getViewUrl = (file: FileReference): string => {
    if ('url' in file) {
      // Cloudinary file reference
      return file.url;
    } else {
      // Google Drive file reference
      return file.webViewLink;
    }
  };
  
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
      const uploadedFiles = await storageService.uploadMultipleFiles(
        files,
        vehicleId,
        activeTab,
        (fileIndex, progress) => {
          setUploadProgress(prev => ({ ...prev, [fileIndex]: progress }));
        }
      );
      
      console.log('Uploaded files result:', uploadedFiles);
      
      // Update local media state
      // Ensure we have a valid array for the current tab
      const currentMediaArray = Array.isArray(localMedia[activeTab]) 
        ? localMedia[activeTab] 
        : [];
      
      console.log('Upload debug:', {
        activeTab,
        localMedia,
        currentMediaArray,
        uploadedFiles,
        isArray: Array.isArray(currentMediaArray)
      });
      
      const updatedMedia = {
        ...localMedia,
        [activeTab]: [...currentMediaArray, ...uploadedFiles]
      };
      
      setLocalMedia(updatedMedia);
      
      // Update in Firestore
      await vehicleService.updateVehicleMedia(vehicleId, updatedMedia);
      
      // Notify parent component
      if (onMediaUpdate) {
        console.log('Calling onMediaUpdate with:', updatedMedia);
        onMediaUpdate(updatedMedia);
      } else {
        console.warn('onMediaUpdate callback not provided');
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
      const mediaArray = localMedia[activeTab] || [];
      const fileToRemove = mediaArray[index];
      
      if (!fileToRemove) {
        throw new Error('File not found');
      }
      
      // Delete from storage
      // Check if it's a Cloudinary file reference by checking for publicId property
      if ('publicId' in fileToRemove && fileToRemove.publicId) {
        console.log('Deleting Cloudinary file:', fileToRemove.publicId, fileToRemove.resourceType);
        try {
          await storageService.deleteFile(fileToRemove.publicId, fileToRemove.resourceType);
          console.log('Successfully deleted file from Cloudinary');
        } catch (deleteError) {
          console.warn('Failed to delete file from Cloudinary, but continuing with UI update:', deleteError);
          // Continue with UI update even if Cloudinary deletion fails
        }
      } else if ('id' in fileToRemove && fileToRemove.id) {
        // Legacy Google Drive file reference - this might not work with current storage service
        console.log('Attempting to delete Google Drive file:', fileToRemove.id);
        // For now, just log a warning since we don't have Google Drive delete implemented
        console.warn('Google Drive file deletion not implemented, removing from UI only');
      } else {
        console.warn('Unknown file type, removing from UI only');
      }
      
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
          Photos ({(localMedia.photos || []).length})
        </button>
        <button
          className={`py-2 px-4 ${
            activeTab === 'videos'
              ? 'text-primary border-b-2 border-primary'
              : 'text-gray-500 hover:text-gray-700'
          }`}
          onClick={() => setActiveTab('videos')}
        >
          Videos ({(localMedia.videos || []).length})
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
          {(() => {
            console.log('Rendering photos, localMedia.photos:', localMedia.photos);
            console.log('Photos array length:', (localMedia.photos || []).length);
            console.log(' ===>Photos array:', localMedia.photos);
            const hasPhotos = (localMedia.photos || []).length > 0;
            console.log('Has photos:', hasPhotos);
            return hasPhotos;
          })() ? (
            (localMedia.photos || []).map((photo, index) => (
              <div
                key={photo.id}
                className="relative aspect-square rounded-lg overflow-hidden bg-gray-100 group cursor-zoom-in"
                onClick={() => {
                  setSelectedPhoto(photo);
                  setIsImageModalOpen(true);
                }}
              >
                <img
                  src={getImageUrl(photo)}
                  alt={`Vehicle photo ${index + 1}`}
                  className="w-full h-full object-cover"
                />
                
                {/* Action buttons overlay */}
                <div className="absolute top-2 right-2 flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                  <a
                    href={getViewUrl(photo)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-white/90 backdrop-blur-sm rounded-full p-2 shadow-lg hover:bg-white transition-colors"
                    title="View in new tab"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <ExternalLink className="h-4 w-4 text-gray-600" />
                  </a>
                  <button 
                    onClick={(e) => { e.stopPropagation(); removeMedia(index); }}
                    className="bg-white/90 backdrop-blur-sm rounded-full p-2 shadow-lg hover:bg-red-50 hover:text-red-600 transition-colors"
                    title="Delete photo"
                  >
                    <X className="h-4 w-4 text-gray-600" />
                  </button>
                </div>
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
          {(localMedia.videos || []).length > 0 ? (
            (localMedia.videos || []).map((video, index) => (
              <div key={video.id} className="relative aspect-video rounded-lg overflow-hidden bg-gray-100 group">
                <video
                  src={getVideoUrl(video)}
                  controls
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-1 right-1 flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <a
                    href={getViewUrl(video)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-white rounded-full p-1 shadow hover:bg-gray-100"
                    title="View in Google Drive"
                  >
                    <ExternalLink className="h-4 w-4 text-gray-600" />
                  </a>
                  <button 
                    onClick={() => removeMedia(index)}
                    className="bg-white rounded-full p-1 shadow hover:bg-gray-100"
                    title="Delete video"
                  >
                    <X className="h-4 w-4 text-gray-600" />
                  </button>
                </div>
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

      {/* Image Preview Modal */}
      {isImageModalOpen && selectedPhoto && (
        <div
          className="image-preview-overlay"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setIsImageModalOpen(false);
              setSelectedPhoto(null);
            }
          }}
        >
          <div className="image-preview-modal">
            <div className="image-preview-header">
              <div className="image-preview-title">{('name' in selectedPhoto && selectedPhoto.name) ? selectedPhoto.name : 'Preview'}</div>
              <div className="image-preview-actions">
                <a
                  href={getViewUrl(selectedPhoto)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="image-preview-action-btn"
                >
                  <ExternalLink className="icon" />
                  <span>Open in new tab</span>
                </a>
                <button
                  className="image-preview-action-btn image-preview-delete-btn"
                  onClick={() => {
                    const photoIndex = (localMedia.photos || []).findIndex(photo => photo.id === selectedPhoto.id);
                    if (photoIndex !== -1) {
                      removeMedia(photoIndex);
                      setIsImageModalOpen(false);
                      setSelectedPhoto(null);
                    }
                  }}
                  aria-label="Delete image"
                >
                  <X className="icon" />
                  <span>Delete</span>
                </button>
                <button
                  className="image-preview-close"
                  onClick={() => { setIsImageModalOpen(false); setSelectedPhoto(null); }}
                  aria-label="Close preview"
                >
                  <X className="icon" />
                </button>
              </div>
            </div>
            <div className="image-preview-content">
              <img
                src={getImageUrl(selectedPhoto)}
                alt={('name' in selectedPhoto && selectedPhoto.name) ? selectedPhoto.name : 'Vehicle photo preview'}
                className="image-preview-img"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
