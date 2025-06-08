import React from 'react';
import { TranslatedText } from '@/components/TranslatedText';

interface LoadingStateProps {
  message?: string;
}

const LoadingState: React.FC<LoadingStateProps> = ({ message }) => {
  return (
    <div className="flex flex-col items-center justify-center h-full p-8 text-center">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500 mb-4"></div>
      <p className="text-dark-300">
        <TranslatedText text={message || 'Loading...'} />
      </p>
    </div>
  );
};

export default LoadingState; 