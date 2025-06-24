'use client';

import { useState, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiUpload, FiX, FiFile, FiAlertCircle } from 'react-icons/fi';
import { useTranslation } from 'react-i18next';

interface FileUploaderProps {
  onFilesSelected: (files: File[]) => void;
  maxFiles?: number;
  maxSizeMB?: number;
  acceptedFileTypes?: string[];
  disabled?: boolean;
}

const FileUploader = ({
  onFilesSelected,
  maxFiles = 10,
  maxSizeMB = 70,
  acceptedFileTypes = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'image/jpeg', 'image/png'],
  disabled = false,
}: FileUploaderProps) => {
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { t } = useTranslation();

  const validateFiles = useCallback((files: File[]) => {
    if (files.length > maxFiles) {
      setError(`You can only upload up to ${maxFiles} files at once.`);
      return false;
    }

    const maxSizeBytes = maxSizeMB * 1024 * 1024;
    const invalidFiles = files.filter(file => file.size > maxSizeBytes);
    if (invalidFiles.length > 0) {
      setError(`Some files exceed the maximum size of ${maxSizeMB}MB.`);
      return false;
    }

    const invalidTypes = files.filter(file => !acceptedFileTypes.includes(file.type));
    if (invalidTypes.length > 0) {
      setError(`Some files have unsupported file types. Accepted types: ${acceptedFileTypes.join(', ')}`);
      return false;
    }

    setError(null);
    return true;
  }, [maxFiles, maxSizeMB, acceptedFileTypes]);

  const handleFiles = useCallback((files: FileList | File[]) => {
    const fileArray = Array.from(files);
    if (validateFiles(fileArray)) {
      setSelectedFiles(fileArray);
      onFilesSelected(fileArray);
    }
  }, [validateFiles, onFilesSelected]);

  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!disabled) {
      setIsDragging(true);
    }
  }, [disabled]);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (!disabled) {
      handleFiles(e.dataTransfer.files);
    }
  }, [handleFiles, disabled]);

  const handleFileInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      handleFiles(e.target.files);
    }
  }, [handleFiles]);

  const handleRemoveFile = useCallback((index: number) => {
    const newFiles = selectedFiles.filter((_, i) => i !== index);
    setSelectedFiles(newFiles);
    onFilesSelected(newFiles);
  }, [selectedFiles, onFilesSelected]);

  const handleButtonClick = useCallback(() => {
    if (fileInputRef.current && !disabled) {
      fileInputRef.current.click();
    }
  }, [disabled]);

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: {
        duration: 0.3,
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: {
        duration: 0.2,
        ease: "easeOut"
      }
    }
  };

  return (
    <div className="space-y-4">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className={`relative rounded-lg border-2 border-dashed transition-colors duration-200 ${
          isDragging 
            ? 'border-primary-500 bg-primary-500/5' 
            : 'border-dark-600 hover:border-primary-500/50'
        } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        onClick={handleButtonClick}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept={acceptedFileTypes.join(',')}
          onChange={handleFileInputChange}
          className="hidden"
          disabled={disabled}
        />
        <div className="flex flex-col items-center justify-center py-8 px-4">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.3 }}
            className="mb-4"
          >
            <FiUpload className="h-12 w-12 text-primary-500" />
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-center"
          >
            <p className="text-lg font-medium text-dark-100">
              {t('files.upload.document.description')}
            </p>
            <p className="mt-1 text-sm text-dark-300">
              {t('files.upload.document.orClick')}
            </p>
            <p className="mt-2 text-xs text-dark-400">
              {t('files.upload.document.supportedFormats')}
              <br />
              {t('files.upload.document.maxSize')}
              <br />
              {t('files.upload.document.maxFiles', { count: maxFiles })}
            </p>
          </motion.div>
        </div>
      </motion.div>

      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="flex items-center p-3 rounded-md bg-red-500/10 border border-red-500/20"
          >
            <FiAlertCircle className="h-5 w-5 text-red-500 mr-2" />
            <p className="text-sm text-red-500">{error}</p>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {selectedFiles.length > 0 && (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="space-y-2"
          >
            <h3 className="text-sm font-medium text-dark-200">
              Selected Files ({selectedFiles.length})
            </h3>
            <div className="space-y-2">
              {selectedFiles.map((file, index) => (
                <motion.div
                  key={`${file.name}-${index}`}
                  variants={itemVariants}
                  layout
                  className="flex items-center justify-between p-3 rounded-md bg-dark-700 border border-dark-600 hover:border-primary-500/20 transition-colors duration-200"
                >
                  <div className="flex items-center space-x-3">
                    <FiFile className="h-5 w-5 text-primary-500" />
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-dark-100 truncate">
                        {file.name}
                      </p>
                      <p className="text-xs text-dark-400">
                        {(file.size / 1024 / 1024).toFixed(2)}MB
                      </p>
                    </div>
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemoveFile(index);
                    }}
                    className="p-1 rounded-full hover:bg-dark-600 transition-colors duration-200"
                    disabled={disabled}
                  >
                    <FiX className="h-4 w-4 text-dark-300 hover:text-red-500 transition-colors duration-200" />
                  </motion.button>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default FileUploader; 