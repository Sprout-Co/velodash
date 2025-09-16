// Cloudinary Storage Operations
// Handle file uploads for vehicle media and documents

import { cloudinaryService } from './cloudinary';
import { CloudinaryFileReference } from '@/types';

export const storageService = {
  // Upload a single file
  async uploadFile(
    file: File, 
    vehicleId: string, 
    type: 'photos' | 'videos' | 'documents',
    onProgress?: (progress: number) => void
  ): Promise<CloudinaryFileReference> {
    try {
      const progressCallback = onProgress ? (progress: { loaded: number; total: number; percentage: number }) => {
        onProgress(progress.percentage);
      } : undefined;

      return await cloudinaryService.uploadFile(file, vehicleId, type, progressCallback);
    } catch (error) {
      console.error('Error uploading file:', error);
      throw new Error(`Failed to upload file: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  },

  // Upload multiple files
  async uploadMultipleFiles(
    files: File[], 
    vehicleId: string, 
    type: 'photos' | 'videos' | 'documents',
    onProgress?: (fileIndex: number, progress: number) => void
  ): Promise<CloudinaryFileReference[]> {
    try {
      const progressCallback = onProgress ? (fileIndex: number, progress: { loaded: number; total: number; percentage: number }) => {
        onProgress(fileIndex, progress.percentage);
      } : undefined;

      return await cloudinaryService.uploadMultipleFiles(files, vehicleId, type, progressCallback);
    } catch (error) {
      console.error('Error uploading multiple files:', error);
      throw new Error(`Failed to upload files: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  },

  // Delete a file
  async deleteFile(publicId: string, resourceType: 'image' | 'video' | 'raw' = 'image'): Promise<void> {
    try {
      await cloudinaryService.deleteFile(publicId, resourceType);
    } catch (error) {
      console.error('Error deleting file:', error);
      throw new Error(`Failed to delete file: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  },

  // Get all files for a vehicle
  async getVehicleFiles(vehicleId: string, type: 'photos' | 'videos' | 'documents'): Promise<CloudinaryFileReference[]> {
    try {
      return await cloudinaryService.getVehicleFiles(vehicleId, type);
    } catch (error) {
      console.error('Error getting vehicle files:', error);
      throw new Error(`Failed to get vehicle files: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  },

  // Get file metadata
  async getFileMetadata(publicId: string, resourceType: 'image' | 'video' | 'raw' = 'image'): Promise<CloudinaryFileReference> {
    try {
      return await cloudinaryService.getFileMetadata(publicId, resourceType);
    } catch (error) {
      console.error('Error getting file metadata:', error);
      throw new Error(`Failed to get file metadata: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  },

  // Validate file before upload
  validateFile(file: File, type: 'photos' | 'videos' | 'documents'): { valid: boolean; error?: string } {
    return cloudinaryService.validateFile(file, type);
  },

  // Generate shareable URL for a file
  generateShareableUrl(publicId: string, options: {
    resourceType?: 'image' | 'video' | 'raw';
    transformation?: any;
    format?: string;
  } = {}): string {
    try {
      return cloudinaryService.generateShareableUrl(publicId, options);
    } catch (error) {
      console.error('Error generating shareable URL:', error);
      throw new Error(`Failed to generate shareable URL: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  },

  // Get download URL for a file
  async getDownloadUrl(publicId: string, resourceType: 'image' | 'video' | 'raw' = 'image'): Promise<string> {
    try {
      const metadata = await cloudinaryService.getFileMetadata(publicId, resourceType);
      return metadata.downloadUrl;
    } catch (error) {
      console.error('Error getting download URL:', error);
      throw new Error(`Failed to get download URL: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  },

  // Generate thumbnail URL for images
  generateThumbnailUrl(publicId: string, width: number = 300, height: number = 300): string {
    try {
      return cloudinaryService.generateThumbnailUrl(publicId, width, height);
    } catch (error) {
      console.error('Error generating thumbnail URL:', error);
      throw new Error(`Failed to generate thumbnail URL: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
};

// Helper function to generate thumbnail for images
export const generateThumbnail = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();
    
    img.onload = () => {
      // Calculate thumbnail dimensions (max 300x300)
      const maxSize = 300;
      let { width, height } = img;
      
      if (width > height) {
        if (width > maxSize) {
          height = (height * maxSize) / width;
          width = maxSize;
        }
      } else {
        if (height > maxSize) {
          width = (width * maxSize) / height;
          height = maxSize;
        }
      }
      
      canvas.width = width;
      canvas.height = height;
      
      // Draw image to canvas
      ctx?.drawImage(img, 0, 0, width, height);
      
      // Convert to data URL
      const thumbnail = canvas.toDataURL('image/jpeg', 0.8);
      resolve(thumbnail);
    };
    
    img.onerror = () => reject(new Error('Failed to load image'));
    img.src = URL.createObjectURL(file);
  });
};
