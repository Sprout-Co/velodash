'use client';

import React from 'react';
import { ActionRequired } from '@/types';
import { formatCurrency } from '@/lib/utils';
import { 
  ExclamationTriangleIcon,
  ClockIcon,
  TruckIcon,
  WrenchScrewdriverIcon
} from '@heroicons/react/24/outline';

interface ActionRequiredListProps {
  items: ActionRequired[];
  isLoading: boolean;
}

const priorityConfig = {
  high: { color: 'red', icon: ExclamationTriangleIcon },
  medium: { color: 'yellow', icon: ClockIcon },
  low: { color: 'blue', icon: ClockIcon },
};

const typeConfig = {
  'customs-delay': { icon: TruckIcon, label: 'Customs Delay' },
  'workshop-delay': { icon: WrenchScrewdriverIcon, label: 'Workshop Delay' },
  'unsold-aging': { icon: ClockIcon, label: 'Unsold Aging' },
};

export function ActionRequiredList({ items, isLoading }: ActionRequiredListProps) {
  if (isLoading) {
    return (
      <div className="action-required">
        <div className="action-required__header">
          <h3 className="action-required__title">Action Required</h3>
        </div>
        <div className="action-required__content">
          {[1, 2, 3].map((i) => (
            <div key={i} className="action-required__item-skeleton">
              <div className="action-required__item-icon-skeleton"></div>
              <div className="action-required__item-content-skeleton">
                <div className="action-required__item-title-skeleton"></div>
                <div className="action-required__item-description-skeleton"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="action-required">
        <div className="action-required__header">
          <h3 className="action-required__title">Action Required</h3>
        </div>
        <div className="action-required__content">
          <div className="action-required__empty">
            <ClockIcon className="action-required__empty-icon" />
            <p className="action-required__empty-text">No action items at this time</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="action-required">
      <div className="action-required__header">
        <h3 className="action-required__title">Action Required</h3>
        <span className="action-required__count">{items.length}</span>
      </div>
      
      <div className="action-required__content">
        {items.map((item) => {
          const priority = priorityConfig[item.priority];
          const type = typeConfig[item.type];
          const PriorityIcon = priority.icon;
          const TypeIcon = type.icon;
          
          return (
            <div key={item.id} className={`action-required__item action-required__item--${item.priority}`}>
              <div className="action-required__item-icon">
                <TypeIcon className="action-required__item-type-icon" />
                <PriorityIcon className={`action-required__item-priority-icon action-required__item-priority-icon--${item.priority}`} />
              </div>
              
              <div className="action-required__item-content">
                <div className="action-required__item-header">
                  <h4 className="action-required__item-title">{item.vehicleName}</h4>
                  <span className={`action-required__item-priority action-required__item-priority--${item.priority}`}>
                    {item.priority.toUpperCase()}
                  </span>
                </div>
                
                <p className="action-required__item-description">
                  {item.description}
                </p>
                
                <div className="action-required__item-meta">
                  <span className="action-required__item-days">
                    {item.days} days overdue
                  </span>
                  <span className="action-required__item-type">
                    {type.label}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
