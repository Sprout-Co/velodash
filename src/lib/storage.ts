// Firebase Storage Operations
// Handle file uploads for vehicle media

import { 
  ref, 
  uploadBytes, 
  getDownloadURL, 
  deleteObject, 
  listAll,
  getMetadata 
} from 'firebase/storage';
import { storage } from './firebase';
import { authService } from './auth';

// Storage paths
const STORAGE_PATHS = {
  VEHICLE_PHOTOS: 'vehicles/photos',
  VEHICLE_VIDEOS: 'vehicles/videos',
  VEHICLE_DOCUMENTS: 'vehicles/documents',
} as const;

// File type validation
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
const ALLOWED_VIDEO_TYPES = ['video/mp4', 'video/webm', 'video/ogg'];
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

export const storageService = {
  // Upload a single file
  async uploadFile(
    file: File, 
    vehicleId: string, 
    type: 'photos' | 'videos' | 'documents',
    onProgress?: (progress: number) => void
  ): Promise<string> {
    try {
      // Ensure user is authenticated
      let user = authService.getCurrentUser();
      if (!user) {
        console.log('No authenticated user, signing in anonymously...');
        user = await authService.signInAnonymously();
      }
      
      // Validate file type
      if (type === 'photos' && !ALLOWED_IMAGE_TYPES.includes(file.type)) {
        throw new Error('Invalid image file type. Please upload JPEG, PNG, or WebP images.');
      }
      
      if (type === 'videos' && !ALLOWED_VIDEO_TYPES.includes(file.type)) {
        throw new Error('Invalid video file type. Please upload MP4, WebM, or OGG videos.');
      }
      
      // Validate file size
      if (file.size > MAX_FILE_SIZE) {
        throw new Error(`File size too large. Maximum size is ${MAX_FILE_SIZE / (1024 * 1024)}MB.`);
      }
      
      // Generate unique filename
      const timestamp = Date.now();
      const fileExtension = file.name.split('.').pop();
      const fileName = `${vehicleId}_${timestamp}.${fileExtension}`;
      
      // Create storage reference
      const storagePath = type === 'photos' 
        ? STORAGE_PATHS.VEHICLE_PHOTOS
        : type === 'videos' 
        ? STORAGE_PATHS.VEHICLE_VIDEOS
        : STORAGE_PATHS.VEHICLE_DOCUMENTS;
      
      const storageRef = ref(storage, `${storagePath}/${fileName}`);
      
      // Upload file
      const snapshot = await uploadBytes(storageRef, file);
      
      // Get download URL
      const downloadURL = await getDownloadURL(snapshot.ref);
      
      // Simulate progress callback (Firebase doesn't provide real-time progress)
      if (onProgress) {
        onProgress(100);
      }
      
      return downloadURL;
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
  ): Promise<string[]> {
    try {
      const uploadPromises = files.map(async (file, index) => {
        const progressCallback = onProgress ? (progress: number) => onProgress(index, progress) : undefined;
        return await this.uploadFile(file, vehicleId, type, progressCallback);
      });
      
      const downloadURLs = await Promise.all(uploadPromises);
      return downloadURLs;
    } catch (error) {
      console.error('Error uploading multiple files:', error);
      throw new Error(`Failed to upload files: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  },

  // Delete a file
  async deleteFile(downloadURL: string): Promise<void> {
    try {
      // Ensure user is authenticated
      let user = authService.getCurrentUser();
      if (!user) {
        console.log('No authenticated user, signing in anonymously...');
        user = await authService.signInAnonymously();
      }
      
      // Extract the file path from the download URL
      const url = new URL(downloadURL);
      const pathMatch = url.pathname.match(/\/o\/(.+)\?/);
      
      if (!pathMatch) {
        throw new Error('Invalid download URL');
      }
      
      const filePath = decodeURIComponent(pathMatch[1]);
      const fileRef = ref(storage, filePath);
      
      await deleteObject(fileRef);
    } catch (error) {
      console.error('Error deleting file:', error);
      throw new Error(`Failed to delete file: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  },

  // Get all files for a vehicle
  async getVehicleFiles(vehicleId: string, type: 'photos' | 'videos' | 'documents'): Promise<string[]> {
    try {
      const storagePath = type === 'photos' 
        ? STORAGE_PATHS.VEHICLE_PHOTOS
        : type === 'videos' 
        ? STORAGE_PATHS.VEHICLE_VIDEOS
        : STORAGE_PATHS.VEHICLE_DOCUMENTS;
      
      const folderRef = ref(storage, storagePath);
      const result = await listAll(folderRef);
      
      // Filter files for this vehicle
      const vehicleFiles = result.items.filter(item => 
        item.name.startsWith(`${vehicleId}_`)
      );
      
      // Get download URLs
      const downloadURLs = await Promise.all(
        vehicleFiles.map(async (fileRef) => {
          return await getDownloadURL(fileRef);
        })
      );
      
      return downloadURLs;
    } catch (error) {
      console.error('Error getting vehicle files:', error);
      throw new Error(`Failed to get vehicle files: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  },

  // Get file metadata
  async getFileMetadata(downloadURL: string): Promise<any> {
    try {
      const url = new URL(downloadURL);
      const pathMatch = url.pathname.match(/\/o\/(.+)\?/);
      
      if (!pathMatch) {
        throw new Error('Invalid download URL');
      }
      
      const filePath = decodeURIComponent(pathMatch[1]);
      const fileRef = ref(storage, filePath);
      
      const metadata = await getMetadata(fileRef);
      return metadata;
    } catch (error) {
      console.error('Error getting file metadata:', error);
      throw new Error(`Failed to get file metadata: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  },

  // Validate file before upload
  validateFile(file: File, type: 'photos' | 'videos' | 'documents'): { valid: boolean; error?: string } {
    // Check file size
    if (file.size > MAX_FILE_SIZE) {
      return {
        valid: false,
        error: `File size too large. Maximum size is ${MAX_FILE_SIZE / (1024 * 1024)}MB.`
      };
    }
    
    // Check file type
    if (type === 'photos' && !ALLOWED_IMAGE_TYPES.includes(file.type)) {
      return {
        valid: false,
        error: 'Invalid image file type. Please upload JPEG, PNG, or WebP images.'
      };
    }
    
    if (type === 'videos' && !ALLOWED_VIDEO_TYPES.includes(file.type)) {
      return {
        valid: false,
        error: 'Invalid video file type. Please upload MP4, WebM, or OGG videos.'
      };
    }
    
    return { valid: true };
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
