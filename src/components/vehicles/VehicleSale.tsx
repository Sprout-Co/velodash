import React, { useState } from 'react';
import { Vehicle } from '@/types';
import { formatCurrency, formatDate } from '@/lib/utils';
import { Edit2, Save, X, DollarSign, Calendar, FileText } from 'lucide-react';

interface VehicleSaleProps {
  saleDetails: Vehicle['saleDetails'];
  vehicleId: string;
  onSaleUpdate: (saleDetails: Vehicle['saleDetails']) => void;
}

export default function VehicleSale({ saleDetails, vehicleId, onSaleUpdate }: VehicleSaleProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({
    listingPrice: saleDetails?.listingPrice || undefined,
    finalSalePrice: saleDetails?.finalSalePrice || undefined,
    saleDate: saleDetails?.saleDate ? formatDate(saleDetails.saleDate) : '',
    notes: saleDetails?.notes || '',
  });
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleEdit = () => {
    setIsEditing(true);
    setError(null);
    setSuccess(null);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setFormData({
      listingPrice: saleDetails?.listingPrice || undefined,
      finalSalePrice: saleDetails?.finalSalePrice || undefined,
      saleDate: saleDetails?.saleDate ? formatDate(saleDetails.saleDate) : '',
      notes: saleDetails?.notes || '',
    });
    setError(null);
    setSuccess(null);
  };

  const handleSave = async () => {
    setIsSaving(true);
    setError(null);

    try {
      const updatedSaleDetails = {
        listingPrice: formData.listingPrice || undefined,
        finalSalePrice: formData.finalSalePrice || undefined,
        saleDate: formData.saleDate ? new Date(formData.saleDate) : new Date(),
        notes: formData.notes,
      };

      // Call the update function
      await onSaleUpdate(updatedSaleDetails);
      
      setSuccess('Sale details updated successfully');
      setIsEditing(false);
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError('Failed to update sale details. Please try again.');
      console.error('Error updating sale details:', err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleInputChange = (field: string, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const profit = saleDetails && saleDetails.listingPrice && saleDetails.finalSalePrice 
    ? saleDetails.finalSalePrice - saleDetails.listingPrice 
    : 0;
  const profitMargin = saleDetails && saleDetails.listingPrice && saleDetails.finalSalePrice && saleDetails.listingPrice > 0 
    ? ((saleDetails.finalSalePrice - saleDetails.listingPrice) / saleDetails.listingPrice) * 100 
    : 0;

  return (
    <div className="vehicle-sale">
      <div className="vehicle-sale__header">
        <h3 className="vehicle-sale__title">Sale Details</h3>
        {!isEditing && (
          <button
            className="vehicle-sale__edit-btn"
            onClick={handleEdit}
          >
            <Edit2 className="h-4 w-4" />
            Edit
          </button>
        )}
      </div>

      {error && (
        <div className="vehicle-sale__error">
          {error}
        </div>
      )}

      {success && (
        <div className="vehicle-sale__success">
          {success}
        </div>
      )}

      {isEditing ? (
        <div className="vehicle-sale__form">
          <div className="vehicle-sale__form-grid">
            <div className="vehicle-sale__form-field">
              <label className="vehicle-sale__form-label">
                <DollarSign className="h-4 w-4" />
                Listing Price (NGN)
              </label>
              <input
                type="number"
                value={formData.listingPrice}
                onChange={(e) => handleInputChange('listingPrice', e.target.value ? (isNaN(parseFloat(e.target.value)) ? undefined : parseFloat(e.target.value)) : undefined)}
                className="vehicle-sale__form-input"
                placeholder="Enter listing price"
                min="0"
                step="1000"
              />
            </div>

            <div className="vehicle-sale__form-field">
              <label className="vehicle-sale__form-label">
                <DollarSign className="h-4 w-4" />
                Final Sale Price (NGN)
              </label>
              <input
                type="number"
                value={formData.finalSalePrice}
                onChange={(e) => handleInputChange('finalSalePrice', e.target.value ? (isNaN(parseFloat(e.target.value)) ? undefined : parseFloat(e.target.value)) : undefined)}
                className="vehicle-sale__form-input"
                placeholder="Enter final sale price"
                min="0"
                step="1000"
              />
            </div>

            <div className="vehicle-sale__form-field">
              <label className="vehicle-sale__form-label">
                <Calendar className="h-4 w-4" />
                Sale Date
              </label>
              <input
                type="date"
                value={formData.saleDate}
                onChange={(e) => handleInputChange('saleDate', e.target.value)}
                className="vehicle-sale__form-input"
              />
            </div>

            <div className="vehicle-sale__form-field vehicle-sale__form-field--full">
              <label className="vehicle-sale__form-label">
                <FileText className="h-4 w-4" />
                Notes
              </label>
              <textarea
                value={formData.notes}
                onChange={(e) => handleInputChange('notes', e.target.value)}
                className="vehicle-sale__form-textarea"
                placeholder="Enter sale notes..."
                rows={3}
              />
            </div>
          </div>

          <div className="vehicle-sale__form-actions">
            <button
              className="vehicle-sale__btn vehicle-sale__btn--cancel"
              onClick={handleCancel}
              disabled={isSaving}
            >
              <X className="h-4 w-4" />
              Cancel
            </button>
            <button
              className="vehicle-sale__btn vehicle-sale__btn--save"
              onClick={handleSave}
              disabled={isSaving}
            >
              <Save className="h-4 w-4" />
              {isSaving ? 'Saving...' : 'Save'}
            </button>
          </div>
        </div>
      ) : (
        <div className="vehicle-sale__content">
          {saleDetails ? (
            <div className="vehicle-sale__details">
              <div className="vehicle-sale__detail-grid">
                <div className="vehicle-sale__detail-item">
                  <label className="vehicle-sale__detail-label">Listing Price</label>
                  <p className="vehicle-sale__detail-value">
                    {saleDetails.listingPrice ? formatCurrency(saleDetails.listingPrice, 'NGN') : 'Not set'}
                  </p>
                </div>

                <div className="vehicle-sale__detail-item">
                  <label className="vehicle-sale__detail-label">Final Sale Price</label>
                  <p className="vehicle-sale__detail-value vehicle-sale__detail-value--sale">
                    {saleDetails.finalSalePrice ? formatCurrency(saleDetails.finalSalePrice, 'NGN') : 'Not set'}
                  </p>
                </div>

                <div className="vehicle-sale__detail-item">
                  <label className="vehicle-sale__detail-label">Sale Date</label>
                  <p className="vehicle-sale__detail-value">
                    {formatDate(saleDetails.saleDate)}
                  </p>
                </div>

                <div className="vehicle-sale__detail-item">
                  <label className="vehicle-sale__detail-label">Profit</label>
                  <p className={`vehicle-sale__detail-value ${
                    profit >= 0 ? 'vehicle-sale__detail-value--profit' : 'vehicle-sale__detail-value--loss'
                  }`}>
                    {saleDetails.listingPrice && saleDetails.finalSalePrice ? formatCurrency(profit, 'NGN') : 'N/A'}
                  </p>
                </div>

                <div className="vehicle-sale__detail-item">
                  <label className="vehicle-sale__detail-label">Profit Margin</label>
                  <p className={`vehicle-sale__detail-value ${
                    profitMargin >= 0 ? 'vehicle-sale__detail-value--profit' : 'vehicle-sale__detail-value--loss'
                  }`}>
                    {saleDetails.listingPrice && saleDetails.finalSalePrice ? `${profitMargin.toFixed(1)}%` : 'N/A'}
                  </p>
                </div>

                {saleDetails.notes && (
                  <div className="vehicle-sale__detail-item vehicle-sale__detail-item--full">
                    <label className="vehicle-sale__detail-label">Notes</label>
                    <p className="vehicle-sale__detail-value vehicle-sale__detail-value--notes">
                      {saleDetails.notes}
                    </p>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="vehicle-sale__empty">
              <p className="vehicle-sale__empty-text">No sale details recorded</p>
              <p className="vehicle-sale__empty-subtext">Click Edit to add sale information</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
