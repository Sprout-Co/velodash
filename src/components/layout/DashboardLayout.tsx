'use client';

import React, { useState, useEffect } from 'react';
import { Sidebar } from '@/components/layout/Sidebar';
import { Header } from '@/components/layout/Header';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Close sidebar when clicking outside on mobile
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (window.innerWidth <= 768 && isSidebarOpen) {
        const sidebar = document.querySelector('.sidebar');
        const hamburger = document.querySelector('.header__hamburger');
        
        if (sidebar && !sidebar.contains(event.target as Node) && 
            hamburger && !hamburger.contains(event.target as Node)) {
          setIsSidebarOpen(false);
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isSidebarOpen]);

  // Close sidebar on route change
  useEffect(() => {
    setIsSidebarOpen(false);
  }, [children]);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <div className="dashboard-layout">
      <Sidebar isOpen={isSidebarOpen} />
      <div className="dashboard-layout__main">
        <Header 
          isSidebarOpen={isSidebarOpen} 
          onToggleSidebar={toggleSidebar} 
        />
        <main className="dashboard-layout__content">
          {children}
        </main>
      </div>
      {/* Mobile overlay */}
      {isSidebarOpen && (
        <div 
          className="sidebar-overlay sidebar-overlay--open" 
          onClick={() => setIsSidebarOpen(false)}
        />
      )}
    </div>
  );
}
