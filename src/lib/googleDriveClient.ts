// Client-side Google Drive service
// Handles API calls to Google Drive operations

import { GoogleDriveFileReference } from '@/types';

export interface UploadProgress {
  loaded: number;
  total: number;
  percentage: number;
}

export const googleDriveClient = {
  // Upload multiple files
  async uploadMultipleFiles(
    files: File[],
    vehicleId: string,
    type: 'photos' | 'videos' | 'documents',
    onProgress?: (fileIndex: number, progress: UploadProgress) => void
  ): Promise<GoogleDriveFileReference[]> {
    try {
      const formData = new FormData();
      
      // Add files to form data
      files.forEach(file => {
        formData.append('files', file);
      });
      
      formData.append('vehicleId', vehicleId);
      formData.append('type', type);

      // Simulate progress for each file
      if (onProgress) {
        files.forEach((file, index) => {
          onProgress(index, {
            loaded: file.size,
            total: file.size,
            percentage: 100,
          });
        });
      }

      const response = await fetch('/api/google-drive/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Upload failed');
      }

      const result = await response.json();
      return result.files;
    } catch (error) {
      console.error('Error uploading files:', error);
      throw new Error(`Failed to upload files: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  },

  // Upload a single file
  async uploadFile(
    file: File,
    vehicleId: string,
    type: 'photos' | 'videos' | 'documents',
    onProgress?: (progress: UploadProgress) => void
  ): Promise<GoogleDriveFileReference> {
    const files = await this.uploadMultipleFiles([file], vehicleId, type, (fileIndex, progress) => {
      if (fileIndex === 0 && onProgress) {
        onProgress(progress);
      }
    });
    
    return files[0];
  },

  // Delete a file
  async deleteFile(fileId: string): Promise<void> {
    try {
      const response = await fetch('/api/google-drive/delete', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ fileId }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Delete failed');
      }
    } catch (error) {
      console.error('Error deleting file:', error);
      throw new Error(`Failed to delete file: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  },

  // Get all files for a vehicle
  async getVehicleFiles(vehicleId: string, type: 'photos' | 'videos' | 'documents'): Promise<GoogleDriveFileReference[]> {
    try {
      const response = await fetch(`/api/google-drive/files?vehicleId=${vehicleId}&type=${type}`);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to get files');
      }

      const result = await response.json();
      return result.files;
    } catch (error) {
      console.error('Error getting vehicle files:', error);
      throw new Error(`Failed to get vehicle files: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  },

  // Get file metadata
  async getFileMetadata(fileId: string): Promise<GoogleDriveFileReference> {
    try {
      const response = await fetch(`/api/google-drive/metadata?fileId=${fileId}`);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to get file metadata');
      }

      const result = await response.json();
      return result.metadata;
    } catch (error) {
      console.error('Error getting file metadata:', error);
      throw new Error(`Failed to get file metadata: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  },

  // Generate shareable link
  async generateShareableLink(fileId: string, permission: 'reader' | 'writer' = 'reader'): Promise<string> {
    try {
      const response = await fetch('/api/google-drive/share', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ fileId, permission }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to generate shareable link');
      }

      const result = await response.json();
      return result.shareableLink;
    } catch (error) {
      console.error('Error generating shareable link:', error);
      throw new Error(`Failed to generate shareable link: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  },

  // Validate file before upload
  validateFile(file: File, type: 'photos' | 'videos' | 'documents'): { valid: boolean; error?: string } {
    const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    const ALLOWED_VIDEO_TYPES = ['video/mp4', 'video/webm', 'video/ogg'];
    const ALLOWED_DOCUMENT_TYPES = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'];
    const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

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

    if (type === 'documents' && !ALLOWED_DOCUMENT_TYPES.includes(file.type)) {
      return {
        valid: false,
        error: 'Invalid document file type. Please upload PDF or image files.'
      };
    }
    
    return { valid: true };
  }
};

// Helper function to generate thumbnail for images (client-side)
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
