'use client';

import React, { useState, useEffect } from 'react';

export function LastUpdated() {
  const [timeString, setTimeString] = useState<string>('');

  useEffect(() => {
    // Set initial time
    setTimeString(new Date().toLocaleTimeString());
    
    // Update every second
    const interval = setInterval(() => {
      setTimeString(new Date().toLocaleTimeString());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="dashboard__last-updated">
      Last updated: {timeString}
    </div>
  );
}
