import React, { useState } from 'react';
import { TranslatedText } from '@/components/TranslatedText';

interface CreateFolderModalProps {
  onClose: () => void;
  onCreate: (name: string) => Promise<void>;
}

const CreateFolderModal: React.FC<CreateFolderModalProps> = ({ onClose, onCreate }) => {
  const [folderName, setFolderName] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!folderName.trim()) return;

    setIsCreating(true);
    try {
      await onCreate(folderName.trim());
      onClose();
    } catch (error) {
      console.error('Failed to create folder:', error);
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-dark-800 rounded-lg shadow-xl w-full max-w-md">
        <div className="flex items-center justify-between p-4 border-b border-dark-700">
          <h2 className="text-xl font-semibold text-dark-100">
            <TranslatedText text="Create New Folder" />
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

        <form onSubmit={handleSubmit} className="p-4">
          <div className="space-y-4">
            <div>
              <label htmlFor="folderName" className="block text-sm font-medium text-dark-300">
                <TranslatedText text="Folder Name" />
              </label>
              <input
                type="text"
                id="folderName"
                value={folderName}
                onChange={(e) => setFolderName(e.target.value)}
                className="mt-1 block w-full rounded-md bg-dark-700 border-dark-600 text-dark-100 focus:border-primary-500 focus:ring-primary-500"
                placeholder="Enter folder name"
                required
              />
            </div>
          </div>

          <div className="mt-6 flex justify-end space-x-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-dark-100 hover:text-dark-50 focus:outline-none"
            >
              <TranslatedText text="Cancel" />
            </button>
            <button
              type="submit"
              disabled={!folderName.trim() || isCreating}
              className={`px-4 py-2 text-sm font-medium text-white rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 ${
                !folderName.trim() || isCreating
                  ? 'bg-dark-600 cursor-not-allowed'
                  : 'bg-primary-500 hover:bg-primary-600'
              }`}
            >
              {isCreating ? (
                <div className="flex items-center space-x-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white"></div>
                  <span><TranslatedText text="Creating..." /></span>
                </div>
              ) : (
                <TranslatedText text="Create" />
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateFolderModal; 