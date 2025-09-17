// Test component for image upload functionality
// This can be used to test the upload feature independently

'use client';

import { useState } from 'react';
import Image from 'next/image';
import { storageService } from '@/lib/storage';
import { Upload, CheckCircle, AlertCircle, Loader2, X } from 'lucide-react';

export default function ImageUploadTest() {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadedUrls, setUploadedUrls] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);
    setError(null);
    setSuccess(null);

    try {
      const fileArray = Array.from(files);
      
      // Validate files
      for (const file of fileArray) {
        const validation = storageService.validateFile(file, 'photos');
        if (!validation.valid) {
          throw new Error(validation.error);
        }
      }

      // Upload files
      const urls = await storageService.uploadMultipleFiles(
        fileArray,
        'test-vehicle-id',
        'photos'
      );

      setUploadedUrls(prev => [...prev, ...urls.map(file => file.url)]);
      setSuccess(`Successfully uploaded ${urls.length} file(s)`);
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setIsUploading(false);
    }
  };

  const handleDelete = async (url: string) => {
    try {
      await storageService.deleteFile(url);
      setUploadedUrls(prev => prev.filter(u => u !== url));
      setSuccess('File deleted successfully');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Delete failed');
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow">
      <h2 className="text-2xl font-bold mb-6">Image Upload Test</h2>
      
      {/* Status Messages */}
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md flex items-center">
          <AlertCircle className="h-4 w-4 text-red-500 mr-2" />
          <p className="text-red-700 text-sm">{error}</p>
        </div>
      )}
      
      {success && (
        <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-md flex items-center">
          <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
          <p className="text-green-700 text-sm">{success}</p>
        </div>
      )}

      {/* Upload Area */}
      <div className="mb-6">
        <label className="block mb-2 text-sm font-medium text-gray-700">
          Select Images to Upload
        </label>
        <input
          type="file"
          accept="image/*"
          multiple
          onChange={handleFileUpload}
          disabled={isUploading}
          className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-primary file:text-white hover:file:bg-primary/90 disabled:opacity-50"
        />
        
        {isUploading && (
          <div className="mt-2 flex items-center text-primary">
            <Loader2 className="h-4 w-4 animate-spin mr-2" />
            <span className="text-sm">Uploading...</span>
          </div>
        )}
      </div>

      {/* Uploaded Images */}
      {uploadedUrls.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold mb-3">Uploaded Images ({uploadedUrls.length})</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {uploadedUrls.map((url, index) => (
              <div key={index} className="relative aspect-square rounded-lg overflow-hidden bg-gray-100 group">
                <Image
                  src={url}
                  alt={`Uploaded image ${index + 1}`}
                  width={300}
                  height={300}
                  className="w-full h-full object-cover"
                />
                <button
                  onClick={() => handleDelete(url)}
                  className="absolute top-1 right-1 bg-white rounded-full p-1 shadow hover:bg-gray-100 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X className="h-4 w-4 text-gray-600" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Instructions */}
      <div className="mt-6 p-4 bg-gray-50 rounded-md">
        <h4 className="font-medium text-gray-800 mb-2">Test Instructions:</h4>
        <ul className="text-sm text-gray-600 space-y-1">
          <li>• Select one or more image files (JPEG, PNG, WebP)</li>
          <li>• Maximum file size: 10MB per file</li>
          <li>• Images will be uploaded to Firebase Storage</li>
          <li>• Click the X button to delete uploaded images</li>
        </ul>
      </div>
    </div>
  );
}
