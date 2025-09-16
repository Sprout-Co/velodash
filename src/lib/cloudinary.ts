// Cloudinary Storage Operations
// Handle file uploads for vehicle media and documents using Cloudinary

import { CloudinaryFileReference } from '@/types';

// Cloudinary configuration
const CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
const UPLOAD_PRESET = 'velocity_dash_unsigned';

export interface UploadProgress {
  loaded: number;
  total: number;
  percentage: number;
}

export interface UploadOptions {
  folder?: string;
  public_id?: string;
  resource_type?: 'image' | 'video' | 'raw' | 'auto';
  transformation?: any;
  tags?: string[];
  context?: Record<string, string>;
}

export class CloudinaryService {
  // Upload a single file
  async uploadFile(
    file: File,
    vehicleId: string,
    type: 'photos' | 'videos' | 'documents',
    onProgress?: (progress: UploadProgress) => void
  ): Promise<CloudinaryFileReference> {
    try {
      // Validate file
      const validation = this.validateFile(file, type);
      if (!validation.valid) {
        throw new Error(validation.error);
      }

      // Create folder path
      const folder = `velocity-dash/vehicles/${vehicleId}/${type}`;
      
      // Determine resource type
      const resourceType = this.getResourceType(file, type);

      // Create form data
      const formData = new FormData();
      formData.append('file', file);
      formData.append('upload_preset', UPLOAD_PRESET);
      formData.append('folder', folder);
      formData.append('resource_type', resourceType);
      formData.append('tags', `vehicle-${vehicleId},${type}`);

      // Upload with progress tracking
      const response = await this.uploadWithProgress(
        formData,
        onProgress
      );

      if (!response.success) {
        throw new Error(response.error || 'Upload failed');
      }

      return this.transformCloudinaryResponse(response.data, vehicleId, type);
    } catch (error) {
      console.error('Error uploading file to Cloudinary:', error);
      throw new Error(`Failed to upload file: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Upload multiple files
  async uploadMultipleFiles(
    files: File[],
    vehicleId: string,
    type: 'photos' | 'videos' | 'documents',
    onProgress?: (fileIndex: number, progress: UploadProgress) => void
  ): Promise<CloudinaryFileReference[]> {
    try {
      const uploadPromises = files.map((file, index) => {
        const progressCallback = onProgress ? (progress: UploadProgress) => {
          onProgress(index, progress);
        } : undefined;

        return this.uploadFile(file, vehicleId, type, progressCallback);
      });

      return await Promise.all(uploadPromises);
    } catch (error) {
      console.error('Error uploading multiple files to Cloudinary:', error);
      throw new Error(`Failed to upload files: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Delete a file
  async deleteFile(publicId: string, resourceType: 'image' | 'video' | 'raw' = 'image'): Promise<void> {
    try {
      // Use API route for deletion since it requires API secret
      const response = await fetch('/api/cloudinary/delete', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          publicId,
          resourceType
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Delete failed');
      }
    } catch (error) {
      console.error('Error deleting file from Cloudinary:', error);
      throw new Error(`Failed to delete file: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Get all files for a vehicle
  async getVehicleFiles(vehicleId: string, type: 'photos' | 'videos' | 'documents'): Promise<CloudinaryFileReference[]> {
    try {
      // Use API route for getting files since it requires API secret
      const response = await fetch(`/api/cloudinary/files?vehicleId=${vehicleId}&type=${type}`);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to get files');
      }

      const result = await response.json();
      return result.data || [];
    } catch (error) {
      console.error('Error getting vehicle files from Cloudinary:', error);
      throw new Error(`Failed to get vehicle files: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Get file metadata
  async getFileMetadata(publicId: string, resourceType: 'image' | 'video' | 'raw' = 'image'): Promise<CloudinaryFileReference> {
    try {
      // Use API route for getting metadata since it requires API secret
      const response = await fetch(`/api/cloudinary/metadata?publicId=${publicId}&resourceType=${resourceType}`);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to get metadata');
      }

      const result = await response.json();
      return result.data;
    } catch (error) {
      console.error('Error getting file metadata from Cloudinary:', error);
      throw new Error(`Failed to get file metadata: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Generate shareable URL
  generateShareableUrl(publicId: string, options: {
    resourceType?: 'image' | 'video' | 'raw';
    transformation?: any;
    format?: string;
  } = {}): string {
    const { resourceType = 'image', transformation, format } = options;
    
    // Build URL manually since we can't use the SDK
    let url = `https://res.cloudinary.com/${CLOUD_NAME}/${resourceType}/upload`;
    
    if (transformation) {
      const transformString = this.buildTransformationString(transformation);
      url += `/${transformString}`;
    }
    
    url += `/${publicId}`;
    
    if (format) {
      url += `.${format}`;
    }
    
    return url;
  }

  // Generate thumbnail URL
  generateThumbnailUrl(publicId: string, width: number = 300, height: number = 300): string {
    const transformation = [
      { width, height, crop: 'fill', gravity: 'auto' },
      { quality: 'auto' }
    ];
    
    return this.generateShareableUrl(publicId, { transformation });
  }

  // Validate file before upload
  validateFile(file: File, type: 'photos' | 'videos' | 'documents'): { valid: boolean; error?: string } {
    const maxSizes = {
      photos: 10 * 1024 * 1024, // 10MB
      videos: 100 * 1024 * 1024, // 100MB
      documents: 25 * 1024 * 1024, // 25MB
    };

    const allowedTypes = {
      photos: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'],
      videos: ['video/mp4', 'video/mov', 'video/avi', 'video/webm'],
      documents: [
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'text/plain'
      ],
    };

    if (file.size > maxSizes[type]) {
      return {
        valid: false,
        error: `File size exceeds maximum allowed size for ${type} (${maxSizes[type] / (1024 * 1024)}MB)`
      };
    }

    if (!allowedTypes[type].includes(file.type)) {
      return {
        valid: false,
        error: `File type ${file.type} is not allowed for ${type}`
      };
    }

    return { valid: true };
  }

  // Private helper methods
  private getResourceType(file: File, type: 'photos' | 'videos' | 'documents'): 'image' | 'video' | 'raw' {
    if (type === 'videos' || file.type.startsWith('video/')) {
      return 'video';
    }
    if (type === 'documents' || !file.type.startsWith('image/')) {
      return 'raw';
    }
    return 'image';
  }

  private async uploadWithProgress(
    formData: FormData,
    onProgress?: (progress: UploadProgress) => void
  ): Promise<{ success: boolean; data?: any; error?: string }> {
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();

      xhr.upload.addEventListener('progress', (event) => {
        if (event.lengthComputable && onProgress) {
          const progress: UploadProgress = {
            loaded: event.loaded,
            total: event.total,
            percentage: Math.round((event.loaded / event.total) * 100)
          };
          onProgress(progress);
        }
      });

      xhr.addEventListener('load', () => {
        if (xhr.status === 200) {
          try {
            const response = JSON.parse(xhr.responseText);
            resolve({ success: true, data: response });
          } catch (error) {
            resolve({ success: false, error: 'Invalid response format' });
          }
        } else {
          resolve({ success: false, error: `Upload failed with status ${xhr.status}` });
        }
      });

      xhr.addEventListener('error', () => {
        resolve({ success: false, error: 'Network error during upload' });
      });

      xhr.open('POST', `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/upload`);
      xhr.send(formData);
    });
  }

  private buildTransformationString(transformation: any): string {
    if (Array.isArray(transformation)) {
      return transformation.map(t => this.buildSingleTransformation(t)).join(',');
    }
    return this.buildSingleTransformation(transformation);
  }

  private buildSingleTransformation(transform: any): string {
    const parts: string[] = [];
    
    if (transform.width) parts.push(`w_${transform.width}`);
    if (transform.height) parts.push(`h_${transform.height}`);
    if (transform.crop) parts.push(`c_${transform.crop}`);
    if (transform.gravity) parts.push(`g_${transform.gravity}`);
    if (transform.quality) parts.push(`q_${transform.quality}`);
    
    return parts.join(',');
  }

  private transformCloudinaryResponse(response: any, vehicleId: string, type: 'photos' | 'videos' | 'documents'): CloudinaryFileReference {
    return {
      id: response.public_id,
      publicId: response.public_id,
      name: response.original_filename,
      url: response.secure_url,
      format: response.format,
      resourceType: response.resource_type,
      size: response.bytes,
      width: response.width,
      height: response.height,
      createdAt: response.created_at,
      vehicleId,
      type,
      thumbnailUrl: this.generateThumbnailUrl(response.public_id),
      downloadUrl: response.secure_url
    };
  }

  private transformCloudinaryResource(resource: any, vehicleId?: string, type?: 'photos' | 'videos' | 'documents'): CloudinaryFileReference {
    return {
      id: resource.public_id,
      publicId: resource.public_id,
      name: resource.original_filename || resource.public_id.split('/').pop(),
      url: resource.secure_url,
      format: resource.format,
      resourceType: resource.resource_type,
      size: resource.bytes,
      width: resource.width,
      height: resource.height,
      createdAt: resource.created_at,
      vehicleId: vehicleId || this.extractVehicleIdFromPath(resource.public_id),
      type: type || this.extractTypeFromPath(resource.public_id),
      thumbnailUrl: this.generateThumbnailUrl(resource.public_id),
      downloadUrl: resource.secure_url
    };
  }

  private extractVehicleIdFromPath(publicId: string): string {
    const parts = publicId.split('/');
    const vehicleIndex = parts.findIndex(part => part === 'vehicles');
    return vehicleIndex !== -1 && parts[vehicleIndex + 1] ? parts[vehicleIndex + 1] : '';
  }

  private extractTypeFromPath(publicId: string): 'photos' | 'videos' | 'documents' {
    const parts = publicId.split('/');
    const lastPart = parts[parts.length - 2]; // Get the type from the folder structure
    return ['photos', 'videos', 'documents'].includes(lastPart) ? lastPart as any : 'documents';
  }
}

// Export singleton instance
export const cloudinaryService = new CloudinaryService();
