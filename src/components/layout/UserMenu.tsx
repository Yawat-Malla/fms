'use client';

import { Fragment } from 'react';
import { Menu, Transition } from '@headlessui/react';
import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useApp } from '@/contexts/AppContext';
import { toast } from 'react-hot-toast';
import Avatar from '@/components/ui/Avatar';

export default function UserMenu() {
  const router = useRouter();
  const { data: session } = useSession();
  const { t } = useApp();
  
  const handleLogout = async () => {
    try {
      await signOut({ redirect: false });
      toast.success('Logged out successfully');
      router.push('/sign-in');
    } catch (error) {
      toast.error('Failed to logout');
    }
  };

  return (
    <Menu as="div" className="relative ml-3">
      <Menu.Button className="flex items-center max-w-xs rounded-full bg-dark-800 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2">
        <span className="sr-only">Open user menu</span>
        <Avatar 
          imageUrl={session?.user?.profilePicture} 
          name={session?.user?.name} 
          size="sm"
        />
      </Menu.Button>

      <Transition
        as={Fragment}
        enter="transition ease-out duration-100"
        enterFrom="transform opacity-0 scale-95"
        enterTo="transform opacity-100 scale-100"
        leave="transition ease-in duration-75"
        leaveFrom="transform opacity-100 scale-100"
        leaveTo="transform opacity-0 scale-95"
      >
        <Menu.Items className="absolute right-0 z-10 mt-2 w-48 origin-top-right rounded-md bg-dark-800 py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
          <div className="px-4 py-2 border-b border-dark-700">
            <p className="text-sm text-dark-100">{session?.user?.name}</p>
            <p className="text-xs text-dark-400 truncate">{session?.user?.email}</p>
          </div>

          <Menu.Item>
            {({ active }) => (
              <a
                href="/profile"
                className={`${
                  active ? 'bg-dark-700' : ''
                } block px-4 py-2 text-sm text-dark-100 hover:bg-dark-700`}
              >
                Profile Settings
              </a>
            )}
          </Menu.Item>

          <Menu.Item>
            {({ active }) => (
              <a
                href="/settings"
                className={`${
                  active ? 'bg-dark-700' : ''
                } block px-4 py-2 text-sm text-dark-100 hover:bg-dark-700`}
              >
                System Settings
              </a>
            )}
          </Menu.Item>

          <div className="border-t border-dark-700">
            <Menu.Item>
              {({ active }) => (
                <button
                  onClick={handleLogout}
                  className={`${
                    active ? 'bg-dark-700' : ''
                  } block w-full text-left px-4 py-2 text-sm text-dark-100 hover:bg-dark-700`}
                >
                  Sign Out
                </button>
              )}
            </Menu.Item>
          </div>
        </Menu.Items>
      </Transition>
    </Menu>
  );
} 