import React from 'react';
import { TranslatedText } from '@/components/TranslatedText';

interface FileSizeProps {
  bytes: number;
}

const FileSize: React.FC<FileSizeProps> = ({ bytes }) => {
  const units = ['B', 'KB', 'MB', 'GB', 'TB'];
  let size = bytes;
  let unitIndex = 0;

  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024;
    unitIndex++;
  }

  const unit = units[unitIndex];
  return (
    <span>
      {size.toFixed(1)} <TranslatedText text={unit} />
    </span>
  );
};

export default FileSize; 