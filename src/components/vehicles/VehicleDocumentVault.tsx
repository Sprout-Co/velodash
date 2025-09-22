import React, { useState, useRef } from 'react';
import { Vehicle, FileReference, DocumentItem } from '@/types';
import { FileText, Upload, Download, X, ExternalLink, Loader2, AlertCircle, Plus } from 'lucide-react';
import { storageService } from '@/lib/storage';
import { vehicleService } from '@/lib/firestore';

interface VehicleDocumentVaultProps {
  documents: Vehicle['documents'];
  vehicleId: string;
  onDocumentsUpdate?: (documents: Vehicle['documents']) => void;
}

export default function VehicleDocumentVault({ documents, vehicleId, onDocumentsUpdate }: VehicleDocumentVaultProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [localDocuments, setLocalDocuments] = useState<Vehicle['documents']>(documents || { items: [] });
  
  // For new document upload
  const [showUploadForm, setShowUploadForm] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Helper functions to get URLs for both Google Drive and Cloudinary files
  const getViewUrl = (file: FileReference): string => {
    if ('url' in file) {
      // Cloudinary file reference
      return file.url;
    } else {
      // Google Drive file reference
      return file.webViewLink;
    }
  };

  const getDownloadUrl = (file: FileReference): string => {
    if ('downloadUrl' in file) {
      // Cloudinary file reference
      return file.downloadUrl;
    } else {
      // Google Drive file reference
      return file.webContentLink;
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.length) return;
    setSelectedFile(e.target.files[0]);
  };

  const handleUploadDocument = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedFile || !title) {
      setError('Please provide a title and select a file');
      return;
    }
    
    setIsUploading(true);
    setError(null);
    
    try {
      // Upload file to storage
      const uploadedFiles = await storageService.uploadMultipleFiles([selectedFile], vehicleId, 'documents');
      const uploadedFile = uploadedFiles[0];
      
      // Create new document item
      const newDocument: DocumentItem = {
        id: `doc_${Date.now()}`,
        file: uploadedFile,
        title: title,
        description: description,
        createdAt: new Date()
      };
      
      // Update local documents state
      const updatedDocuments = {
        items: [...(localDocuments.items || []), newDocument]
      };
      
      setLocalDocuments(updatedDocuments);
      
      // Update in Firestore
      await vehicleService.updateVehicleDocuments(vehicleId, updatedDocuments);
      
      // Notify parent component
      if (onDocumentsUpdate) {
        onDocumentsUpdate(updatedDocuments);
      }
      
      // Reset form
      setTitle('');
      setDescription('');
      setSelectedFile(null);
      setShowUploadForm(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
      
    } catch (err) {
      console.error('Upload error:', err);
      setError(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setIsUploading(false);
    }
  };

  const removeDocument = async (documentId: string) => {
    try {
      // Find document to remove
      const docToRemove = localDocuments.items.find(item => item.id === documentId);
      if (!docToRemove) return;
      
      // Delete file from storage
      if ('publicId' in docToRemove.file) {
        await storageService.deleteFile(docToRemove.file.publicId, docToRemove.file.resourceType);
      } else {
        await storageService.deleteFile(docToRemove.file.id);
      }
      
      // Update local state
      const updatedDocuments = {
        items: localDocuments.items.filter(item => item.id !== documentId)
      };
      
      setLocalDocuments(updatedDocuments);
      
      // Update in Firestore
      await vehicleService.updateVehicleDocuments(vehicleId, updatedDocuments);
      
      // Notify parent component
      if (onDocumentsUpdate) {
        onDocumentsUpdate(updatedDocuments);
      }
      
    } catch (err) {
      console.error('Delete error:', err);
      setError(err instanceof Error ? err.message : 'Failed to delete document');
    }
  };
  
  return (
    <div className="bg-white rounded-lg shadow p-6 vehicle-document-vault">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-gray-800">Document Vault</h2>
        <button
          onClick={() => setShowUploadForm(!showUploadForm)}
          className={`flex items-center text-sm px-3 py-2 rounded-md transition-colors ${
            showUploadForm 
              ? 'bg-gray-200 text-gray-700 hover:bg-gray-300' 
              : 'bg-blue-600 text-white hover:bg-blue-700'
          }`}
        >
          <Plus className="h-4 w-4 mr-1" />
          {showUploadForm ? 'Cancel' : 'Add Document'}
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
      
      {/* Upload Form */}
      {showUploadForm && (
        <div className="mb-6 p-4 border rounded-lg bg-gray-50">
          <h3 className="font-medium text-gray-700 mb-3">Upload New Document</h3>
          <form onSubmit={handleUploadDocument}>
            <div className="mb-3">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full p-2 border rounded-md"
                placeholder="Enter document title"
                required
              />
            </div>
            
            <div className="mb-3">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description (optional)
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full p-2 border rounded-md"
                placeholder="Enter description"
                rows={2}
              />
            </div>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                File <span className="text-red-500">*</span>
              </label>
              <input
                ref={fileInputRef}
                type="file"
                onChange={handleFileSelect}
                className="block w-full text-sm text-gray-500
                  file:mr-4 file:py-2 file:px-4
                  file:rounded-md file:border-0
                  file:text-sm file:font-medium
                  file:bg-gray-100 file:text-gray-700
                  hover:file:bg-gray-200"
                accept=".pdf,.jpg,.jpeg,.png,.doc,.docx,.xls,.xlsx,.txt"
                required
              />
              <p className="mt-1 text-xs text-gray-500">
                Supported formats: PDF, images, Office documents, text files
              </p>
            </div>
            
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={isUploading}
                className={`flex items-center px-4 py-2 bg-primary text-white rounded-md ${
                  isUploading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-primary-dark'
                }`}
              >
                {isUploading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <Upload className="h-4 w-4 mr-2" />
                    Upload
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      )}
      
      {/* Documents List */}
      {localDocuments.items && localDocuments.items.length > 0 ? (
        <ul className="space-y-3">
          {localDocuments.items.map((doc) => (
            <li key={doc.id} className="border rounded-lg overflow-hidden">
              <div className="flex items-center justify-between p-3 bg-gray-50">
                <div className="flex items-center">
                  <FileText className="text-blue-500" />
                  <span className="ml-2 font-medium">{doc.title}</span>
                </div>
              </div>
              
              <div className="p-3">
                {doc.description && (
                  <p className="text-sm text-gray-600 mb-2">{doc.description}</p>
                )}
                
                <div className="flex items-center justify-between text-sm">
                  <span className="truncate flex-1">
                    {doc.file.name}
                  </span>
                  <div className="flex items-center space-x-2">
                    <a
                      href={getViewUrl(doc.file)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-gray-500 hover:text-primary"
                      title="View file"
                    >
                      <ExternalLink className="h-4 w-4" />
                    </a>
                    <a
                      href={getDownloadUrl(doc.file)}
                      download={doc.file.name}
                      className="text-gray-500 hover:text-primary"
                      title="Download"
                    >
                      <Download className="h-4 w-4" />
                    </a>
                    <button 
                      onClick={() => removeDocument(doc.id)}
                      className="text-gray-500 hover:text-red-500"
                      title="Delete"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <div className="text-center py-8 border rounded-lg bg-gray-50">
          <FileText className="h-10 w-10 text-gray-400 mx-auto mb-2" />
          <p className="text-gray-500">No documents uploaded yet</p>
          {!showUploadForm && (
            <button
              onClick={() => setShowUploadForm(true)}
              className="mt-3 text-primary hover:text-primary-dark"
            >
              Upload your first document
            </button>
          )}
        </div>
      )}
    </div>
  );
}
