import React from 'react';
import { TranslatedText } from '@/components/TranslatedText';

interface FileTypeProps {
  type: string;
}

const FileType: React.FC<FileTypeProps> = ({ type }) => {
  const getFileTypeLabel = (type: string) => {
    switch (type.toLowerCase()) {
      case 'image':
        return 'Image';
      case 'video':
        return 'Video';
      case 'audio':
        return 'Audio';
      case 'document':
        return 'Document';
      case 'spreadsheet':
        return 'Spreadsheet';
      case 'presentation':
        return 'Presentation';
      case 'archive':
        return 'Archive';
      case 'code':
        return 'Code';
      case 'pdf':
        return 'PDF';
      default:
        return 'File';
    }
  };

  return <TranslatedText text={getFileTypeLabel(type)} />;
};

export default FileType; 