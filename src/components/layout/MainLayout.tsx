'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import Sidebar from './Sidebar';
import { Avatar } from '@/components/ui/Avatar';
import { Bell } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import Link from 'next/link';

interface MainLayoutProps {
  children: React.ReactNode;
}

interface Notification {
  id: number;
  title: string;
  message: string;
  type: string;
  read: boolean;
  createdAt: string;
}

export default function MainLayout({ children }: MainLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);
  const { data: session } = useSession();
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const handleNotificationClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setNotificationsOpen(prev => !prev);
  };

  // Close notifications when clicking outside
  const handleClickOutside = (e: MouseEvent) => {
    if (notificationsOpen) {
      setNotificationsOpen(false);
    }
  };

  // Add click outside listener
  useEffect(() => {
    if (notificationsOpen) {
      document.addEventListener('click', handleClickOutside);
    }
    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, [notificationsOpen]);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/notifications');
      if (!response.ok) throw new Error('Failed to fetch notifications');
      const data = await response.json();
      setNotifications(data);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (notificationId: number) => {
    try {
      const response = await fetch('/api/notifications', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notificationId }),
      });
      if (!response.ok) throw new Error('Failed to mark notification as read');
      
      setNotifications(prev =>
        prev.map(notification =>
          notification.id === notificationId
            ? { ...notification, read: true }
            : notification
        )
      );
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  useEffect(() => {
    if (session?.user) {
      fetchNotifications();
    }
  }, [session]);

  const handleLogout = () => {
    // Implement logout functionality
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark-900">
      <div className="flex h-screen">
        {/* Sidebar */}
        <Sidebar />

        {/* Main content */}
        <div className="flex flex-col w-0 flex-1 overflow-hidden">
          <div className="relative z-10 flex-shrink-0 flex h-16 bg-white dark:bg-dark-800 border-b border-gray-200 dark:border-dark-700 px-4">
            <button
              type="button"
              className="px-4 text-gray-500 dark:text-dark-300 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary-500 md:hidden"
              onClick={() => setSidebarOpen(true)}
            >
              <span className="sr-only">Open sidebar</span>
              <svg
                className="h-6 w-6"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            </button>

            {/* Top navigation/search bar */}
            <div className="flex-1 px-4 flex justify-between">
              <div className="flex-1 flex">
                <form className="w-full flex md:ml-0" action="#" method="GET">
                  <label htmlFor="search-field" className="sr-only">
                    Search
                  </label>
                  <div className="relative w-full text-gray-400 dark:text-dark-400 focus-within:text-gray-500 dark:focus-within:text-dark-300">
                    <div className="absolute inset-y-0 left-0 flex items-center pointer-events-none">
                      <svg
                        className="h-5 w-5"
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                        aria-hidden="true"
                      >
                        <path
                          fillRule="evenodd"
                          d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                    <input
                      id="search-field"
                      className="block w-full h-full pl-8 pr-3 py-2 border-transparent text-gray-900 dark:text-dark-100 placeholder-gray-500 dark:placeholder-dark-400 focus:outline-none focus:placeholder-gray-400 dark:focus:placeholder-dark-300 focus:ring-0 focus:border-transparent sm:text-sm bg-gray-50 dark:bg-dark-700"
                      placeholder="Search"
                      type="search"
                      name="search"
                    />
                  </div>
                </form>
              </div>
              <div className="ml-4 flex items-center md:ml-6 space-x-3">
                <div className="relative">
                  <button
                    type="button"
                    className="p-1 rounded-full text-gray-400 dark:text-dark-300 hover:text-gray-500 dark:hover:text-dark-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-transform duration-150"
                    onClick={handleNotificationClick}
                  >
                    <span className="sr-only">View notifications</span>
                    <div className="relative">
                      <Bell className="h-6 w-6" />
                      {notifications.some(n => !n.read) && (
                        <span className="absolute -top-1 -right-1 h-3 w-3 bg-primary-500 rounded-full" />
                      )}
                    </div>
                  </button>
                </div>

                {/* Profile dropdown */}
                <div className="ml-3 relative">
                  <div>
                    <button
                      type="button"
                      className="max-w-xs bg-white dark:bg-dark-800 rounded-full flex items-center text-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                      id="user-menu-button"
                      aria-expanded="false"
                      aria-haspopup="true"
                      onClick={() => setUserMenuOpen(!userMenuOpen)}
                    >
                      <span className="sr-only">Open user menu</span>
                      <Avatar
                        imageUrl={session?.user?.profilePicture}
                        name={session?.user?.name || ''}
                        size="sm"
                      />
                    </button>
                  </div>

                  {/* Dropdown menu */}
                  <AnimatePresence>
                    {userMenuOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.2 }}
                        className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg py-1 bg-white dark:bg-dark-800 ring-1 ring-black ring-opacity-5 focus:outline-none"
                        role="menu"
                        aria-orientation="vertical"
                        aria-labelledby="user-menu-button"
                        tabIndex={-1}
                      >
                        <Link
                          href="/profile"
                          className="block px-4 py-2 text-sm text-gray-700 dark:text-dark-300 hover:bg-gray-100 dark:hover:bg-dark-700"
                          role="menuitem"
                          tabIndex={-1}
                          id="user-menu-item-0"
                        >
                          Your Profile
                        </Link>
                        <Link
                          href="/settings"
                          className="block px-4 py-2 text-sm text-gray-700 dark:text-dark-300 hover:bg-gray-100 dark:hover:bg-dark-700"
                          role="menuitem"
                          tabIndex={-1}
                          id="user-menu-item-1"
                        >
                          Settings
                        </Link>
                        <button
                          onClick={handleLogout}
                          className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-dark-300 hover:bg-gray-100 dark:hover:bg-dark-700"
                          role="menuitem"
                          tabIndex={-1}
                          id="user-menu-item-2"
                        >
                          Sign out
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </div>
          </div>

          {/* Main content */}
          <main className="flex-1 relative overflow-y-auto focus:outline-none">
            <div className="py-6">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
                {children}
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
} 