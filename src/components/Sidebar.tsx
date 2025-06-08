import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { TranslatedText } from '@/components/TranslatedText';

interface SidebarProps {
  onPreferencesClick: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ onPreferencesClick }) => {
  const pathname = usePathname();

  const isActive = (path: string) => {
    return pathname === path;
  };

  return (
    <div className="w-64 bg-dark-800 h-screen flex flex-col">
      <div className="p-4 border-b border-dark-700">
        <h1 className="text-xl font-bold text-primary-500">
          <TranslatedText text="File Manager" />
        </h1>
      </div>

      <nav className="flex-1 p-4 space-y-2">
        <Link
          href="/dashboard"
          className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
            isActive('/dashboard')
              ? 'bg-primary-500 text-white'
              : 'text-dark-100 hover:bg-dark-700'
          }`}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
            />
          </svg>
          <span>
            <TranslatedText text="Dashboard" />
          </span>
        </Link>

        <Link
          href="/recent"
          className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
            isActive('/recent')
              ? 'bg-primary-500 text-white'
              : 'text-dark-100 hover:bg-dark-700'
          }`}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <span>
            <TranslatedText text="Recent" />
          </span>
        </Link>

        <Link
          href="/starred"
          className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
            isActive('/starred')
              ? 'bg-primary-500 text-white'
              : 'text-dark-100 hover:bg-dark-700'
          }`}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
            />
          </svg>
          <span>
            <TranslatedText text="Starred" />
          </span>
        </Link>

        <Link
          href="/trash"
          className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
            isActive('/trash')
              ? 'bg-primary-500 text-white'
              : 'text-dark-100 hover:bg-dark-700'
          }`}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
            />
          </svg>
          <span>
            <TranslatedText text="Trash" />
          </span>
        </Link>
      </nav>

      <div className="p-4 border-t border-dark-700">
        <button
          onClick={onPreferencesClick}
          className="flex items-center space-x-2 w-full px-4 py-2 text-dark-100 hover:bg-dark-700 rounded-lg transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
            />
          </svg>
          <span>
            <TranslatedText text="Preferences" />
          </span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar; 