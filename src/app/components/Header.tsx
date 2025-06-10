import React from 'react';
import { TranslatedText } from '@/components/TranslatedText';

interface HeaderProps {
  onUploadClick: () => void;
  onNewFolderClick: () => void;
  onViewChange: (view: 'grid' | 'list') => void;
  currentView: 'grid' | 'list';
}

const Header: React.FC<HeaderProps> = ({
  onUploadClick,
  onNewFolderClick,
  onViewChange,
  currentView,
}) => {
  return (
    <div className="bg-dark-800 border-b border-dark-700 p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={onUploadClick}
            className="flex items-center space-x-2 px-4 py-2 bg-primary-500 text-black rounded-md hover:bg-primary-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M12 4v16m8-8H4"
              />
            </svg>
            <span>
              <TranslatedText text="Upload" />
            </span>
          </button>

          <button
            onClick={onNewFolderClick}
            className="flex items-center space-x-2 px-4 py-2 bg-dark-700 text-dark-100 rounded-md hover:bg-dark-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-dark-500"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"
              />
            </svg>
            <span>
              <TranslatedText text="New Folder" />
            </span>
          </button>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => onViewChange('grid')}
            className={`p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 ${
              currentView === 'grid'
                ? 'bg-primary-500 text-white'
                : 'text-dark-100 hover:bg-dark-700'
            }`}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"
              />
            </svg>
          </button>

          <button
            onClick={() => onViewChange('list')}
            className={`p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 ${
              currentView === 'list'
                ? 'bg-primary-500 text-white'
                : 'text-dark-100 hover:bg-dark-700'
            }`}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Header; 