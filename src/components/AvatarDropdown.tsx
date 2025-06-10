'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { FiUser, FiSettings, FiLogOut } from 'react-icons/fi';
import { signOut } from 'next-auth/react';
import Avatar from './ui/Avatar';

interface AvatarDropdownProps {
  user: {
    name?: string | null;
    email?: string | null;
    profilePicture?: string | null;
  };
}

export default function AvatarDropdown({ user }: AvatarDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSignOut = async () => {
    await signOut({ callbackUrl: '/auth/signin' });
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center focus:outline-none"
      >
        <Avatar
          imageUrl={user.profilePicture}
          name={user.name || 'User'}
          size="sm"
          className="cursor-pointer"
        />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="absolute right-0 mt-2 w-48 bg-primary-500 border border-primary-600 rounded-lg shadow-lg z-50"
          >
            <div className="py-2">
              <div className="px-4 py-2 border-b border-primary-600">
                <p className="text-sm font-medium text-white">{user.name}</p>
                <p className="text-xs text-primary-200 truncate">{user.email}</p>
              </div>

              <button
                onClick={() => {
                  router.push('/settings?tab=profile');
                  setIsOpen(false);
                }}
                className="w-full px-4 py-2 text-left text-sm text-primary-100 hover:bg-primary-600 flex items-center"
              >
                <FiUser className="w-4 h-4 mr-2" />
                Profile
              </button>

              <button
                onClick={() => {
                  router.push('/settings');
                  setIsOpen(false);
                }}
                className="w-full px-4 py-2 text-left text-sm text-primary-100 hover:bg-primary-600 flex items-center"
              >
                <FiSettings className="w-4 h-4 mr-2" />
                Settings
              </button>

              <button
                onClick={handleSignOut}
                className="w-full px-4 py-2 text-left text-sm text-red-300 hover:bg-primary-600 flex items-center"
              >
                <FiLogOut className="w-4 h-4 mr-2" />
                Sign out
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
} 