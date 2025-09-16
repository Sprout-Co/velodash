// Google Drive API Operations
// Handle file uploads, downloads, and management for vehicle documents and media

import { google } from 'googleapis';
import { OAuth2Client } from 'google-auth-library';

// Google Drive API configuration
const GOOGLE_DRIVE_CONFIG = {
  clientId: process.env.GOOGLE_DRIVE_CLIENT_ID!,
  clientSecret: process.env.GOOGLE_DRIVE_CLIENT_SECRET!,
  redirectUri: process.env.GOOGLE_DRIVE_REDIRECT_URI!,
  refreshToken: process.env.GOOGLE_DRIVE_REFRESH_TOKEN!,
  folderId: process.env.GOOGLE_DRIVE_FOLDER_ID!,
};

// File type validation
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
const ALLOWED_VIDEO_TYPES = ['video/mp4', 'video/webm', 'video/ogg'];
const ALLOWED_DOCUMENT_TYPES = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'];
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

// Initialize Google Drive API client
const initializeDriveClient = (): OAuth2Client => {
  const oauth2Client = new OAuth2Client(
    GOOGLE_DRIVE_CONFIG.clientId,
    GOOGLE_DRIVE_CONFIG.clientSecret,
    GOOGLE_DRIVE_CONFIG.redirectUri
  );

  oauth2Client.setCredentials({
    refresh_token: GOOGLE_DRIVE_CONFIG.refreshToken,
  });

  return oauth2Client;
};

// Get Google Drive service instance
const getDriveService = () => {
  const auth = initializeDriveClient();
  return google.drive({ version: 'v3', auth });
};

export interface GoogleDriveFile {
  id: string;
  name: string;
  webViewLink: string;
  webContentLink: string;
  mimeType: string;
  size: string;
  createdTime: string;
  modifiedTime: string;
}

export interface UploadProgress {
  loaded: number;
  total: number;
  percentage: number;
}

export const googleDriveService = {
  // Create folder structure for vehicle
  async createVehicleFolder(vehicleId: string): Promise<string> {
    try {
      const drive = getDriveService();
      
      // Create main vehicle folder
      const vehicleFolderResponse = await drive.files.create({
        requestBody: {
          name: `Vehicle_${vehicleId}`,
          mimeType: 'application/vnd.google-apps.folder',
          parents: [GOOGLE_DRIVE_CONFIG.folderId],
        },
        fields: 'id',
      });

      const vehicleFolderId = vehicleFolderResponse.data.id!;

      // Create subfolders for different media types
      const subfolders = [
        { name: 'Documents', type: 'documents' },
        { name: 'Photos', type: 'photos' },
        { name: 'Videos', type: 'videos' },
      ];

      for (const subfolder of subfolders) {
        await drive.files.create({
          requestBody: {
            name: subfolder.name,
            mimeType: 'application/vnd.google-apps.folder',
            parents: [vehicleFolderId],
          },
        });
      }

      return vehicleFolderId;
    } catch (error) {
      console.error('Error creating vehicle folder:', error);
      throw new Error(`Failed to create vehicle folder: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  },

  // Get vehicle folder ID (create if doesn't exist)
  async getVehicleFolderId(vehicleId: string): Promise<string> {
    try {
      const drive = getDriveService();
      
      // Search for existing vehicle folder
      const searchResponse = await drive.files.list({
        q: `name='Vehicle_${vehicleId}' and parents in '${GOOGLE_DRIVE_CONFIG.folderId}' and mimeType='application/vnd.google-apps.folder'`,
        fields: 'files(id, name)',
      });

      if (searchResponse.data.files && searchResponse.data.files.length > 0) {
        return searchResponse.data.files[0].id!;
      }

      // Create folder if it doesn't exist
      return await this.createVehicleFolder(vehicleId);
    } catch (error) {
      console.error('Error getting vehicle folder:', error);
      throw new Error(`Failed to get vehicle folder: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  },

  // Upload a single file to Google Drive
  async uploadFile(
    file: File,
    vehicleId: string,
    type: 'photos' | 'videos' | 'documents',
    onProgress?: (progress: UploadProgress) => void
  ): Promise<GoogleDriveFile> {
    try {
      // Validate file
      const validation = this.validateFile(file, type);
      if (!validation.valid) {
        throw new Error(validation.error);
      }

      const drive = getDriveService();
      const vehicleFolderId = await this.getVehicleFolderId(vehicleId);

      // Get the appropriate subfolder
      const subfolderResponse = await drive.files.list({
        q: `name='${type.charAt(0).toUpperCase() + type.slice(1)}' and parents in '${vehicleFolderId}' and mimeType='application/vnd.google-apps.folder'`,
        fields: 'files(id)',
      });

      const subfolderId = subfolderResponse.data.files?.[0]?.id || vehicleFolderId;

      // Generate unique filename
      const timestamp = Date.now();
      const fileExtension = file.name.split('.').pop();
      const fileName = `${vehicleId}_${timestamp}.${fileExtension}`;

      // Convert File to Buffer
      const buffer = Buffer.from(await file.arrayBuffer());

      // Upload file
      const uploadResponse = await drive.files.create({
        requestBody: {
          name: fileName,
          parents: [subfolderId],
        },
        media: {
          mimeType: file.type,
          body: buffer,
        },
        fields: 'id,name,webViewLink,webContentLink,mimeType,size,createdTime,modifiedTime',
      });

      // Simulate progress callback
      if (onProgress) {
        onProgress({
          loaded: file.size,
          total: file.size,
          percentage: 100,
        });
      }

      return {
        id: uploadResponse.data.id!,
        name: uploadResponse.data.name!,
        webViewLink: uploadResponse.data.webViewLink!,
        webContentLink: uploadResponse.data.webContentLink!,
        mimeType: uploadResponse.data.mimeType!,
        size: uploadResponse.data.size || '0',
        createdTime: uploadResponse.data.createdTime!,
        modifiedTime: uploadResponse.data.modifiedTime!,
      };
    } catch (error) {
      console.error('Error uploading file to Google Drive:', error);
      throw new Error(`Failed to upload file: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  },

  // Upload multiple files
  async uploadMultipleFiles(
    files: File[],
    vehicleId: string,
    type: 'photos' | 'videos' | 'documents',
    onProgress?: (fileIndex: number, progress: UploadProgress) => void
  ): Promise<GoogleDriveFile[]> {
    try {
      const uploadPromises = files.map(async (file, index) => {
        const progressCallback = onProgress ? (progress: UploadProgress) => onProgress(index, progress) : undefined;
        return await this.uploadFile(file, vehicleId, type, progressCallback);
      });

      const results = await Promise.all(uploadPromises);
      return results;
    } catch (error) {
      console.error('Error uploading multiple files to Google Drive:', error);
      throw new Error(`Failed to upload files: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  },

  // Delete a file from Google Drive
  async deleteFile(fileId: string): Promise<void> {
    try {
      const drive = getDriveService();
      await drive.files.delete({
        fileId: fileId,
      });
    } catch (error) {
      console.error('Error deleting file from Google Drive:', error);
      throw new Error(`Failed to delete file: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  },

  // Get all files for a vehicle
  async getVehicleFiles(vehicleId: string, type: 'photos' | 'videos' | 'documents'): Promise<GoogleDriveFile[]> {
    try {
      const drive = getDriveService();
      const vehicleFolderId = await this.getVehicleFolderId(vehicleId);

      // Get the appropriate subfolder
      const subfolderResponse = await drive.files.list({
        q: `name='${type.charAt(0).toUpperCase() + type.slice(1)}' and parents in '${vehicleFolderId}' and mimeType='application/vnd.google-apps.folder'`,
        fields: 'files(id)',
      });

      const subfolderId = subfolderResponse.data.files?.[0]?.id || vehicleFolderId;

      // Get files in the subfolder
      const filesResponse = await drive.files.list({
        q: `parents in '${subfolderId}' and trashed=false`,
        fields: 'files(id,name,webViewLink,webContentLink,mimeType,size,createdTime,modifiedTime)',
        orderBy: 'createdTime desc',
      });

      return (filesResponse.data.files || []).map(file => ({
        id: file.id!,
        name: file.name!,
        webViewLink: file.webViewLink!,
        webContentLink: file.webContentLink!,
        mimeType: file.mimeType!,
        size: file.size || '0',
        createdTime: file.createdTime!,
        modifiedTime: file.modifiedTime!,
      }));
    } catch (error) {
      console.error('Error getting vehicle files from Google Drive:', error);
      throw new Error(`Failed to get vehicle files: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  },

  // Get file metadata
  async getFileMetadata(fileId: string): Promise<GoogleDriveFile> {
    try {
      const drive = getDriveService();
      const response = await drive.files.get({
        fileId: fileId,
        fields: 'id,name,webViewLink,webContentLink,mimeType,size,createdTime,modifiedTime',
      });

      return {
        id: response.data.id!,
        name: response.data.name!,
        webViewLink: response.data.webViewLink!,
        webContentLink: response.data.webContentLink!,
        mimeType: response.data.mimeType!,
        size: response.data.size || '0',
        createdTime: response.data.createdTime!,
        modifiedTime: response.data.modifiedTime!,
      };
    } catch (error) {
      console.error('Error getting file metadata from Google Drive:', error);
      throw new Error(`Failed to get file metadata: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  },

  // Generate shareable link for a file
  async generateShareableLink(fileId: string, permission: 'reader' | 'writer' = 'reader'): Promise<string> {
    try {
      const drive = getDriveService();
      
      // Set permissions to make file viewable by anyone with the link
      await drive.permissions.create({
        fileId: fileId,
        requestBody: {
          role: permission,
          type: 'anyone',
        },
      });

      // Get the file to return the webViewLink
      const fileResponse = await drive.files.get({
        fileId: fileId,
        fields: 'webViewLink',
      });

      return fileResponse.data.webViewLink!;
    } catch (error) {
      console.error('Error generating shareable link:', error);
      throw new Error(`Failed to generate shareable link: ${error instanceof Error ? error.message : 'Unknown error'}`);
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

    if (type === 'documents' && !ALLOWED_DOCUMENT_TYPES.includes(file.type)) {
      return {
        valid: false,
        error: 'Invalid document file type. Please upload PDF or image files.'
      };
    }
    
    return { valid: true };
  },

  // Get download URL for a file
  async getDownloadUrl(fileId: string): Promise<string> {
    try {
      const drive = getDriveService();
      const response = await drive.files.get({
        fileId: fileId,
        fields: 'webContentLink',
      });

      return response.data.webContentLink || '';
    } catch (error) {
      console.error('Error getting download URL:', error);
      throw new Error(`Failed to get download URL: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
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
