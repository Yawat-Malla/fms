'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useSettings } from '@/contexts/SettingsContext';
import { useSession } from 'next-auth/react';
import Button from './ui/Button';
import { Menu, X } from 'lucide-react';
import { useState } from 'react';
import { NotificationDropdown } from './NotificationDropdown';

export default function Header() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const { settings, isLoading } = useSettings();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const isActive = (path: string) => pathname === path;

  return (
    <header className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center space-x-3">
              <div className="h-8 w-8 relative">
                <Image
                  src={settings?.siteLogo || '/nepal-emblem.png'}
                  alt="Site Logo"
                  fill
                  className="object-contain"
                />
              </div>
              <Link href="/" className="text-xl font-bold text-gray-900">
                {isLoading ? 'Loading...' : settings?.siteName || 'File Management System'}
              </Link>
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden sm:ml-6 sm:flex sm:space-x-8">
            <Link
              href="/"
              className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                isActive('/')
                  ? 'border-indigo-500 text-gray-900'
                  : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
              }`}
            >
              Home
            </Link>
            {session?.user && (
              <>
                <Link
                  href="/files"
                  className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                    isActive('/files')
                      ? 'border-indigo-500 text-gray-900'
                      : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                  }`}
                >
                  Files
                </Link>
                {session.user.role === 'admin' && (
                  <Link
                    href="/admin"
                    className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                      isActive('/admin')
                        ? 'border-indigo-500 text-gray-900'
                        : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                    }`}
                  >
                    Admin
                  </Link>
                )}
              </>
            )}
          </nav>

          {/* Mobile menu button */}
          <div className="flex items-center sm:hidden">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
          </div>

          {/* User menu and notifications */}
          <div className="hidden sm:ml-6 sm:flex sm:items-center space-x-4">
            {session?.user && <NotificationDropdown />}
            {session?.user ? (
              <div className="ml-3 relative">
                <span className="text-sm text-gray-700">
                  {session.user.name}
                </span>
              </div>
            ) : (
              <Link href="/auth/signin">
                <Button variant="outline">Sign in</Button>
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="sm:hidden">
          <div className="pt-2 pb-3 space-y-1">
            <Link
              href="/"
              className={`block pl-3 pr-4 py-2 border-l-4 text-base font-medium ${
                isActive('/')
                  ? 'bg-indigo-50 border-indigo-500 text-indigo-700'
                  : 'border-transparent text-gray-500 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-700'
              }`}
            >
              Home
            </Link>
            {session?.user && (
              <>
                <Link
                  href="/files"
                  className={`block pl-3 pr-4 py-2 border-l-4 text-base font-medium ${
                    isActive('/files')
                      ? 'bg-indigo-50 border-indigo-500 text-indigo-700'
                      : 'border-transparent text-gray-500 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-700'
                  }`}
                >
                  Files
                </Link>
                {session.user.role === 'admin' && (
                  <Link
                    href="/admin"
                    className={`block pl-3 pr-4 py-2 border-l-4 text-base font-medium ${
                      isActive('/admin')
                        ? 'bg-indigo-50 border-indigo-500 text-indigo-700'
                        : 'border-transparent text-gray-500 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-700'
                    }`}
                  >
                    Admin
                  </Link>
                )}
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
} 