'use client';

import { useState } from 'react';
import { X, AlertTriangle, Trash2 } from 'lucide-react';

interface DeleteConfirmationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  itemName: string;
  isDeleting?: boolean;
}

export default function DeleteConfirmationDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  itemName,
  isDeleting = false
}: DeleteConfirmationDialogProps) {
  if (!isOpen) return null;

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div 
      className="delete-dialog-overlay"
      onClick={handleBackdropClick}
    >
      <div className="delete-dialog">
        <div className="delete-dialog-header">
          <div className="delete-dialog-icon">
            <AlertTriangle className="icon" />
          </div>
          <h3 className="delete-dialog-title">{title}</h3>
          <button 
            className="delete-dialog-close"
            onClick={onClose}
            disabled={isDeleting}
          >
            <X className="icon" />
          </button>
        </div>
        
        <div className="delete-dialog-content">
          <p className="delete-dialog-message">{message}</p>
          <div className="delete-dialog-item">
            <strong>{itemName}</strong>
          </div>
        </div>
        
        <div className="delete-dialog-actions">
          <button
            className="delete-dialog-cancel"
            onClick={onClose}
            disabled={isDeleting}
          >
            Cancel
          </button>
          <button
            className="delete-dialog-confirm"
            onClick={onConfirm}
            disabled={isDeleting}
          >
            {isDeleting ? (
              <>
                <div className="loading-spinner" />
                Deleting...
              </>
            ) : (
              <>
                <Trash2 className="icon" />
                Delete Vehicle
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
