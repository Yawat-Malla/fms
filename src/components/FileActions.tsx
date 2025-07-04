import React, { useState, useRef, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import FileViewer from './FileViewer';
import { TranslatedText } from '@/components/TranslatedText';
import { useSession } from 'next-auth/react';

interface FileActionsProps {
  item: any;
  isFolder?: boolean;
  onOpen: () => void;
  onRename: () => void;
  onDelete: () => void;
}

const FileActions: React.FC<FileActionsProps> = ({
  item,
  isFolder = false,
  onOpen,
  onRename,
  onDelete,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [showViewer, setShowViewer] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const { data: session } = useSession();
  const isViewer = session?.user?.role === 'viewer';

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleDelete = async () => {
    try {
      const response = await fetch(`/api/${isFolder ? 'folders' : 'files'}/${item.id}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Failed to delete');
      toast.success(`${isFolder ? 'Folder' : 'File'} deleted successfully`);
      onDelete();
    } catch (error) {
      toast.error(`Failed to delete ${isFolder ? 'folder' : 'file'}`);
    }
    setIsOpen(false);
  };

  const handleOpen = () => {
    if (isFolder) {
      onOpen();
    } else {
      window.open(`/api/files/${item.id}/view`, '_blank');
    }
    setIsOpen(false);
  };

  const handleDownload = async () => {
    if (!isFolder) {
      window.open(`/api/files/${item.id}/download`, '_blank');
      return;
    }

    try {
      setIsDownloading(true);
      const response = await fetch(`/api/folders/${item.id}/download`, {
        method: 'GET',
      });

      if (!response.ok) {
        throw new Error('Failed to download folder');
      }

      const blob = await response.blob();
      
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${item.name}.zip`;
      document.body.appendChild(a);
      a.click();
      
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      toast.success('Folder download started');
    } catch (error) {
      console.error('Download error:', error);
      toast.error('Failed to download folder');
    } finally {
      setIsDownloading(false);
      setIsOpen(false);
    }
  };

  return (
    <>
      <div className="relative inline-block" ref={menuRef}>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="p-1 text-dark-300 hover:text-dark-100 focus:outline-none"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
          </svg>
        </button>
        
        {isOpen && (
          <>
            <div 
              className="fixed inset-0 z-[9998]" 
              onClick={() => setIsOpen(false)}
            />
            <div className="fixed right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-[9999] transform origin-top-right">
              <div className="py-1" role="menu" aria-orientation="vertical">
                <button
                  onClick={handleOpen}
                  className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-transform duration-150"
                  role="menuitem"
                >
                  <svg className="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                  <TranslatedText text={isFolder ? "Open Folder" : "Open File"} />
                </button>

                <button
                  onClick={handleDownload}
                  disabled={isDownloading}
                  className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-transform duration-150 disabled:opacity-50 disabled:cursor-not-allowed"
                  role="menuitem"
                >
                  <svg className="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  {isDownloading ? (
                    <TranslatedText text="Downloading..." />
                  ) : (
                    <TranslatedText text={isFolder ? "Download Folder" : "Download File"} />
                  )}
                </button>

                {!isViewer && (
                  <>
                    <button
                      onClick={() => {
                        onRename();
                        setIsOpen(false);
                      }}
                      className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-transform duration-150"
                      role="menuitem"
                    >
                      <svg className="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                      <TranslatedText text="Rename" />
                    </button>
                    <button
                      onClick={handleDelete}
                      className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-transform duration-150"
                      role="menuitem"
                    >
                      <svg className="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                      <TranslatedText text="Delete" />
                    </button>
                  </>
                )}
              </div>
            </div>
          </>
        )}
      </div>

      {showViewer && (
        <FileViewer
          file={{ ...item, url: `/api/files/${item.id}/view` }}
          onClose={() => setShowViewer(false)}
        />
      )}
    </>
  );
};

export default FileActions; 