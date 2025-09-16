'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  HomeIcon, 
  TruckIcon, 
  ChartBarIcon, 
  CogIcon,
  UserGroupIcon,
  WrenchScrewdriverIcon
} from '@heroicons/react/24/outline';

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: HomeIcon },
  { name: 'Vehicles', href: '/vehicles', icon: TruckIcon },
  { name: 'Reports', href: '/reports', icon: ChartBarIcon },
  { name: 'Admin', href: '/admin', icon: WrenchScrewdriverIcon },
  { name: 'Settings', href: '/settings', icon: CogIcon },
  { name: 'Users', href: '/users', icon: UserGroupIcon },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <div className="sidebar">
      <div className="sidebar__brand">
        <h2 className="sidebar__title">VelocityDash</h2>
        <p className="sidebar__subtitle">Vehicle Management</p>
      </div>
      
      <nav className="sidebar__nav">
        <ul className="sidebar__list">
          {navigation.map((item) => {
            const isActive = pathname === item.href;
            return (
              <li key={item.name} className="sidebar__item">
                <Link
                  href={item.href}
                  className={`sidebar__link ${isActive ? 'sidebar__link--active' : ''}`}
                >
                  <item.icon className="sidebar__icon" />
                  <span className="sidebar__text">{item.name}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </div>
  );
}
