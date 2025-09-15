'use client';

import React from 'react';
import { RecentActivity } from '@/types';
import { formatDistanceToNow } from 'date-fns';
import { 
  PlusIcon,
  PencilIcon,
  TruckIcon,
  CurrencyDollarIcon,
  UserIcon
} from '@heroicons/react/24/outline';

interface RecentActivityFeedProps {
  activities: RecentActivity[];
  isLoading: boolean;
}

const activityIcons = {
  'added': PlusIcon,
  'changed': PencilIcon,
  'updated': PencilIcon,
  'cost': CurrencyDollarIcon,
  'status': TruckIcon,
  'user': UserIcon,
};

function getActivityIcon(action: string) {
  const lowerAction = action.toLowerCase();
  
  if (lowerAction.includes('added') || lowerAction.includes('cost')) return activityIcons.added;
  if (lowerAction.includes('changed') || lowerAction.includes('updated')) return activityIcons.changed;
  if (lowerAction.includes('status')) return activityIcons.status;
  if (lowerAction.includes('cost') || lowerAction.includes('price')) return activityIcons.cost;
  
  return activityIcons.user;
}

export function RecentActivityFeed({ activities, isLoading }: RecentActivityFeedProps) {
  if (isLoading) {
    return (
      <div className="activity-feed__content">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="activity-feed__item-skeleton">
            <div className="activity-feed__item-icon-skeleton"></div>
            <div className="activity-feed__item-content-skeleton">
              <div className="activity-feed__item-text-skeleton"></div>
              <div className="activity-feed__item-meta-skeleton"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (activities.length === 0) {
    return (
      <div className="activity-feed__empty">
        <UserIcon className="activity-feed__empty-icon" />
        <p className="activity-feed__empty-text">No recent activity</p>
      </div>
    );
  }

  return (
    <div className="activity-feed__content">
      <div className="activity-feed__count">{activities.length} activities</div>
      {activities.map((activity) => {
        const IconComponent = getActivityIcon(activity.action);
        const timeAgo = formatDistanceToNow(activity.timestamp, { addSuffix: true });
        
        return (
          <div key={activity.id} className="activity-feed__item">
            <div className="activity-feed__item-icon">
              <IconComponent className="activity-feed__item-icon-svg" />
            </div>
            
            <div className="activity-feed__item-content">
              <div className="activity-feed__item-text">
                <span className="activity-feed__item-user">{activity.userName}</span>
                {' '}
                <span className="activity-feed__item-action">{activity.action}</span>
                {' '}
                {activity.vehicleName && (
                  <span className="activity-feed__item-vehicle">
                    {activity.vehicleName}
                  </span>
                )}
              </div>
              
              <div className="activity-feed__item-meta">
                <span className="activity-feed__item-time">{timeAgo}</span>
                {activity.vehicleId && (
                  <span className="activity-feed__item-id">
                    ID: {activity.vehicleId}
                  </span>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}