import React, { useState, useRef } from 'react';
import { format } from 'date-fns';
import { toast } from 'react-hot-toast';
import FileActions from './FileActions';
import { useRouter } from 'next/navigation';
import { TranslatedText } from '@/components/TranslatedText';
import { useTranslation } from 'react-i18next';

interface DriveTableProps {
  folders: any[];
  files: any[];
  onFolderClick: (folder: any) => void;
  onFileClick: (file: any) => void;
  onRefresh?: () => void;
  currentFolder?: any;
}

export const getFileOrFolderIcon = (item: any, isFolder = false, iconClasses = 'w-5 h-5 mr-2 flex-shrink-0') => {
  if (isFolder) {
    return (
      <svg className={iconClasses + ' text-yellow-400'} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
      </svg>
    );
  }
  const type = (item.type || '').toLowerCase();
  if (["pdf", "application/pdf"].includes(type)) {
    return <svg className={iconClasses + " text-red-400"} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>;
  }
  if (["doc", "docx", "application/msword", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"].includes(type)) {
    return <svg className={iconClasses + " text-blue-400"} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>;
  }
  if (["xls", "xlsx", "csv", "application/vnd.ms-excel", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", "text/csv"].includes(type)) {
    return <svg className={iconClasses + " text-emerald-400"} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>;
  }
  if (["jpg", "jpeg", "png", "gif", "webp", "image/jpeg", "image/png", "image/gif", "image/webp"].includes(type)) {
    return <svg className={iconClasses + " text-purple-400"} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>;
  }
  if (["mp4", "mov", "avi", "mkv", "video/mp4", "video/quicktime", "video/x-msvideo", "video/x-matroska"].includes(type)) {
    return <svg className={iconClasses + " text-pink-400"} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>;
  }
  if (["mp3", "wav", "ogg", "audio/mpeg", "audio/wav", "audio/ogg"].includes(type)) {
    return <svg className={iconClasses + " text-yellow-400"} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" /></svg>;
  }
  if (["zip", "rar", "7z", "application/zip", "application/x-rar-compressed", "application/x-7z-compressed"].includes(type)) {
    return <svg className={iconClasses + " text-amber-400"} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" /></svg>;
  }
  if (["ppt", "pptx", "application/vnd.ms-powerpoint", "application/vnd.openxmlformats-officedocument.presentationml.presentation"].includes(type)) {
    return <svg className={iconClasses + " text-orange-400"} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v8m-4-4h8" /></svg>;
  }
  return <svg className={iconClasses + " text-gray-400"} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>;
};

const DriveTable = ({ folders, files, onFolderClick, onFileClick, onRefresh, currentFolder }: DriveTableProps) => {
  const [renamingItem, setRenamingItem] = useState<{ id: number; name: string; isFolder: boolean } | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const { t, i18n } = useTranslation();

  // Helper function to format source name for translation
  const formatSourceName = (sourceName: string | undefined) => {
    if (!sourceName) return '-';
    // Convert to lowercase and replace spaces with underscores
    const formatted = sourceName.toLowerCase().replace(/\s+/g, '_');
    console.log('Formatted source name:', { original: sourceName, formatted });
    return formatted;
  };

  // Helper function to format grant type name for translation
  const formatGrantTypeName = (grantTypeName: string | undefined) => {
    if (!grantTypeName) return '-';
    // Convert to lowercase and replace spaces with underscores
    const formatted = grantTypeName.toLowerCase().replace(/\s+/g, '_');
    console.log('Formatted grant type name:', { original: grantTypeName, formatted });
    return formatted;
  };

  // Utility to convert English numbers to Nepali
  const toNepaliNumber = (input: string | number) => {
    if (typeof input !== 'string') input = String(input);
    const nepaliDigits = ['०','१','२','३','४','५','६','७','८','९'];
    return input.replace(/[0-9]/g, d => nepaliDigits[d as any]);
  };

  // Helper function to format date based on current language
  const formatDate = (date: Date) => {
    let formattedDate = format(date, 'MMM d, yyyy');
    if (i18n.language === 'ne') {
      formattedDate = formattedDate
        .replace('Jan', 'जनवरी')
        .replace('Feb', 'फेब्रुअरी')
        .replace('Mar', 'मार्च')
        .replace('Apr', 'अप्रिल')
        .replace('May', 'मे')
        .replace('Jun', 'जुन')
        .replace('Jul', 'जुलाई')
        .replace('Aug', 'अगस्ट')
        .replace('Sep', 'सेप्टेम्बर')
        .replace('Oct', 'अक्टोबर')
        .replace('Nov', 'नोभेम्बर')
        .replace('Dec', 'डिसेम्बर');
      formattedDate = toNepaliNumber(formattedDate);
    }
    return formattedDate;
  };

  // Helper function to get translated source name
  const getTranslatedSource = (sourceName: string | undefined) => {
    if (!sourceName) return '-';
    const key = formatSourceName(sourceName);
    const translationKey = `reports.sources.${key}`;
    const translation = t(translationKey);
    console.log('Source translation:', {
      original: sourceName,
      key,
      translationKey,
      currentLanguage: i18n.language,
      translation,
      fallback: translation === translationKey ? sourceName : translation
    });
    return translation === translationKey ? sourceName : translation;
  };

  // Helper function to get translated grant type
  const getTranslatedGrantType = (grantTypeName: string | undefined) => {
    if (!grantTypeName) return '-';
    const key = formatGrantTypeName(grantTypeName);
    const translationKey = `reports.grantTypes.${key}`;
    const translation = t(translationKey);
    console.log('Grant type translation:', {
      original: grantTypeName,
      key,
      translationKey,
      currentLanguage: i18n.language,
      translation,
      fallback: translation === translationKey ? grantTypeName : translation
    });
    return translation === translationKey ? grantTypeName : translation;
  };

  // Helper function to format user name for Nepali (if it contains numbers)
  const formatUserName = (name: string | undefined) => {
    if (!name) return '-';
    return i18n.language === 'ne' ? toNepaliNumber(name) : name;
  };

  // Helper function to format last modified date
  const formatLastModified = (date: Date | string | undefined) => {
    if (!date) return '-';
    return formatDate(new Date(date));
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    console.log('File input event triggered:', {
      files: files ? Array.from(files).map(f => ({
        name: f.name,
        type: f.type,
        size: f.size
      })) : 'No files'
    });

    if (!files || files.length === 0) {
      console.log('No files selected in input');
      return;
    }

    if (!currentFolder?.id) {
      toast.error('Please select a folder to upload files');
      return;
    }

    setIsUploading(true);
    const formData = new FormData();
    
    // Log file details for debugging
    console.log('Files to upload:', Array.from(files).map(f => ({
      name: f.name,
      type: f.type,
      size: f.size
    })));
    
    // Add all selected files to formData with the correct key name 'files'
    Array.from(files).forEach((file, index) => {
      console.log(`Appending file ${index + 1} to FormData:`, {
        name: file.name,
        type: file.type,
        size: file.size
      });
      formData.append('files', file);
    });

    // Verify FormData contents
    console.log('FormData entries:', Array.from(formData.entries()).map(([key, value]) => ({
      key,
      value: value instanceof File ? {
        name: value.name,
        type: value.type,
        size: value.size
      } : value
    })));

    try {
      console.log('Starting file upload request...');
      const response = await fetch(`/api/folders/${currentFolder.id}/files`, {
        method: 'POST',
        body: formData,
      });

      console.log('Upload response received:', {
        status: response.status,
        statusText: response.statusText,
        headers: Object.fromEntries(response.headers.entries())
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        console.error('Upload failed with status:', response.status);
        console.error('Error details:', errorData);
        throw new Error(errorData?.message || `Upload failed with status ${response.status}`);
      }

      const result = await response.json();
      console.log('Upload successful:', result);
      toast.success(`Successfully uploaded ${files.length} file(s)`);
      onRefresh?.();
    } catch (error) {
      console.error('Upload error details:', {
        error: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined
      });
      toast.error(error instanceof Error ? error.message : 'Failed to upload files');
    } finally {
      setIsUploading(false);
      // Reset the file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleRename = (item: any, isFolder: boolean) => {
    setRenamingItem({ id: item.id, name: item.name, isFolder });
  };

  const handleRenameSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!renamingItem) return;
    const formData = new FormData(e.currentTarget as HTMLFormElement);
    const newName = formData.get('name');
    try {
      const response = await fetch(`/api/${renamingItem.isFolder ? 'folders' : 'files'}/${renamingItem.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newName }),
      });
      if (!response.ok) throw new Error('Failed to rename');
      setRenamingItem(null);
      onRefresh?.();
    } catch {
      // Optionally show error
    }
  };

  const handleRenameCancel = () => setRenamingItem(null);

  return (
    <div className="bg-dark-800 rounded-lg shadow-lg">
      <div className="overflow-x-auto">
        <table className="w-full table-fixed divide-y divide-dark-700">
          <thead className="bg-dark-700">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-dark-300 uppercase tracking-wider w-[30%]">
                <TranslatedText text="files.table.name" />
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-dark-300 uppercase tracking-wider w-[15%]">
                <TranslatedText text="files.table.fiscalYear" />
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-dark-300 uppercase tracking-wider w-[15%]">
                <TranslatedText text="files.table.source" />
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-dark-300 uppercase tracking-wider w-[15%]">
                <TranslatedText text="files.table.grantType" />
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-dark-300 uppercase tracking-wider w-[15%]">
                <TranslatedText text="files.table.created" />
              </th>
              <th scope="col" className="relative px-6 py-3 w-[10%]">
                <span className="sr-only"><TranslatedText text="files.table.actions" /></span>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-dark-700">
            {/* Add Files Button - Only show when there's a parent folder */}
            {currentFolder?.parentId && (
              <tr>
                <td colSpan={6} className="px-6 py-4">
                  <div className="relative">
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleFileUpload}
                      multiple
                      className="hidden"
                      accept="*/*"
                    />
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      disabled={isUploading}
                      className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-primary-500/10 text-primary-500 rounded-lg hover:bg-primary-500/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isUploading ? (
                        <>
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary-500"></div>
                          <span><TranslatedText text="files.upload.messages.uploading" /></span>
                        </>
                      ) : (
                        <>
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                          </svg>
                          <span><TranslatedText text="files.upload.buttons.upload" /></span>
                        </>
                      )}
                    </button>
                  </div>
                </td>
              </tr>
            )}
            {folders.map((folder) => (
              <tr key={folder.id} className="hover:bg-dark-700 static overflow-visible">
                <td className="px-6 py-4 whitespace-nowrap">
                  {renamingItem?.id === folder.id ? (
                    <form onSubmit={handleRenameSubmit} className="flex items-center space-x-2">
                      <input
                        type="text"
                        name="name"
                        defaultValue={folder.name}
                        className="bg-dark-600 text-dark-100 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-primary-500 w-full"
                        autoFocus
                      />
                      <div className="flex space-x-1 flex-shrink-0">
                        <button type="submit" className="text-green-400 hover:text-green-300">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                          </svg>
                        </button>
                        <button type="button" onClick={handleRenameCancel} className="text-red-400 hover:text-red-300">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    </form>
                  ) : (
                    <button
                      onClick={() => onFolderClick(folder)}
                      className="flex items-center text-dark-100 hover:text-primary-500 transition-colors"
                    >
                      {getFileOrFolderIcon(folder, true)}
                      <span className="truncate">{folder.name}</span>
                    </button>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-dark-100">
                  {i18n.language === 'ne' ? toNepaliNumber(folder.fiscalYear?.name ?? '') : folder.fiscalYear?.name}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-dark-100">
                  {getTranslatedSource(folder.source?.name)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-dark-100">
                  {getTranslatedGrantType(folder.grantType?.name)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-dark-100">
                  {formatDate(new Date(folder.createdAt))}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <FileActions
                    item={folder}
                    isFolder={true}
                    onRename={() => handleRename(folder, true)}
                    onRefresh={onRefresh}
                  />
                </td>
              </tr>
            ))}
            {files.map((file) => (
              <tr key={file.id} className="hover:bg-dark-700 static overflow-visible">
                <td className="px-6 py-4 whitespace-nowrap">
                  {renamingItem?.id === file.id ? (
                    <form onSubmit={handleRenameSubmit} className="flex items-center space-x-2">
                      <input
                        type="text"
                        name="name"
                        defaultValue={file.name}
                        className="bg-dark-600 text-dark-100 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-primary-500 w-full"
                        autoFocus
                      />
                      <div className="flex space-x-1 flex-shrink-0">
                        <button type="submit" className="text-green-400 hover:text-green-300">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                          </svg>
                        </button>
                        <button type="button" onClick={handleRenameCancel} className="text-red-400 hover:text-red-300">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    </form>
                  ) : (
                    <button
                      onClick={() => onFileClick(file)}
                      className="flex items-center text-dark-100 hover:text-primary-500 transition-colors"
                    >
                      {getFileOrFolderIcon(file)}
                      <span className="truncate">{file.name}</span>
                    </button>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-dark-100">
                  {i18n.language === 'ne' ? toNepaliNumber(file.fiscalYear?.name ?? '') : file.fiscalYear?.name}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-dark-100">
                  {getTranslatedSource(file.source?.name)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-dark-100">
                  {getTranslatedGrantType(file.grantType?.name)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-dark-100">
                  {formatDate(new Date(file.uploadedAt))}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-dark-100">
                  {formatUserName(file.user?.name)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-dark-100">
                  {formatLastModified(file.lastModifiedAt)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <FileActions
                    item={file}
                    isFolder={false}
                    onRename={() => handleRename(file, false)}
                    onRefresh={onRefresh}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default DriveTable; 