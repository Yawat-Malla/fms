'use client';

import { useState, useEffect, useRef } from 'react';
import { useSession } from 'next-auth/react';
import Sidebar from './Sidebar';
import Avatar from '@/components/ui/Avatar';
import { Bell } from 'lucide-react';
import SearchResults from '@/components/SearchResults';
import AvatarDropdown from '@/components/AvatarDropdown';

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
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearchResults, setShowSearchResults] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

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

  // Close search results when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSearchResults(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

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

  return (
    <div className="h-screen flex overflow-hidden bg-dark-900">
      {/* Sidebar for desktop */}
      <div className={`${sidebarOpen ? 'block' : 'hidden'} md:block md:flex-shrink-0 border-r border-dark-700`}>
        <div className="w-64 h-full">
          <Sidebar />
        </div>
      </div>

      {/* Main content */}
      <div className="flex flex-col w-0 flex-1 overflow-hidden">
        <div className="relative z-10 flex-shrink-0 flex h-16 bg-dark-800 border-b border-dark-700 px-4">
          <button
            type="button"
            className="px-4 text-dark-300 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500 md:hidden"
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
            <div className="flex-1 flex pt-4">
              <div className="w-full relative" ref={searchRef}>
                <label htmlFor="search" className="sr-only">Search</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg className="h-5 w-5 text-dark-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <input
                    id="search"
                    name="search"
                    className="block w-full bg-dark-700 border border-dark-600 rounded-md py-2 pl-10 pr-3 text-sm placeholder-dark-400 focus:outline-none focus:bg-dark-600 focus:border-dark-500 focus:ring-1 focus:ring-primary-500"
                    placeholder="Search files and folders..."
                    type="search"
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      setShowSearchResults(true);
                    }}
                    onFocus={() => setShowSearchResults(true)}
                  />
                </div>
                {showSearchResults && (
                  <SearchResults
                    query={searchQuery}
                    onClose={() => setShowSearchResults(false)}
                  />
                )}
              </div>
            </div>

            {/* Right side icons */}
            <div className="ml-4 flex items-center space-x-4">
              {/* Notification Bell */}
              <div className="relative">
                <button
                  onClick={handleNotificationClick}
                  className="p-1 rounded-full text-dark-400 hover:text-dark-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-dark-800 focus:ring-primary-500"
                >
                  <span className="sr-only">View notifications</span>
                  <Bell className="h-6 w-6" />
                  {notifications.some(n => !n.read) && (
                    <span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-red-400 ring-2 ring-dark-800" />
                  )}
                </button>

                {notificationsOpen && (
                  <div 
                    className="absolute right-0 mt-2 w-80 bg-dark-700 rounded-md shadow-lg border border-dark-600 z-50"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className="p-4">
                      <h2 className="font-semibold mb-2 text-dark-100">Notifications</h2>
                      {loading ? (
                        <div className="text-dark-300">Loading...</div>
                      ) : notifications.length === 0 ? (
                        <div className="text-dark-300">No notifications</div>
                      ) : (
                        <div className="space-y-2">
                          {notifications.map((notification) => (
                            <div
                              key={notification.id}
                              className={`p-3 rounded-md cursor-pointer transition-colors ${
                                notification.read
                                  ? 'bg-dark-600 hover:bg-dark-500'
                                  : 'bg-dark-600/50 hover:bg-dark-500'
                              }`}
                              onClick={() => markAsRead(notification.id)}
                            >
                              <div className="flex items-start">
                                <div className="flex-1">
                                  <p className="text-sm font-medium text-dark-100">
                                    {notification.title}
                                  </p>
                                  <p className="text-sm text-dark-300 mt-1">
                                    {notification.message}
                                  </p>
                                  <p className="text-xs text-dark-400 mt-1">
                                    {new Date(notification.createdAt).toLocaleString()}
                                  </p>
                                </div>
                                {!notification.read && (
                                  <span className="h-2 w-2 bg-primary-500 rounded-full mt-1" />
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Avatar Dropdown */}
              {session?.user && (
                <AvatarDropdown
                  user={{
                    name: session.user.name,
                    email: session.user.email,
                    profilePicture: session.user.profilePicture
                  }}
                />
              )}
            </div>
          </div>
        </div>

        {/* Page content */}
        <main className="flex-1 relative overflow-y-auto focus:outline-none">
          <div className="py-6 px-4 sm:px-6 lg:px-8">
            {children}
          </div>
        </main>
      </div>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 flex z-40 md:hidden">
          {/* Overlay */}
          <div
            className="fixed inset-0 bg-dark-900 bg-opacity-75"
            aria-hidden="true"
            onClick={() => setSidebarOpen(false)}
          ></div>

          {/* Sidebar */}
          <div className="relative flex-1 flex flex-col max-w-xs w-full bg-dark-800 border-r border-dark-700">
            <div className="absolute top-0 right-0 -mr-12 pt-2">
              <button
                type="button"
                className="ml-1 flex items-center justify-center h-10 w-10 rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
                onClick={() => setSidebarOpen(false)}
              >
                <span className="sr-only">Close sidebar</span>
                <svg
                  className="h-6 w-6 text-white"
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
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
            <Sidebar />
          </div>

          {/* Force sidebar to shrink to fit close icon */}
          <div className="flex-shrink-0 w-14"></div>
        </div>
      )}
    </div>
  );
} 