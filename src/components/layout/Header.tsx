'use client';

import React, { useState } from 'react';
import { BellIcon, UserCircleIcon, Bars3Icon, XMarkIcon, ArrowRightOnRectangleIcon } from '@heroicons/react/24/outline';
import { useAuth } from '@/contexts/AuthContext';

interface HeaderProps {
  isSidebarOpen?: boolean;
  onToggleSidebar?: () => void;
}

export function Header({ isSidebarOpen = false, onToggleSidebar }: HeaderProps) {
  const { user, logout } = useAuth();
  const [showUserMenu, setShowUserMenu] = useState(false);

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <header className="header">
      <div className="header__left">
        <button 
          className="header__hamburger"
          onClick={onToggleSidebar}
          aria-label="Toggle sidebar"
        >
          {isSidebarOpen ? (
            <XMarkIcon className="header__hamburger-icon" />
          ) : (
            <Bars3Icon className="header__hamburger-icon" />
          )}
        </button>
        <h1 className="header__title">Dashboard</h1>
      </div>
      
      <div className="header__right">
        <button className="header__notification" aria-label="Notifications">
          <BellIcon className="header__icon" />
          <span className="header__badge">3</span>
        </button>
        
        <div className="header__user" onClick={() => setShowUserMenu(!showUserMenu)}>
          <UserCircleIcon className="header__avatar" />
          <div className="header__user-info">
            <span className="header__user-name">{user?.displayName || 'Admin User'}</span>
            <span className="header__user-role">{user?.role === 'admin' ? 'Administrator' : 'User'}</span>
          </div>
          
          {showUserMenu && (
            <div className="header__user-menu">
              <div className="header__user-menu-item" onClick={handleLogout}>
                <ArrowRightOnRectangleIcon className="header__menu-icon" />
                <span>Sign Out</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
