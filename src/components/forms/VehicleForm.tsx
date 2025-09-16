'use client';

import { useState, useEffect } from 'react';
import { VehicleFormData, Currency } from '@/types';
import { 
  VEHICLE_MAKES, 
  SOURCE_CHANNELS, 
  CURRENCY_OPTIONS, 
  VALIDATION_RULES 
} from '@/constants';
import { isValidVIN, generateId } from '@/lib/utils';

interface VehicleFormProps {
  onSubmit: (data: VehicleFormData) => void;
  isSubmitting?: boolean;
  submitButtonText?: string;
  submitButtonIcon?: React.ReactNode;
  initialData?: Partial<VehicleFormData>;
}

interface FormErrors {
  vin?: string;
  make?: string;
  model?: string;
  year?: string;
  color?: string;
  mileage?: string;
  sourceChannel?: string;
  purchaseDate?: string;
  purchasePrice?: string;
  currency?: string;
  auctionLot?: string;
  listingUrl?: string;
}

export default function VehicleForm({
  onSubmit,
  isSubmitting = false,
  submitButtonText = 'Save Vehicle',
  submitButtonIcon,
  initialData
}: VehicleFormProps) {
  const [formData, setFormData] = useState<VehicleFormData>(() => ({
    vin: '',
    make: '',
    model: '',
    year: new Date().getFullYear(),
    color: '',
    mileage: 0,
    acquisitionDetails: {
      sourceChannel: '',
      purchaseDate: new Date().toISOString().split('T')[0],
      purchasePrice: 0,
      currency: 'NGN',
      auctionLot: '',
      listingUrl: ''
    },
    ...initialData
  }));

  const [errors, setErrors] = useState<FormErrors>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  // Update form data when initialData changes (for editing)
  useEffect(() => {
    if (initialData) {
      setFormData(prev => ({
        ...prev,
        ...initialData
      }));
    }
  }, [initialData]);

  // Validation functions
  const validateField = (name: string, value: any): string => {
    switch (name) {
      case 'vin':
        if (!value) return 'VIN is required';
        if (!isValidVIN(value)) return 'VIN must be 17 characters and valid format';
        return '';
      
      case 'make':
        if (!value) return 'Make is required';
        return '';
      
      case 'model':
        if (!value) return 'Model is required';
        return '';
      
      case 'year':
        if (!value) return 'Year is required';
        const year = parseInt(value);
        if (isNaN(year) || year < VALIDATION_RULES.MIN_YEAR || year > VALIDATION_RULES.MAX_YEAR) {
          return `Year must be between ${VALIDATION_RULES.MIN_YEAR} and ${VALIDATION_RULES.MAX_YEAR}`;
        }
        return '';
      
      case 'color':
        if (!value) return 'Color is required';
        return '';
      
      
      case 'mileage':
        if (value === '' || value === null) return 'Mileage is required';
        const mileage = parseInt(value);
        if (isNaN(mileage) || mileage < VALIDATION_RULES.MIN_MILEAGE || mileage > VALIDATION_RULES.MAX_MILEAGE) {
          return `Mileage must be between ${VALIDATION_RULES.MIN_MILEAGE} and ${VALIDATION_RULES.MAX_MILEAGE}`;
        }
        return '';
      
      case 'sourceChannel':
        if (!value) return 'Source channel is required';
        return '';
      
      case 'purchaseDate':
        if (!value) return 'Purchase date is required';
        const date = new Date(value);
        if (isNaN(date.getTime())) return 'Invalid date';
        if (date > new Date()) return 'Purchase date cannot be in the future';
        return '';
      
      case 'purchasePrice':
        if (!value) return 'Purchase price is required';
        const price = parseFloat(value);
        if (isNaN(price) || price < VALIDATION_RULES.MIN_PRICE || price > VALIDATION_RULES.MAX_PRICE) {
          return `Price must be between ${VALIDATION_RULES.MIN_PRICE} and ${VALIDATION_RULES.MAX_PRICE}`;
        }
        return '';
      
      case 'listingUrl':
        if (value && !isValidUrl(value)) return 'Please enter a valid URL';
        return '';
      
      default:
        return '';
    }
  };

  const isValidUrl = (url: string): boolean => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  const handleInputChange = (name: string, value: any) => {
    setFormData(prev => {
      if (name.startsWith('acquisitionDetails.')) {
        const field = name.split('.')[1];
        return {
          ...prev,
          acquisitionDetails: {
            ...prev.acquisitionDetails,
            [field]: value
          }
        };
      }
      return {
        ...prev,
        [name]: value
      };
    });

    // Clear error when user starts typing
    if (errors[name as keyof FormErrors]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  const handleBlur = (name: string) => {
    setTouched(prev => ({ ...prev, [name]: true }));
    
    const value = name.startsWith('acquisitionDetails.') 
      ? formData.acquisitionDetails[name.split('.')[1] as keyof typeof formData.acquisitionDetails]
      : formData[name as keyof VehicleFormData];
    
    const error = validateField(name, value);
    setErrors(prev => ({ ...prev, [name]: error }));
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};
    
    // Validate basic fields
    const basicFields = ['vin', 'make', 'model', 'year', 'color', 'mileage'];
    basicFields.forEach(field => {
      const value = formData[field as keyof VehicleFormData];
      const error = validateField(field, value);
      if (error) newErrors[field as keyof FormErrors] = error;
    });
    
    // Validate acquisition details
    const acquisitionFields = ['sourceChannel', 'purchaseDate', 'purchasePrice', 'currency'];
    acquisitionFields.forEach(field => {
      const value = formData.acquisitionDetails[field as keyof typeof formData.acquisitionDetails];
      const error = validateField(field, value);
      if (error) newErrors[field as keyof FormErrors] = error;
    });
    
    // Validate optional fields
    if (formData.acquisitionDetails.listingUrl) {
      const error = validateField('listingUrl', formData.acquisitionDetails.listingUrl);
      if (error) newErrors.listingUrl = error;
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Mark all fields as touched to show validation errors
    const allFields = [
      'vin', 'make', 'model', 'year', 'color', 'mileage',
      'sourceChannel', 'purchaseDate', 'purchasePrice', 'currency'
    ];
    
    const touchedFields = allFields.reduce((acc, field) => {
      acc[field] = true;
      return acc;
    }, {} as Record<string, boolean>);
    
    setTouched(touchedFields);
    
    if (validateForm()) {
      onSubmit(formData);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="vehicle-form">
      {/* Vehicle Identification Section */}
      <div className="form-section">
        <h2>Vehicle Identification</h2>
        
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="vin">VIN *</label>
            <input
              type="text"
              id="vin"
              value={formData.vin}
              onChange={(e) => handleInputChange('vin', e.target.value.toUpperCase())}
              onBlur={() => handleBlur('vin')}
              className={errors.vin && touched.vin ? 'error' : ''}
              placeholder="Enter 17-character VIN"
              maxLength={17}
            />
            {errors.vin && touched.vin && (
              <span className="error-message">{errors.vin}</span>
            )}
          </div>
          
          <div className="form-group">
            <label htmlFor="make">Make *</label>
            <select
              id="make"
              value={formData.make}
              onChange={(e) => handleInputChange('make', e.target.value)}
              onBlur={() => handleBlur('make')}
              className={errors.make && touched.make ? 'error' : ''}
            >
              <option value="">Select Make</option>
              {VEHICLE_MAKES.map(make => (
                <option key={make} value={make}>{make}</option>
              ))}
            </select>
            {errors.make && touched.make && (
              <span className="error-message">{errors.make}</span>
            )}
          </div>
        </div>
        
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="model">Model *</label>
            <input
              type="text"
              id="model"
              value={formData.model}
              onChange={(e) => handleInputChange('model', e.target.value)}
              onBlur={() => handleBlur('model')}
              className={errors.model && touched.model ? 'error' : ''}
              placeholder="Enter model"
            />
            {errors.model && touched.model && (
              <span className="error-message">{errors.model}</span>
            )}
          </div>
          
          <div className="form-group">
            <label htmlFor="year">Year *</label>
            <input
              type="number"
              id="year"
              value={formData.year}
              onChange={(e) => handleInputChange('year', parseInt(e.target.value))}
              onBlur={() => handleBlur('year')}
              className={errors.year && touched.year ? 'error' : ''}
              min={VALIDATION_RULES.MIN_YEAR}
              max={VALIDATION_RULES.MAX_YEAR}
            />
            {errors.year && touched.year && (
              <span className="error-message">{errors.year}</span>
            )}
          </div>
        </div>
        
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="color">Color *</label>
            <input
              type="text"
              id="color"
              value={formData.color}
              onChange={(e) => handleInputChange('color', e.target.value)}
              onBlur={() => handleBlur('color')}
              className={errors.color && touched.color ? 'error' : ''}
              placeholder="Enter color"
            />
            {errors.color && touched.color && (
              <span className="error-message">{errors.color}</span>
            )}
          </div>
          
        </div>
        
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="mileage">Mileage *</label>
            <input
              type="number"
              id="mileage"
              value={formData.mileage}
              onChange={(e) => handleInputChange('mileage', parseInt(e.target.value))}
              onBlur={() => handleBlur('mileage')}
              className={errors.mileage && touched.mileage ? 'error' : ''}
              min={VALIDATION_RULES.MIN_MILEAGE}
              max={VALIDATION_RULES.MAX_MILEAGE}
              placeholder="Enter mileage"
            />
            {errors.mileage && touched.mileage && (
              <span className="error-message">{errors.mileage}</span>
            )}
          </div>
        </div>
      </div>

      {/* Acquisition Details Section */}
      <div className="form-section">
        <h2>Acquisition Details</h2>
        
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="sourceChannel">Source Channel *</label>
            <select
              id="sourceChannel"
              value={formData.acquisitionDetails.sourceChannel}
              onChange={(e) => handleInputChange('acquisitionDetails.sourceChannel', e.target.value)}
              onBlur={() => handleBlur('sourceChannel')}
              className={errors.sourceChannel && touched.sourceChannel ? 'error' : ''}
            >
              <option value="">Select Source Channel</option>
              {SOURCE_CHANNELS.map(channel => (
                <option key={channel} value={channel}>{channel}</option>
              ))}
            </select>
            {errors.sourceChannel && touched.sourceChannel && (
              <span className="error-message">{errors.sourceChannel}</span>
            )}
          </div>
          
          <div className="form-group">
            <label htmlFor="purchaseDate">Purchase Date *</label>
            <input
              type="date"
              id="purchaseDate"
              value={formData.acquisitionDetails.purchaseDate}
              onChange={(e) => handleInputChange('acquisitionDetails.purchaseDate', e.target.value)}
              onBlur={() => handleBlur('purchaseDate')}
              className={errors.purchaseDate && touched.purchaseDate ? 'error' : ''}
              max={new Date().toISOString().split('T')[0]}
            />
            {errors.purchaseDate && touched.purchaseDate && (
              <span className="error-message">{errors.purchaseDate}</span>
            )}
          </div>
        </div>
        
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="purchasePrice">Purchase Price *</label>
            <input
              type="number"
              id="purchasePrice"
              value={formData.acquisitionDetails.purchasePrice}
              onChange={(e) => handleInputChange('acquisitionDetails.purchasePrice', parseFloat(e.target.value))}
              onBlur={() => handleBlur('purchasePrice')}
              className={errors.purchasePrice && touched.purchasePrice ? 'error' : ''}
              min={VALIDATION_RULES.MIN_PRICE}
              max={VALIDATION_RULES.MAX_PRICE}
              step="0.01"
              placeholder="Enter purchase price"
            />
            {errors.purchasePrice && touched.purchasePrice && (
              <span className="error-message">{errors.purchasePrice}</span>
            )}
          </div>
          
          <div className="form-group">
            <label htmlFor="currency">Currency *</label>
            <select
              id="currency"
              value={formData.acquisitionDetails.currency}
              onChange={(e) => handleInputChange('acquisitionDetails.currency', e.target.value as Currency)}
              onBlur={() => handleBlur('currency')}
              className={errors.currency && touched.currency ? 'error' : ''}
            >
              {CURRENCY_OPTIONS.map(currency => (
                <option key={currency.value} value={currency.value}>
                  {currency.label}
                </option>
              ))}
            </select>
            {errors.currency && touched.currency && (
              <span className="error-message">{errors.currency}</span>
            )}
          </div>
        </div>
        
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="auctionLot">Auction Lot #</label>
            <input
              type="text"
              id="auctionLot"
              value={formData.acquisitionDetails.auctionLot || ''}
              onChange={(e) => handleInputChange('acquisitionDetails.auctionLot', e.target.value)}
              placeholder="Enter auction lot number (optional)"
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="listingUrl">Original Listing URL</label>
            <input
              type="url"
              id="listingUrl"
              value={formData.acquisitionDetails.listingUrl || ''}
              onChange={(e) => handleInputChange('acquisitionDetails.listingUrl', e.target.value)}
              onBlur={() => handleBlur('listingUrl')}
              className={errors.listingUrl && touched.listingUrl ? 'error' : ''}
              placeholder="Enter original listing URL (optional)"
            />
            {errors.listingUrl && touched.listingUrl && (
              <span className="error-message">{errors.listingUrl}</span>
            )}
          </div>
        </div>
      </div>

      {/* Form Actions */}
      <div className="form-actions">
        <button
          type="submit"
          className="submit-button"
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <>
              <div className="loading-spinner" />
              Saving...
            </>
          ) : (
            <>
              {submitButtonIcon}
              {submitButtonText}
            </>
          )}
        </button>
      </div>
    </form>
  );
}
