'use client';

import React from 'react';
import { BellIcon, UserCircleIcon } from '@heroicons/react/24/outline';

export function Header() {
  return (
    <header className="header">
      <div className="header__left">
        <h1 className="header__title">Dashboard</h1>
      </div>
      
      <div className="header__right">
        <button className="header__notification" aria-label="Notifications">
          <BellIcon className="header__icon" />
          <span className="header__badge">3</span>
        </button>
        
        <div className="header__user">
          <UserCircleIcon className="header__avatar" />
          <div className="header__user-info">
            <span className="header__user-name">Admin User</span>
            <span className="header__user-role">Administrator</span>
          </div>
        </div>
      </div>
    </header>
  );
}
