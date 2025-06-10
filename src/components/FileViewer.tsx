import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { TranslatedText } from '@/components/TranslatedText';

interface File {
  id: string;
  name: string;
  type?: string;
  size: number;
  uploadedAt: string;
  fiscalYear?: { name: string };
  source?: { name: string };
  grantType?: { name: string };
  url: string;
}

interface FileViewerProps {
  file: File;
  onClose: () => void;
}

const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

const FileViewer: React.FC<FileViewerProps> = ({ file, onClose }) => {
  const [imgZoom, setImgZoom] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [imgDimensions, setImgDimensions] = useState<{ width: number; height: number } | null>(null);
  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    if (file.type?.startsWith('image') && imgRef.current) {
      const img = imgRef.current;
      if (img.complete) {
        setImgDimensions({ width: img.naturalWidth, height: img.naturalHeight });
      } else {
        img.onload = () => {
          setImgDimensions({ width: img.naturalWidth, height: img.naturalHeight });
        };
      }
    }
  }, [file]);

  const renderFileContent = () => {
    if (file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf')) {
      return (
        <iframe
          src={file.url}
          className="w-full h-full"
          style={{ border: 'none' }}
        />
      );
    }
    if (file.type?.startsWith('image')) {
      return (
        <img
          ref={imgRef}
          src={file.url}
          alt={file.name}
          style={{
            maxWidth: '90vw',
            maxHeight: '90vh',
            width: imgDimensions ? imgDimensions.width : 'auto',
            height: imgDimensions ? imgDimensions.height : 'auto',
            display: 'block',
            margin: '0 auto',
            borderRadius: '0.5rem',
            background: '#181C2A',
          }}
        />
      );
    }
    const fileType = file.type?.toLowerCase() || '';

    // Handle different file types
    if (fileType.includes('video')) {
      return (
        <video
          src={file.url}
          controls
          className="max-w-full"
        />
      );
    } else if (fileType.includes('audio')) {
      return (
        <audio
          src={file.url}
          controls
          className="w-full"
        />
      );
    } else {
      return (
        <div className="flex flex-col text-dark-300 p-4 w-full">
          <svg className="w-16 h-16 mb-4 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
          </svg>
          <p className="text-center">Preview not available for this file type</p>
          <a
            href={file.url}
            className="mt-4 px-4 py-2 bg-primary-500 text-white rounded-md hover:bg-primary-600 transition-colors"
            download
          >
            Download File
          </a>
        </div>
      );
    }
  };

  const isMedia = file.type?.toLowerCase().includes('image') || file.type?.toLowerCase().includes('video') || file.type?.toLowerCase().includes('audio');
  const contentBackgroundClass = isMedia ? 'bg-black' : 'bg-white';
  const contentTextColorClass = isMedia ? 'text-dark-100' : 'text-dark-800';

  // Helper to render Image controls
  const renderImageControls = () => (
    <div className="flex items-center justify-center gap-4 bg-dark-700/80 rounded-full px-6 py-2 mx-auto w-fit mt-2">
      <button
        onClick={() => setImgZoom(z => Math.max(0.1, z - 0.1))}
        className="mx-2 text-dark-100 hover:text-primary-400 text-xl px-2"
        title="Zoom out"
      >
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14" /></svg>
      </button>
      <button
        onClick={() => setImgZoom(1)}
        className="mx-1 text-dark-100 hover:text-primary-400 text-lg px-2"
        title="Reset zoom"
      >
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><circle cx="12" cy="12" r="8" strokeWidth="2" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12h-3" /></svg>
      </button>
      <button
        onClick={() => setImgZoom(z => Math.min(5, z + 0.1))}
        className="mx-2 text-dark-100 hover:text-primary-400 text-xl px-2"
        title="Zoom in"
      >
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v14m7-7H5" /></svg>
      </button>
      <a
        href={file.url}
        download
        className="ml-2 text-dark-100 hover:text-primary-400 p-2 rounded-full transition-colors"
        title="Download"
      >
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M7 10l5 5m0 0l5-5m-5 5V4" />
        </svg>
      </a>
    </div>
  );

  const renderPreview = () => {
    if (isLoading) {
      return (
        <div className="flex items-center justify-center h-full">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
        </div>
      );
    } else if (error) {
      return (
        <div className="text-red-400 text-center">
          <TranslatedText text="Error loading file" />
        </div>
      );
    }
      return (
        <div className="space-y-4">
          <div>
            <h3 className="text-sm font-medium text-dark-300 mb-2">
              <TranslatedText text="Preview" />
            </h3>
            <div className="bg-dark-900 rounded-lg p-4">
              {renderFileContent()}
            </div>
          </div>
        </div>
      );
  };

  // Modal style for image files
  if (file.type?.startsWith('image')) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div
          className="bg-dark-800 rounded-lg shadow-xl flex flex-col p-0 relative"
          style={{
            width: imgDimensions ? Math.min(imgDimensions.width, window.innerWidth * 0.9) : 'auto',
            height: imgDimensions ? Math.min(imgDimensions.height, window.innerHeight * 0.9) : 'auto',
            maxWidth: '90vw',
            maxHeight: '90vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-10 text-dark-300 hover:text-dark-100 focus:outline-none bg-dark-700 rounded-full p-2"
            aria-label="Close"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          {renderFileContent()}
        </div>
        </div>
    );
  }

  // PDF modal (as before)
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-dark-800 rounded-lg shadow-xl w-[90vw] h-[calc(90vh-10rem)] flex flex-col p-0 mt-40 relative">
          <button
            onClick={onClose}
          className="absolute top-4 right-4 z-10 text-dark-300 hover:text-dark-100 focus:outline-none bg-dark-700 rounded-full p-2"
          aria-label="Close"
          >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
          </button>
        <div className="flex-1 overflow-hidden">
          {renderFileContent()}
        </div>
      </div>
    </div>
  );
};

export default FileViewer;