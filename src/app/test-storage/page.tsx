// Test Firebase Storage
// Simple test page to verify storage is working

'use client';

import { useState } from 'react';
import Image from 'next/image';
import { storageService } from '@/lib/storage';

export default function TestStoragePage() {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setError(null);
    }
  };

  const handleUpload = async () => {
    if (!file) return;

    setUploading(true);
    setError(null);
    setResult(null);

    try {
      const downloadURL = await storageService.uploadFile(
        file,
        'test-vehicle-id',
        'photos'
      );
      
      setResult(downloadURL);
      console.log('Upload successful:', downloadURL);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Upload failed';
      setError(errorMessage);
      console.error('Upload error:', err);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">
            Firebase Storage Test
          </h1>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Image File
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
              />
            </div>

            {file && (
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600">
                  <strong>File:</strong> {file.name}
                </p>
                <p className="text-sm text-gray-600">
                  <strong>Size:</strong> {(file.size / 1024 / 1024).toFixed(2)} MB
                </p>
                <p className="text-sm text-gray-600">
                  <strong>Type:</strong> {file.type}
                </p>
              </div>
            )}

            <button
              onClick={handleUpload}
              disabled={!file || uploading}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {uploading ? 'Uploading...' : 'Upload to Firebase Storage'}
            </button>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <h3 className="text-sm font-medium text-red-800 mb-2">Error</h3>
                <p className="text-sm text-red-700">{error}</p>
              </div>
            )}

            {result && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <h3 className="text-sm font-medium text-green-800 mb-2">Success!</h3>
                <p className="text-sm text-green-700 mb-2">File uploaded successfully:</p>
                <a
                  href={result.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-800 underline break-all"
                >
                  {result.url}
                </a>
                <div className="mt-4">
                  <Image
                    src={result.url}
                    alt="Uploaded image"
                    width={400}
                    height={300}
                    className="max-w-full h-auto rounded-lg border"
                    style={{ maxHeight: '300px' }}
                  />
                </div>
              </div>
            )}
          </div>

          <div className="mt-8 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <h3 className="text-sm font-medium text-yellow-800 mb-2">
              Troubleshooting
            </h3>
            <ul className="text-sm text-yellow-700 space-y-1">
              <li>• Make sure Firebase Storage is enabled in your project</li>
              <li>• Check that storage rules allow public access</li>
              <li>• Verify your Firebase configuration in .env.local</li>
              <li>• Check browser console for detailed error messages</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
