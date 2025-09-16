import React, { useState } from 'react';
import { Vehicle, FileReference } from '@/types';
import { FileText, Upload, Download, X, ExternalLink, Loader2, AlertCircle } from 'lucide-react';
import { storageService } from '@/lib/storage';
import { vehicleService } from '@/lib/firestore';

interface VehicleDocumentVaultProps {
  documents: Vehicle['documents'];
  vehicleId: string;
  onDocumentsUpdate?: (documents: Vehicle['documents']) => void;
}

interface DocumentItem {
  type: 'billOfLading' | 'customsDeclaration' | 'title' | 'purchaseInvoice' | 'repairReceipts';
  label: string;
  value: FileReference | FileReference[] | undefined;
  icon: React.ReactNode;
}

export default function VehicleDocumentVault({ documents, vehicleId, onDocumentsUpdate }: VehicleDocumentVaultProps) {
  const [isUploading, setIsUploading] = useState<{ [key: string]: boolean }>({});
  const [error, setError] = useState<string | null>(null);
  const [localDocuments, setLocalDocuments] = useState<Vehicle['documents']>(documents);

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

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>, docType: string) => {
    if (!e.target.files?.length) return;
    
    const files = Array.from(e.target.files);
    setIsUploading(prev => ({ ...prev, [docType]: true }));
    setError(null);
    
    try {
      // Upload files to Google Drive
      const uploadedFiles = await storageService.uploadMultipleFiles(files, vehicleId, 'documents');
      
      // Update local documents state
      const updatedDocuments = { ...localDocuments };
      
      if (docType === 'repairReceipts') {
        // Handle array of repair receipts
        updatedDocuments.repairReceipts = [...(updatedDocuments.repairReceipts || []), ...uploadedFiles];
      } else {
        // Handle single document (take the first uploaded file)
        (updatedDocuments as any)[docType] = uploadedFiles[0];
      }
      
      setLocalDocuments(updatedDocuments);
      
      // Update in Firestore
      await vehicleService.updateVehicleDocuments(vehicleId, updatedDocuments);
      
      // Notify parent component
      if (onDocumentsUpdate) {
        onDocumentsUpdate(updatedDocuments);
      }
      
    } catch (err) {
      console.error('Upload error:', err);
      setError(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setIsUploading(prev => ({ ...prev, [docType]: false }));
      // Clear the input
      e.target.value = '';
    }
  };

  const removeDocument = async (docType: string, index?: number) => {
    try {
      const updatedDocuments = { ...localDocuments };
      
      if (docType === 'repairReceipts' && index !== undefined) {
        // Remove specific repair receipt
        const fileToRemove = updatedDocuments.repairReceipts[index];
        // Check if it's a Cloudinary file reference
        if ('publicId' in fileToRemove) {
          await storageService.deleteFile(fileToRemove.publicId, fileToRemove.resourceType);
        } else {
          // Legacy Google Drive file reference
          await storageService.deleteFile(fileToRemove.id);
        }
        updatedDocuments.repairReceipts = updatedDocuments.repairReceipts.filter((_, i) => i !== index);
      } else {
        // Remove single document
        const fileToRemove = (updatedDocuments as any)[docType] as FileReference;
        if (fileToRemove) {
          // Check if it's a Cloudinary file reference
          if ('publicId' in fileToRemove) {
            await storageService.deleteFile(fileToRemove.publicId, fileToRemove.resourceType);
          } else {
            // Legacy Google Drive file reference
            await storageService.deleteFile(fileToRemove.id);
          }
          (updatedDocuments as any)[docType] = undefined;
        }
      }
      
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
  
  const documentTypes: DocumentItem[] = [
    {
      type: 'billOfLading',
      label: 'Bill of Lading',
      value: localDocuments.billOfLading,
      icon: <FileText className="text-blue-500" />
    },
    {
      type: 'customsDeclaration',
      label: 'Customs Declaration',
      value: localDocuments.customsDeclaration,
      icon: <FileText className="text-green-500" />
    },
    {
      type: 'title',
      label: 'Title/Ownership Docs',
      value: localDocuments.title,
      icon: <FileText className="text-purple-500" />
    },
    {
      type: 'purchaseInvoice',
      label: 'Purchase Invoice',
      value: localDocuments.purchaseInvoice,
      icon: <FileText className="text-red-500" />
    },
    {
      type: 'repairReceipts',
      label: 'Repair Receipts',
      value: localDocuments.repairReceipts,
      icon: <FileText className="text-orange-500" />
    }
  ];
  
  return (
    <div className="bg-white rounded-lg shadow p-6 vehicle-document-vault">
      <h2 className="text-xl font-semibold text-gray-800 mb-4">Document Vault</h2>
      
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
      
      <ul className="space-y-4">
        {documentTypes.map((doc) => (
          <li key={doc.type} className="border rounded-lg overflow-hidden">
            <div className="flex items-center justify-between p-3 bg-gray-50">
              <div className="flex items-center">
                {doc.icon}
                <span className="ml-2 font-medium">{doc.label}</span>
              </div>
              
              <label className={`cursor-pointer text-primary hover:text-primary-dark ${isUploading[doc.type] ? 'opacity-50 pointer-events-none' : ''}`}>
                {isUploading[doc.type] ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Upload className="h-4 w-4" />
                )}
                <input 
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={(e) => handleFileSelect(e, doc.type)}
                  className="hidden"
                  multiple={doc.type === 'repairReceipts'}
                  disabled={isUploading[doc.type]}
                />
              </label>
            </div>
            
            <div className="p-3">
              {!doc.value || (Array.isArray(doc.value) && doc.value.length === 0) ? (
                <div className="text-sm text-gray-500 text-center py-2">
                  No document uploaded
                </div>
              ) : Array.isArray(doc.value) ? (
                // Handle array of documents (repair receipts)
                <ul className="space-y-2">
                  {doc.value.map((item, idx) => (
                    <li key={item.id} className="flex items-center justify-between text-sm">
                      <span className="truncate flex-1">{item.name}</span>
                      <div className="flex items-center space-x-2">
                        <a
                          href={getViewUrl(item)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-gray-500 hover:text-primary"
                          title="View file"
                        >
                          <ExternalLink className="h-4 w-4" />
                        </a>
                        <a
                          href={getDownloadUrl(item)}
                          download={item.name}
                          className="text-gray-500 hover:text-primary"
                          title="Download"
                        >
                          <Download className="h-4 w-4" />
                        </a>
                        <button 
                          onClick={() => removeDocument(doc.type, idx)}
                          className="text-gray-500 hover:text-red-500"
                          title="Delete"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                // Handle single document
                <div className="flex items-center justify-between text-sm">
                  <span className="truncate flex-1">
                    {doc.value.name}
                  </span>
                  <div className="flex items-center space-x-2">
                    <a
                      href={getViewUrl(doc.value)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-gray-500 hover:text-primary"
                      title="View file"
                    >
                      <ExternalLink className="h-4 w-4" />
                    </a>
                    <a
                      href={getDownloadUrl(doc.value)}
                      download={doc.value.name}
                      className="text-gray-500 hover:text-primary"
                      title="Download"
                    >
                      <Download className="h-4 w-4" />
                    </a>
                    <button 
                      onClick={() => removeDocument(doc.type)}
                      className="text-gray-500 hover:text-red-500"
                      title="Delete"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
