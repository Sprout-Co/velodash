'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { Upload, X, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { storageService } from '@/lib/storage';

export default function CloudinaryUploadTest() {
  const [uploadedFiles, setUploadedFiles] = useState<any[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<{ [key: number]: number }>({});
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.length) return;
    
    const files = Array.from(e.target.files);
    setIsUploading(true);
    setError(null);
    setSuccess(null);
    
    try {
      // Use a test vehicle ID
      const testVehicleId = 'test-vehicle-' + Date.now();
      
      // Upload files
      const uploadedFileRefs = await storageService.uploadMultipleFiles(
        files, 
        testVehicleId, 
        'photos',
        (fileIndex, progress) => {
          setUploadProgress(prev => ({ ...prev, [fileIndex]: progress }));
        }
      );
      
      setUploadedFiles(prev => [...prev, ...uploadedFileRefs]);
      setSuccess(`Successfully uploaded ${uploadedFileRefs.length} file(s)`);
      
    } catch (error) {
      console.error('Upload error:', error);
      setError(error instanceof Error ? error.message : 'Upload failed');
    } finally {
      setIsUploading(false);
      setUploadProgress({});
    }
  };

  const handleDelete = async (file: any) => {
    try {
      if ('publicId' in file) {
        await storageService.deleteFile(file.publicId, file.resourceType);
      } else {
        await storageService.deleteFile(file.id);
      }
      
      setUploadedFiles(prev => prev.filter(f => f.id !== file.id));
      setSuccess('File deleted successfully');
    } catch (error) {
      console.error('Delete error:', error);
      setError(error instanceof Error ? error.message : 'Delete failed');
    }
  };

  const getImageUrl = (file: any): string => {
    if ('url' in file) {
      return file.url;
    } else {
      return file.webViewLink || file.webContentLink;
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Cloudinary Upload Test</h2>
        
        {/* Upload Area */}
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center mb-6">
          <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <div className="text-lg font-medium text-gray-900 mb-2">
            Upload test files to Cloudinary
          </div>
          <div className="text-sm text-gray-500 mb-4">
            Drag and drop files here, or click to select
          </div>
          <input
            type="file"
            multiple
            accept="image/*,video/*,.pdf,.doc,.docx"
            onChange={handleFileSelect}
            className="hidden"
            id="file-upload"
            disabled={isUploading}
          />
          <label
            htmlFor="file-upload"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary cursor-pointer disabled:opacity-50"
          >
            {isUploading ? (
              <>
                <Loader2 className="animate-spin -ml-1 mr-2 h-4 w-4" />
                Uploading...
              </>
            ) : (
              'Select Files'
            )}
          </label>
        </div>

        {/* Progress */}
        {Object.keys(uploadProgress).length > 0 && (
          <div className="mb-6">
            <h3 className="text-lg font-medium text-gray-900 mb-2">Upload Progress</h3>
            {Object.entries(uploadProgress).map(([index, progress]) => (
              <div key={index} className="mb-2">
                <div className="flex justify-between text-sm text-gray-600 mb-1">
                  <span>File {parseInt(index) + 1}</span>
                  <span>{progress}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-primary h-2 rounded-full transition-all duration-300"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Messages */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md">
            <div className="flex">
              <AlertCircle className="h-5 w-5 text-red-400" />
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">Error</h3>
                <div className="mt-2 text-sm text-red-700">{error}</div>
              </div>
            </div>
          </div>
        )}

        {success && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-md">
            <div className="flex">
              <CheckCircle className="h-5 w-5 text-green-400" />
              <div className="ml-3">
                <h3 className="text-sm font-medium text-green-800">Success</h3>
                <div className="mt-2 text-sm text-green-700">{success}</div>
              </div>
            </div>
          </div>
        )}

        {/* Uploaded Files */}
        {uploadedFiles.length > 0 && (
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">Uploaded Files</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {uploadedFiles.map((file, index) => (
                <div key={file.id} className="border rounded-lg p-4">
                  <div className="aspect-square bg-gray-100 rounded-lg mb-3 overflow-hidden">
                    {file.format && ['jpg', 'jpeg', 'png', 'webp'].includes(file.format.toLowerCase()) ? (
                      <Image
                        src={getImageUrl(file)}
                        alt={file.name}
                        width={300}
                        height={300}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <div className="text-center">
                          <div className="text-2xl mb-2">📄</div>
                          <div className="text-sm text-gray-500">{file.format?.toUpperCase()}</div>
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="text-sm">
                    <div className="font-medium text-gray-900 truncate">{file.name}</div>
                    <div className="text-gray-500">
                      {file.size ? `${(file.size / 1024 / 1024).toFixed(2)} MB` : 'Unknown size'}
                    </div>
                    <div className="text-gray-500">
                      {file.format?.toUpperCase() || 'Unknown format'}
                    </div>
                  </div>
                  <div className="mt-3 flex space-x-2">
                    <a
                      href={getImageUrl(file)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 text-center px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded"
                    >
                      View
                    </a>
                    <button
                      onClick={() => handleDelete(file)}
                      className="px-3 py-1 text-sm bg-red-100 hover:bg-red-200 text-red-700 rounded"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
