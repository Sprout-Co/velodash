'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { CostEntry, CostCategory, Currency } from '@/types';
import { costService } from '@/lib/firestore';
import { formatCurrency } from '@/lib/utils';
import { Plus, Edit2, Trash2, DollarSign, Calendar, Tag, Eye, EyeOff, ChevronDown, ChevronRight } from 'lucide-react';

interface VehicleCostManagementProps {
  vehicleId: string;
  vehicleName: string;
  onCostsUpdate?: (costs: CostEntry[]) => void;
}

interface CostFormData {
  date: string;
  category: CostCategory;
  description: string;
  amount: number;
  currency: Currency;
}

const COST_CATEGORIES: { value: CostCategory; label: string }[] = [
  { value: 'purchase-price', label: 'Purchase Price' },
  { value: 'shipping', label: 'Shipping' },
  { value: 'customs-duty', label: 'Customs Duty' },
  { value: 'terminal-charges', label: 'Terminal Charges' },
  { value: 'transportation', label: 'Transportation' },
  { value: 'mechanical-parts', label: 'Mechanical Parts' },
  { value: 'body-parts', label: 'Body Parts' },
  { value: 'mechanical-labor', label: 'Mechanical Labor' },
  { value: 'bodywork-labor', label: 'Bodywork Labor' },
  { value: 'detailing', label: 'Detailing' },
  { value: 'marketing', label: 'Marketing' },
  { value: 'overhead-allocation', label: 'Overhead Allocation' },
  { value: 'others', label: 'Others' },
];

const CURRENCY_OPTIONS: { value: Currency; label: string }[] = [
  { value: 'NGN', label: 'Nigerian Naira (NGN)' },
];

// Helper function to safely format dates
const formatDateForInput = (date: any): string => {
  try {
    if (!date) return new Date().toISOString().split('T')[0];
    
    const dateObj = date instanceof Date ? date : new Date(date);
    if (!isNaN(dateObj.getTime())) {
      return dateObj.toISOString().split('T')[0];
    }
  } catch (error) {
    console.warn('Invalid date, using today:', error);
  }
  return new Date().toISOString().split('T')[0];
};

const formatDateForDisplay = (date: any): string => {
  try {
    if (!date) return 'No Date';
    
    let dateObj: Date;
    
    // Handle Firestore Timestamp objects with toDate method
    if (date && typeof date === 'object' && date.toDate && typeof date.toDate === 'function') {
      dateObj = date.toDate();
    } 
    // Handle Firestore Timestamp objects with seconds/nanoseconds properties
    else if (date && typeof date === 'object' && typeof date.seconds === 'number') {
      // Convert Firestore timestamp (seconds + nanoseconds) to JavaScript Date
      const milliseconds = date.seconds * 1000 + Math.floor(date.nanoseconds / 1000000);
      dateObj = new Date(milliseconds);
    }
    // Handle regular Date objects
    else if (date instanceof Date) {
      dateObj = date;
    } 
    // Handle string or number dates
    else if (typeof date === 'string' || typeof date === 'number') {
      dateObj = new Date(date);
    } else {
      // For debugging in development
      if (process.env.NODE_ENV === 'development') {
        console.warn('Unexpected date format:', date, typeof date);
      }
      return 'Invalid Date';
    }
    
    if (!isNaN(dateObj.getTime())) {
      return dateObj.toLocaleDateString();
    } else {
      if (process.env.NODE_ENV === 'development') {
        console.warn('Invalid date conversion result:', dateObj, 'from input:', date);
      }
    }
  } catch (error) {
    console.warn('Invalid date for display:', error, 'Input:', date);
  }
  return 'Invalid Date';
};

export default function VehicleCostManagement({ 
  vehicleId, 
  vehicleName, 
  onCostsUpdate 
}: VehicleCostManagementProps) {
  const [costs, setCosts] = useState<CostEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingCost, setEditingCost] = useState<CostEntry | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [expandedCosts, setExpandedCosts] = useState<Set<string>>(new Set());
  const [showDetails, setShowDetails] = useState(false);

  const [formData, setFormData] = useState<CostFormData>({
    date: new Date().toISOString().split('T')[0],
    category: 'purchase-price',
    description: '',
    amount: 0,
    currency: 'NGN',
  });

  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  
  // Use ref to store the callback to avoid dependency issues
  const onCostsUpdateRef = useRef(onCostsUpdate);
  onCostsUpdateRef.current = onCostsUpdate;

  const loadCosts = useCallback(async () => {
    try {
      console.log('Loading costs for vehicle:', vehicleId);
      setLoading(true);
      setError(null);
      const costEntries = await costService.getCostsByVehicle(vehicleId);
      console.log('Loaded costs:', costEntries);
      setCosts(costEntries);
      onCostsUpdateRef.current?.(costEntries);
    } catch (err) {
      setError('Failed to load costs');
      console.error('Error loading costs:', err);
    } finally {
      setLoading(false);
    }
  }, [vehicleId]);

  useEffect(() => {
    loadCosts();
  }, [loadCosts]);


  const handleAmountChange = (amount: number) => {
    setFormData(prev => ({ ...prev, amount: amount || 0 }));
  };

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!formData.description.trim()) {
      errors.description = 'Description is required';
    }

    if (formData.amount <= 0) {
      errors.amount = 'Amount must be greater than 0';
    }

    if (!formData.date) {
      errors.date = 'Date is required';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!validateForm()) return;

    try {
      setSubmitting(true);
      setError(null);

      console.log('Submitting cost update:', { editingCost: editingCost?.id, formData });

      if (editingCost) {
        // Update existing cost
        const updatedCost = await costService.updateCost(editingCost.id, formData);
        console.log('Cost updated successfully:', updatedCost);
      } else {
        // Create new cost
        const newCost = await costService.createCost(vehicleId, formData);
        console.log('Cost created successfully:', newCost);
      }

      // Reload costs
      await loadCosts();
      
      // Reset form
      setFormData({
        date: new Date().toISOString().split('T')[0],
        category: 'purchase-price',
        description: '',
        amount: 0,
        currency: 'NGN',
      });
      setEditingCost(null);
      setShowForm(false);
      setFormErrors({});

    } catch (err) {
      setError('Failed to save cost entry');
      console.error('Error saving cost:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (cost: CostEntry) => {
    setEditingCost(cost);
    setFormData({
      date: formatDateForInput(cost.date),
      category: cost.category,
      description: cost.description,
      amount: cost.amount,
      currency: cost.currency,
    });
    setShowForm(true);
  };

  const handleDelete = async (costId: string) => {
    if (!confirm('Are you sure you want to delete this cost entry?')) return;

    try {
      setDeleting(costId);
      await costService.deleteCost(costId);
      await loadCosts();
    } catch (err) {
      setError('Failed to delete cost entry');
      console.error('Error deleting cost:', err);
    } finally {
      setDeleting(null);
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingCost(null);
    setFormData({
      date: new Date().toISOString().split('T')[0],
      category: 'purchase-price',
      description: '',
      amount: 0,
      currency: 'NGN',
    });
    setFormErrors({});
  };

  const toggleCostExpansion = (costId: string) => {
    setExpandedCosts(prev => {
      const newSet = new Set(prev);
      if (newSet.has(costId)) {
        newSet.delete(costId);
      } else {
        newSet.add(costId);
      }
      return newSet;
    });
  };

  const toggleDetailsView = () => {
    setShowDetails(prev => !prev);
  };

  const totalCost = costs.reduce((sum, cost) => sum + cost.amount, 0);

  if (loading) {
    return (
      <div className="cost-management">
        <div className="cost-management__header">
          <h3>Cost Management</h3>
        </div>
        <div className="cost-management__loading">
          <div className="loading-spinner"></div>
          <p>Loading costs...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="cost-management">
      <div className="cost-management__header">
        <h3>Cost Management</h3>
        <div className="cost-management__summary">
          <span className="cost-summary__total">
            Total: {formatCurrency(totalCost, 'NGN')}
          </span>
          <span className="cost-summary__count">
            {costs.length} {costs.length === 1 ? 'entry' : 'entries'}
          </span>
        </div>
        <div className="cost-management__actions">
          <button
            className="cost-management__details-btn"
            onClick={toggleDetailsView}
            disabled={submitting}
          >
            {showDetails ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            {showDetails ? 'Hide Details' : 'Show Details'}
          </button>
          <button
            className="cost-management__add-btn"
            onClick={() => setShowForm(true)}
            disabled={submitting}
          >
            <Plus className="h-4 w-4" />
            Add Cost
          </button>
        </div>
      </div>

      {error && (
        <div className="cost-management__error">
          <p>{error}</p>
        </div>
      )}

      {showForm && (
        <div className="cost-form">
          <div className="cost-form__header">
            <h4>{editingCost ? 'Edit Cost Entry' : 'Add New Cost Entry'}</h4>
            <button
              className="cost-form__cancel"
              onClick={handleCancel}
              disabled={submitting}
            >
              Cancel
            </button>
          </div>

          <form onSubmit={handleSubmit} className="cost-form__form">
            <div className="cost-form__row">
              <div className="cost-form__field">
                <label htmlFor="cost-date">Date *</label>
                <input
                  type="date"
                  id="cost-date"
                  value={formData.date}
                  onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
                  className={formErrors.date ? 'error' : ''}
                />
                {formErrors.date && <span className="error-message">{formErrors.date}</span>}
              </div>

              <div className="cost-form__field">
                <label htmlFor="cost-category">Category *</label>
                <select
                  id="cost-category"
                  value={formData.category}
                  onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value as CostCategory }))}
                >
                  {COST_CATEGORIES.map(category => (
                    <option key={category.value} value={category.value}>
                      {category.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="cost-form__field">
              <label htmlFor="cost-description">Description *</label>
              <input
                type="text"
                id="cost-description"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Enter cost description"
                className={formErrors.description ? 'error' : ''}
              />
              {formErrors.description && <span className="error-message">{formErrors.description}</span>}
            </div>

            <div className="cost-form__field">
              <label htmlFor="cost-amount">Amount (NGN) *</label>
              <input
                type="number"
                id="cost-amount"
                value={formData.amount || ''}
                onChange={(e) => handleAmountChange(parseFloat(e.target.value) || 0)}
                placeholder="0.00"
                min="0"
                step="0.01"
                className={formErrors.amount ? 'error' : ''}
              />
              {formErrors.amount && <span className="error-message">{formErrors.amount}</span>}
            </div>


            <div className="cost-form__actions">
              <button
                type="button"
                className="cost-form__cancel-btn"
                onClick={handleCancel}
                disabled={submitting}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="cost-form__submit-btn"
                disabled={submitting}
              >
                {submitting ? 'Saving...' : (editingCost ? 'Update Cost' : 'Add Cost')}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="cost-list">
        {costs.length === 0 ? (
          <div className="cost-list__empty">
            <DollarSign className="h-8 w-8 text-gray-400" />
            <p>No cost entries yet</p>
            <p className="text-sm text-gray-500">Add your first cost entry to get started</p>
          </div>
        ) : (
          <div className="cost-list__items">
            {costs.map((cost) => {
              const isExpanded = expandedCosts.has(cost.id);
              const categoryInfo = COST_CATEGORIES.find(c => c.value === cost.category);
              
              return (
                <div key={cost.id} className="cost-item">
                  <div className="cost-item__main">
                    <div className="cost-item__header">
                      <div className="cost-item__category">
                        <Tag className="h-4 w-4" />
                        <span>{categoryInfo?.label}</span>
                      </div>
                      <div className="cost-item__date">
                        <Calendar className="h-4 w-4" />
                        <span>{formatDateForDisplay(cost.date)}</span>
                      </div>
                      {showDetails && (
                        <button
                          className="cost-item__expand-btn"
                          onClick={() => toggleCostExpansion(cost.id)}
                        >
                          {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                        </button>
                      )}
                    </div>
                    <div className="cost-item__description">
                      {cost.description}
                    </div>
                    <div className="cost-item__amounts">
                      <span className="cost-item__ngn">
                        {formatCurrency(cost.amount, 'NGN')}
                      </span>
                    </div>
                    
                    {showDetails && isExpanded && (
                      <div className="cost-item__details">
                        <div className="cost-details">
                          <div className="cost-details__row">
                            <div className="cost-details__field">
                              <label>Category</label>
                              <span>{categoryInfo?.label}</span>
                            </div>
                            <div className="cost-details__field">
                              <label>Date</label>
                              <span>{formatDateForDisplay(cost.date)}</span>
                            </div>
                          </div>
                          <div className="cost-details__row">
                            <div className="cost-details__field">
                              <label>Amount</label>
                              <span className="cost-details__amount">
                                {formatCurrency(cost.amount, 'NGN')}
                              </span>
                            </div>
                            <div className="cost-details__field">
                              <label>Created</label>
                              <span>{cost.createdAt ? formatDateForDisplay(cost.createdAt) : 'Unknown'}</span>
                            </div>
                          </div>
                          <div className="cost-details__row cost-details__row--full">
                            <div className="cost-details__field">
                              <label>Description</label>
                              <span className="cost-details__description">{cost.description}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="cost-item__actions">
                    <button
                      className="cost-item__edit"
                      onClick={() => handleEdit(cost)}
                      disabled={submitting || deleting === cost.id}
                      title="Edit cost entry"
                    >
                      <Edit2 className="h-4 w-4" />
                    </button>
                    <button
                      className="cost-item__delete"
                      onClick={() => handleDelete(cost.id)}
                      disabled={submitting || deleting === cost.id}
                      title="Delete cost entry"
                    >
                      {deleting === cost.id ? (
                        <div className="loading-spinner small"></div>
                      ) : (
                        <Trash2 className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
