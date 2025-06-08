import React, { useState } from 'react';
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

  const renderFileContent = () => {
    const fileType = file.type?.toLowerCase() || '';

    // Handle different file types
    if (fileType.includes('pdf')) {
      return (
        <iframe
          src={file.url}
          className="w-full h-full"
          title={file.name}
        />
      );
    } else if (fileType.includes('image')) {
      return (
        <Image
          src={file.url}
          alt={file.name}
          width={100}
          height={100}
          className="max-w-full"
          priority
        />
      );
    } else if (fileType.includes('video')) {
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
    } else {
      return (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h3 className="text-sm font-medium text-dark-300 mb-2">
                <TranslatedText text="File Information" />
              </h3>
              <div className="space-y-2 text-sm text-dark-100">
                <p>
                  <TranslatedText text="Size" />: {formatFileSize(file.size)}
                </p>
                <p>
                  <TranslatedText text="Type" />: {file.type}
                </p>
                <p>
                  <TranslatedText text="Uploaded" />: {new Date(file.uploadedAt).toLocaleString()}
                </p>
              </div>
            </div>
            <div>
              <h3 className="text-sm font-medium text-dark-300 mb-2">
                <TranslatedText text="Metadata" />
              </h3>
              <div className="space-y-2 text-sm text-dark-100">
                <p>
                  <TranslatedText text="Fiscal Year" />: {file.fiscalYear?.name || '-'}
                </p>
                <p>
                  <TranslatedText text="Source" />: {file.source?.name || '-'}
                </p>
                <p>
                  <TranslatedText text="Grant Type" />: {file.grantType?.name || '-'}
                </p>
              </div>
            </div>
          </div>
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
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-dark-800 rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between p-4 border-b border-dark-700">
          <h2 className="text-xl font-semibold text-dark-100">
            <TranslatedText text={file.name} />
          </h2>
          <button
            onClick={onClose}
            className="text-dark-300 hover:text-dark-100 focus:outline-none"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="flex-1 overflow-auto p-4">
          {renderPreview()}
        </div>
        <div className="p-4 border-t border-dark-700 flex justify-end space-x-4">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-dark-100 hover:text-dark-50 focus:outline-none"
          >
            <TranslatedText text="Close" />
          </button>
          <a
            href={file.url}
            download={file.name}
            className="px-4 py-2 text-sm font-medium text-white bg-primary-500 rounded-md hover:bg-primary-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
          >
            <TranslatedText text="Download" />
          </a>
        </div>
      </div>
    </div>
  );
};

export default FileViewer;