'use client';

import React, { useState, useEffect } from 'react';

interface TimeDisplayProps {
  format?: 'time' | 'datetime' | 'date';
  className?: string;
  prefix?: string;
  updateInterval?: number; // in milliseconds, 0 means no auto-update
}

export function TimeDisplay({ 
  format = 'time', 
  className = '', 
  prefix = '',
  updateInterval = 0 
}: TimeDisplayProps) {
  const [timeString, setTimeString] = useState<string>('');
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    
    const updateTime = () => {
      const now = new Date();
      let formattedTime: string;
      
      switch (format) {
        case 'datetime':
          formattedTime = now.toLocaleString();
          break;
        case 'date':
          formattedTime = now.toLocaleDateString();
          break;
        case 'time':
        default:
          formattedTime = now.toLocaleTimeString();
          break;
      }
      
      setTimeString(formattedTime);
    };

    // Initial update
    updateTime();

    // Set up interval if specified
    let interval: NodeJS.Timeout | null = null;
    if (updateInterval > 0) {
      interval = setInterval(updateTime, updateInterval);
    }

    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [format, updateInterval]);

  // Don't render anything on the server to prevent hydration mismatch
  if (!isClient) {
    return <span className={className}>{prefix}</span>;
  }

  return (
    <span className={className}>
      {prefix}{timeString}
    </span>
  );
}
