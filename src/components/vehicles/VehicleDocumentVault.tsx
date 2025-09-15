import React from 'react';
import { Vehicle } from '@/types';
import { FileText, Upload, Download, X } from 'lucide-react';

interface VehicleDocumentVaultProps {
  documents: Vehicle['documents'];
  vehicleId: string;
}

interface DocumentItem {
  type: 'billOfLading' | 'customsDeclaration' | 'title' | 'purchaseInvoice' | 'repairReceipts';
  label: string;
  value: string | string[] | undefined;
  icon: React.ReactNode;
}

export default function VehicleDocumentVault({ documents, vehicleId }: VehicleDocumentVaultProps) {
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>, docType: string) => {
    if (!e.target.files?.length) return;
    
    // In a real application, we would handle file uploads here
    const files = Array.from(e.target.files);
    console.log('Files selected for', docType, files);
    // uploadDocument(files, vehicleId, docType);
  };
  
  const documentTypes: DocumentItem[] = [
    {
      type: 'billOfLading',
      label: 'Bill of Lading',
      value: documents.billOfLading,
      icon: <FileText className="text-blue-500" />
    },
    {
      type: 'customsDeclaration',
      label: 'Customs Declaration',
      value: documents.customsDeclaration,
      icon: <FileText className="text-green-500" />
    },
    {
      type: 'title',
      label: 'Title/Ownership Docs',
      value: documents.title,
      icon: <FileText className="text-purple-500" />
    },
    {
      type: 'purchaseInvoice',
      label: 'Purchase Invoice',
      value: documents.purchaseInvoice,
      icon: <FileText className="text-red-500" />
    },
    {
      type: 'repairReceipts',
      label: 'Repair Receipts',
      value: documents.repairReceipts,
      icon: <FileText className="text-orange-500" />
    }
  ];
  
  return (
    <div className="bg-white rounded-lg shadow p-6 vehicle-document-vault">
      <h2 className="text-xl font-semibold text-gray-800 mb-4">Document Vault</h2>
      
      <ul className="space-y-4">
        {documentTypes.map((doc) => (
          <li key={doc.type} className="border rounded-lg overflow-hidden">
            <div className="flex items-center justify-between p-3 bg-gray-50">
              <div className="flex items-center">
                {doc.icon}
                <span className="ml-2 font-medium">{doc.label}</span>
              </div>
              
              <label className="cursor-pointer text-primary hover:text-primary-dark">
                <Upload className="h-4 w-4" />
                <input 
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={(e) => handleFileSelect(e, doc.type)}
                  className="hidden"
                  multiple={doc.type === 'repairReceipts'}
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
                    <li key={idx} className="flex items-center justify-between text-sm">
                      <span className="truncate flex-1">Receipt_{idx + 1}.pdf</span>
                      <div className="flex items-center space-x-2">
                        <button className="text-gray-500 hover:text-primary">
                          <Download className="h-4 w-4" />
                        </button>
                        <button className="text-gray-500 hover:text-red-500">
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
                    {doc.label.replace(/\s+/g, '')}.pdf
                  </span>
                  <div className="flex items-center space-x-2">
                    <button className="text-gray-500 hover:text-primary">
                      <Download className="h-4 w-4" />
                    </button>
                    <button className="text-gray-500 hover:text-red-500">
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
