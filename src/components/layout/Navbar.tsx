'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import UserMenu from './UserMenu';
import { useApp } from '@/contexts/AppContext';
import { useSession } from 'next-auth/react';
import { NotificationDropdown } from '@/components/NotificationDropdown';
import { useTranslation } from 'react-i18next';

const navigation = [
  { name: 'Dashboard', href: '/dashboard' },
  { name: 'Files', href: '/files' },
  { name: 'Upload', href: '/upload' },
  { name: 'Sync', href: '/sync' },
  { name: 'Reports', href: '/reports' },
  { name: 'Settings', href: '/settings' },
];

const Navbar = () => {
  const { data: session, status } = useSession();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { t } = useTranslation();

  // Debug logging
  console.log('Navbar render - Session status:', status);
  console.log('Navbar render - Session data:', session);

  // Filter navigation items based on user role
  const filteredNavigation = navigation.filter(item => {
    if (item.name === 'Users') {
      return session?.user?.role === 'superadmin';
    }
    return true;
  });

  return (
    <nav className="bg-white border-b border-dark-600/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <Link href="/" className="text-xl font-bold text-primary-500 hover:text-primary-600 transition-colors">
                FileMS
              </Link>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Search Bar */}
            <div className="hidden md:block">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-dark-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                  </svg>
                </div>
                <input
                  type="text"
                  placeholder="Search..."
                  className="block w-full pl-10 pr-3 py-2 border border-dark-600/50 rounded-md leading-5 bg-white text-dark-100 placeholder-dark-400 focus:outline-none focus:border-primary-500 focus:ring-primary-500 sm:text-sm transition-colors"
                />
              </div>
            </div>

            {/* Online Status */}
            <div className="flex-shrink-0">
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-100/10 text-primary-500">
                Online
              </span>
            </div>

            {/* Notifications */}
            <div className="relative">
              {status === 'loading' ? (
                <span className="text-white">Loading...</span>
              ) : status === 'authenticated' ? (
                <NotificationDropdown />
              ) : (
                <span className="text-white">Not logged in</span>
              )}
            </div>

            {/* User Menu */}
            <UserMenu />

            {/* Mobile menu button */}
            <div className="-mr-2 flex items-center sm:hidden">
              <button
                type="button"
                className="bg-dark-800 inline-flex items-center justify-center p-2 rounded-md text-dark-400 hover:text-dark-100 hover:bg-dark-700 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary-500"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                <span className="sr-only">Open main menu</span>
                {mobileMenuOpen ? (
                  <svg className="block h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                ) : (
                  <svg className="block h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <div className={`${mobileMenuOpen ? 'block' : 'hidden'} sm:hidden bg-dark-800 border-b border-dark-700`}>
        <div className="px-2 pt-2 pb-3 space-y-1">
          {/* Mobile Search */}
          <div className="px-2 py-2">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-dark-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                </svg>
              </div>
              <input
                type="text"
                placeholder="Search..."
                className="block w-full pl-10 pr-3 py-2 border border-dark-600 rounded-md leading-5 bg-dark-700 text-dark-100 placeholder-dark-400 focus:outline-none focus:bg-dark-800 focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
              />
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar; 