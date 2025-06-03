import React, { useState } from 'react';
import Image from 'next/image';

interface File {
  id: string;
  name: string;
  type?: string;
}

interface FileViewerProps {
  file: File;
  onClose: () => void;
}

const FileViewer: React.FC<FileViewerProps> = ({ file, onClose }) => {
  const [imgZoom, setImgZoom] = useState(1);

  const renderFileContent = () => {
    const fileType = file.type?.toLowerCase() || '';

    // Handle different file types
    if (fileType.includes('pdf')) {
      return (
        <iframe
          src={`/api/files/${file.id}/view`}
          className="w-full h-full"
          title={file.name}
        />
      );
    } else if (fileType.includes('image')) {
      return (
        <Image
          src={`/api/files/${file.id}/view`}
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
          src={`/api/files/${file.id}/view`}
          controls
          className="max-w-full"
        />
      );
    } else if (fileType.includes('audio')) {
      return (
        <audio
          src={`/api/files/${file.id}/view`}
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
            href={`/api/files/${file.id}/download`}
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
        href={`/api/files/${file.id}/download`}
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

  // If it's a PDF, render it as the modal itself
  if (file.type?.toLowerCase().includes('pdf')) {
    return (
      <div className="fixed inset-0 z-50 bg-gray-900/80 flex items-start justify-center">
        <div className="relative w-4/5 mt-12 h-[calc(100vh-6rem)] flex flex-col overflow-hidden">
          <div className="absolute top-0 right-0 p-4 z-10">
            <button
              onClick={onClose}
              className="text-dark-300 hover:text-dark-100 bg-dark-800/80 rounded-full p-2"
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <iframe
            src={`/api/files/${file.id}/view`}
            className="w-full h-full rounded-lg overflow-hidden"
            title={file.name}
            scrolling="no"
            style={{ overflow: 'hidden' }}
          />
        </div>
      </div>
    );
  }

  // For other file types, use the regular modal
  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-gray-900/80 p-0">
      <div
        className={`bg-dark-800 rounded-lg shadow-xl overflow-hidden max-w-full w-auto mt-6 flex flex-col max-h-[150vh]`}
        style={file.type?.toLowerCase().includes('image')
          ? { transform: `scale(${imgZoom})`, transition: 'transform 0.2s' }
          : {}}
        onWheel={e => {
          const fileType = file.type?.toLowerCase() || '';
          if (fileType.includes('image')) {
            e.preventDefault();
            let nextZoom = imgZoom + (e.deltaY < 0 ? 0.1 : -0.1);
            nextZoom = Math.max(0.1, Math.min(5, nextZoom));
            setImgZoom(Number(nextZoom.toFixed(2)));
          }
        }}
      >
        <div className="flex items-center justify-between p-4 border-b border-dark-700 flex-shrink-0">
          <h2 className="text-lg font-medium text-dark-100 truncate">{file.name}</h2>
          <button
            onClick={onClose}
            className="text-dark-300 hover:text-dark-100 flex-shrink-0 ml-4"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className={`flex-1 overflow-auto p-4 ${contentBackgroundClass} ${contentTextColorClass} scrollbar-thin scrollbar-thumb-dark-600 scrollbar-track-dark-800`}>
          <div className="flex items-start justify-center">
            {renderFileContent()}
          </div>
          {file.type?.toLowerCase().includes('image') && renderImageControls()}
        </div>
      </div>
    </div>
  );
};

export default FileViewer;