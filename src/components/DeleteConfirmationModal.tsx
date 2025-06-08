import React, { useState } from 'react';
import { TranslatedText } from '@/components/TranslatedText';

interface DeleteConfirmationModalProps {
  onClose: () => void;
  onConfirm: () => Promise<void>;
  itemName: string;
  isFolder: boolean;
}

const DeleteConfirmationModal: React.FC<DeleteConfirmationModalProps> = ({
  onClose,
  onConfirm,
  itemName,
  isFolder,
}) => {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleConfirm = async () => {
    setIsDeleting(true);
    try {
      await onConfirm();
      onClose();
    } catch (error) {
      console.error('Failed to delete:', error);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-dark-800 rounded-lg shadow-xl w-full max-w-md">
        <div className="flex items-center justify-between p-4 border-b border-dark-700">
          <h2 className="text-xl font-semibold text-dark-100">
            <TranslatedText text={`Delete ${isFolder ? 'Folder' : 'File'}`} />
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
          <div className="space-y-4">
            <div className="flex items-center justify-center">
              <svg className="w-12 h-12 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
            </div>
            <p className="text-center text-dark-100">
              <TranslatedText text={`Are you sure you want to delete "${itemName}"?`} />
            </p>
            {isFolder && (
              <p className="text-center text-sm text-red-400">
                <TranslatedText text="This will also delete all files and subfolders inside this folder." />
              </p>
            )}
            <p className="text-center text-sm text-dark-300">
              <TranslatedText text="This action cannot be undone." />
            </p>
          </div>

          <div className="mt-6 flex justify-end space-x-4">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-dark-100 hover:text-dark-50 focus:outline-none"
            >
              <TranslatedText text="Cancel" />
            </button>
            <button
              onClick={handleConfirm}
              disabled={isDeleting}
              className={`px-4 py-2 text-sm font-medium text-white rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 ${
                isDeleting ? 'bg-dark-600 cursor-not-allowed' : 'bg-red-500 hover:bg-red-600'
              }`}
            >
              {isDeleting ? (
                <div className="flex items-center space-x-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white"></div>
                  <span><TranslatedText text="Deleting..." /></span>
                </div>
              ) : (
                <TranslatedText text="Delete" />
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeleteConfirmationModal; 