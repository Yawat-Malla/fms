import React from 'react';
import { TranslatedText } from '@/components/TranslatedText';

interface ErrorStateProps {
  title?: string;
  message?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}

const ErrorState: React.FC<ErrorStateProps> = ({ title, message, action }) => {
  return (
    <div className="flex flex-col items-center justify-center h-full p-8 text-center">
      <svg
        className="w-16 h-16 text-red-400 mb-4"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
        />
      </svg>
      <h3 className="text-lg font-medium text-dark-100 mb-2">
        <TranslatedText text={title || 'Error'} />
      </h3>
      <p className="text-dark-300 mb-6">
        <TranslatedText text={message || 'Something went wrong. Please try again.'} />
      </p>
      {action && (
        <button
          onClick={action.onClick}
          className="px-4 py-2 bg-primary-500 text-white rounded-md hover:bg-primary-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
        >
          <TranslatedText text={action.label} />
        </button>
      )}
    </div>
  );
};

export default ErrorState; 