import React, { useState } from 'react';
import { TranslatedText } from '@/components/TranslatedText';

interface PreferencesModalProps {
  onClose: () => void;
  onSave: (preferences: { language: string; theme: string }) => Promise<void>;
  currentPreferences: {
    language: string;
    theme: string;
  };
}

const PreferencesModal: React.FC<PreferencesModalProps> = ({
  onClose,
  onSave,
  currentPreferences,
}) => {
  const [preferences, setPreferences] = useState(currentPreferences);
  const [isSaving, setIsSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await onSave(preferences);
      onClose();
    } catch (error) {
      console.error('Failed to save preferences:', error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-dark-800 rounded-lg shadow-xl w-full max-w-md">
        <div className="flex items-center justify-between p-4 border-b border-dark-700">
          <h2 className="text-xl font-semibold text-dark-100">
            <TranslatedText text="Preferences" />
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
              <label htmlFor="language" className="block text-sm font-medium text-dark-300">
                <TranslatedText text="Language" />
              </label>
              <select
                id="language"
                value={preferences.language}
                onChange={(e) => setPreferences({ ...preferences, language: e.target.value })}
                className="mt-1 block w-full rounded-md bg-dark-700 border-dark-600 text-dark-100 focus:border-primary-500 focus:ring-primary-500"
              >
                <option value="en">English</option>
                <option value="ne">नेपाली (Nepali)</option>
              </select>
            </div>

            <div>
              <label htmlFor="theme" className="block text-sm font-medium text-dark-300">
                <TranslatedText text="Theme" />
              </label>
              <select
                id="theme"
                value={preferences.theme}
                onChange={(e) => setPreferences({ ...preferences, theme: e.target.value })}
                className="mt-1 block w-full rounded-md bg-dark-700 border-dark-600 text-dark-100 focus:border-primary-500 focus:ring-primary-500"
              >
                <option value="light">
                  <TranslatedText text="Light" />
                </option>
                <option value="dark">
                  <TranslatedText text="Dark" />
                </option>
                <option value="system">
                  <TranslatedText text="System" />
                </option>
              </select>
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
              disabled={isSaving}
              className={`px-4 py-2 text-sm font-medium text-white rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 ${
                isSaving ? 'bg-dark-600 cursor-not-allowed' : 'bg-primary-500 hover:bg-primary-600'
              }`}
            >
              {isSaving ? (
                <div className="flex items-center space-x-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white"></div>
                  <span><TranslatedText text="Saving..." /></span>
                </div>
              ) : (
                <TranslatedText text="Save" />
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PreferencesModal; 