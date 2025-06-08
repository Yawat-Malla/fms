import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { TranslatedText } from '@/components/TranslatedText';

interface UploadModalProps {
  onClose: () => void;
  onUpload: (files: File[]) => Promise<void>;
}

const UploadModal: React.FC<UploadModalProps> = ({ onClose, onUpload }) => {
  const [files, setFiles] = useState<File[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    setFiles(prev => [...prev, ...acceptedFiles]);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    maxSize: 100 * 1024 * 1024, // 100MB
  });

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleUpload = async () => {
    if (files.length === 0) return;
    setIsUploading(true);
    try {
      await onUpload(files);
      onClose();
    } catch (error) {
      console.error('Upload failed:', error);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-dark-800 rounded-lg shadow-xl w-full max-w-2xl">
        <div className="flex items-center justify-between p-4 border-b border-dark-700">
          <h2 className="text-xl font-semibold text-dark-100">
            <TranslatedText text="files.upload.title" />
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

        <div className="p-4">
          <div
            {...getRootProps()}
            className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
              isDragActive ? 'border-primary-500 bg-primary-500/10' : 'border-dark-600 hover:border-primary-500'
            }`}
          >
            <input {...getInputProps()} />
            <svg
              className="mx-auto h-12 w-12 text-dark-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
              />
            </svg>
            <p className="mt-2 text-sm text-dark-300">
              <TranslatedText text="files.upload.document.description" />
            </p>
            <p className="mt-1 text-xs text-dark-400">
              <TranslatedText text="files.upload.document.maxSize" />
            </p>
          </div>

          {files.length > 0 && (
            <div className="mt-4">
              <h3 className="text-sm font-medium text-dark-300 mb-2">
                <TranslatedText text="files.upload.document.selectedFiles" />
              </h3>
              <div className="space-y-2">
                {files.map((file, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-2 bg-dark-700 rounded"
                  >
                    <div className="flex items-center space-x-2">
                      <svg className="w-5 h-5 text-dark-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                        />
                      </svg>
                      <span className="text-sm text-dark-100 truncate">{file.name}</span>
                    </div>
                    <button
                      onClick={() => removeFile(index)}
                      className="text-dark-400 hover:text-red-400 focus:outline-none"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M6 18L18 6M6 6l12 12"
                        />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="mt-4 flex justify-end space-x-4">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-dark-100 hover:text-dark-50 focus:outline-none"
            >
              <TranslatedText text="common.cancel" />
            </button>
            <button
              onClick={handleUpload}
              disabled={files.length === 0 || isUploading}
              className={`px-4 py-2 text-sm font-medium text-white rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 ${
                files.length === 0 || isUploading
                  ? 'bg-dark-600 cursor-not-allowed'
                  : 'bg-primary-500 hover:bg-primary-600'
              }`}
            >
              {isUploading ? (
                <div className="flex items-center space-x-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white"></div>
                  <span><TranslatedText text="common.loading" /></span>
                </div>
              ) : (
                <TranslatedText text="files.upload.navigation.upload" />
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UploadModal; 