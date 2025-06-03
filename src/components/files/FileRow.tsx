'use client';

import { useState } from 'react';
import { format } from 'date-fns';
import { File } from '@/types';
import { FileStatus } from '@/types/index';
import Avatar from '@/components/ui/Avatar';

interface FileRowProps {
  file: File;
  onSelect: (file: File) => void;
  onDelete: (file: File) => void;
  onView?: (file: File) => void;
}

export default function FileRow({ file, onSelect, onDelete, onView }: FileRowProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  
  // Format date
  const formattedDate = file.lastModifiedAt 
    ? format(new Date(file.lastModifiedAt), 'MMM d, yyyy')
    : 'Unknown date';

  // File type icon based on extension
  const getFileIcon = () => {
    const fileType = file.type.toLowerCase();
    
    const iconClasses = "h-8 w-8 rounded flex items-center justify-center";
    
    switch (fileType) {
      case 'pdf':
      case 'application/pdf':
        return (
          <div className={`${iconClasses} bg-red-100/10 text-red-400`}>
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
            </svg>
          </div>
        );
      case 'doc':
      case 'docx':
      case 'application/msword':
      case 'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
        return (
          <div className={`${iconClasses} bg-blue-100/10 text-blue-400`}>
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
            </svg>
          </div>
        );
      case 'xls':
      case 'xlsx':
      case 'csv':
      case 'application/vnd.ms-excel':
      case 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet':
      case 'text/csv':
        return (
          <div className={`${iconClasses} bg-emerald-100/10 text-emerald-400`}>
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
            </svg>
          </div>
        );
      case 'jpg':
      case 'jpeg':
      case 'png':
      case 'gif':
      case 'webp':
      case 'image/jpeg':
      case 'image/png':
      case 'image/gif':
      case 'image/webp':
        return (
          <div className={`${iconClasses} bg-purple-100/10 text-purple-400`}>
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
        );
      case 'mp4':
      case 'mov':
      case 'avi':
      case 'mkv':
      case 'video/mp4':
      case 'video/quicktime':
      case 'video/x-msvideo':
      case 'video/x-matroska':
        return (
          <div className={`${iconClasses} bg-pink-100/10 text-pink-400`}>
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
          </div>
        );
      case 'mp3':
      case 'wav':
      case 'ogg':
      case 'audio/mpeg':
      case 'audio/wav':
      case 'audio/ogg':
        return (
          <div className={`${iconClasses} bg-yellow-100/10 text-yellow-400`}>
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
            </svg>
          </div>
        );
      case 'zip':
      case 'rar':
      case '7z':
      case 'application/zip':
      case 'application/x-rar-compressed':
      case 'application/x-7z-compressed':
        return (
          <div className={`${iconClasses} bg-amber-100/10 text-amber-400`}>
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
            </svg>
          </div>
        );
      case 'ppt':
      case 'pptx':
      case 'application/vnd.ms-powerpoint':
      case 'application/vnd.openxmlformats-officedocument.presentationml.presentation':
        return (
          <div className={`${iconClasses} bg-orange-100/10 text-orange-400`}>
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v8m-4-4h8" />
            </svg>
          </div>
        );
      default:
        return (
          <div className={`${iconClasses} bg-gray-100/10 text-gray-400`}>
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
            </svg>
          </div>
        );
    }
  };

  // Format file size (e.g., 1.2 MB)
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    
    const units = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${units[i]}`;
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const handleClickOutside = () => {
    if (isMenuOpen) {
      setIsMenuOpen(false);
    }
  };

  return (
    <tr className="group hover:bg-dark-600">
      <td className="py-4 px-4">
        <div className="flex items-center">
          <input
            type="checkbox" 
            className="h-4 w-4 text-primary-600 border-dark-400 rounded focus:ring-primary-500 focus:ring-offset-dark-800"
            onChange={() => onSelect(file)}
          />
        </div>
      </td>
      <td className="py-4 px-4">
        <div className="flex items-center">
          {getFileIcon()}
          <div className="ml-4">
            <div className="font-medium text-dark-100 truncate max-w-xs">
              {file.name}
            </div>
            <div className="text-xs text-dark-400">
              {formatFileSize(file.size)}
              <span className="ml-1 text-dark-500">•</span>
              <span className="ml-1">{file.type}</span>
            </div>
          </div>
        </div>
      </td>
      <td className="py-4 px-4 text-sm text-dark-300">
        <span>{file.user?.name || 'Unknown User'}</span>
      </td>
      <td className="py-4 px-4 text-sm text-dark-300">{formattedDate}</td>
      <td className="py-4 px-4 text-right relative overflow-visible">
        <button
          type="button"
          className="text-dark-400 hover:text-dark-100 focus:outline-none"
          onClick={toggleMenu}
        >
          <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
            <path d="M6 10a2 2 0 11-4 0 2 2 0 014 0zM12 10a2 2 0 11-4 0 2 2 0 014 0zM16 12a2 2 0 100-4 2 2 0 000 4z" />
          </svg>
        </button>
        
        {/* Dropdown menu */}
        {isMenuOpen && (
          <>
            <div 
              className="fixed inset-0 z-10" 
              onClick={handleClickOutside}
            ></div>
            <div className="absolute right-0 mt-2 w-48 rounded-md shadow-dark-lg bg-dark-600 ring-1 ring-black ring-opacity-5 z-20">
              <div className="py-1">
                <button
                  type="button"
                  className="block w-full text-left px-4 py-2 text-sm text-dark-200 hover:bg-dark-500"
                  onClick={() => {
                    onView && onView(file);
                    setIsMenuOpen(false);
                  }}
                >
                  View details
                </button>
                <button
                  type="button"
                  className="block w-full text-left px-4 py-2 text-sm text-dark-200 hover:bg-dark-500"
                  onClick={() => {
                    // Handle download
                    setIsMenuOpen(false);
                  }}
                >
                  Download
                </button>
                <button
                  type="button"
                  className="block w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-dark-500"
                  onClick={() => {
                    onDelete(file);
                    setIsMenuOpen(false);
                  }}
                >
                  Delete
                </button>
              </div>
            </div>
          </>
        )}
      </td>
    </tr>
  );
} 