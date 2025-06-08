import React, { useState } from 'react';
import { format } from 'date-fns';
import FileActions from './FileActions';
import { getFileOrFolderIcon } from './DriveTable';
import { TranslatedText } from '@/components/TranslatedText';

interface DriveGridProps {
  folders: any[];
  files: any[];
  onFolderClick: (folder: any) => void;
  onFileClick: (file: any) => void;
  onRefresh?: () => void;
}

const DriveGrid = ({ folders, files, onFolderClick, onFileClick, onRefresh }: DriveGridProps) => {
  const [renamingItem, setRenamingItem] = useState<{ id: number; name: string; isFolder: boolean } | null>(null);

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
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
      {folders.map((folder) => (
        <div
          key={folder.id}
          className="bg-dark-800 rounded-lg shadow-lg p-4 hover:bg-dark-700 transition-colors"
        >
          {renamingItem?.id === folder.id ? (
            <form onSubmit={handleRenameSubmit} className="space-y-2">
              <input
                type="text"
                name="name"
                defaultValue={folder.name}
                className="w-full bg-dark-600 text-dark-100 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-primary-500"
                autoFocus
              />
              <div className="flex justify-end space-x-2">
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
            <div className="space-y-2">
              <button
                onClick={() => onFolderClick(folder)}
                className="w-full flex flex-col items-center space-y-2 text-dark-100 hover:text-primary-400"
              >
                <div className="w-16 h-16 flex items-center justify-center">
                  <svg className="w-12 h-12 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                  </svg>
                </div>
                <span className="text-sm font-medium truncate w-full text-center">
                  <TranslatedText text={folder.name} />
                </span>
              </button>
              <div className="text-xs text-dark-300 space-y-1">
                <div>
                  <TranslatedText text="Fiscal Year" />: <TranslatedText text={folder.fiscalYear?.name || '-'} />
                </div>
                <div>
                  <TranslatedText text="Source" />: <TranslatedText text={folder.source?.name || '-'} />
                </div>
                <div>
                  <TranslatedText text="Grant Type" />: <TranslatedText text={folder.grantType?.name || '-'} />
                </div>
                <div>
                  <TranslatedText text="Created" />: {format(new Date(folder.createdAt), 'MMM d, yyyy')}
                </div>
              </div>
              <div className="flex justify-end">
                <FileActions
                  item={folder}
                  isFolder
                  onOpen={() => onFolderClick(folder)}
                  onRename={() => handleRename(folder, true)}
                  onDelete={onRefresh ?? (() => {})}
                />
              </div>
            </div>
          )}
        </div>
      ))}
      {files.map((file) => (
        <div
          key={file.id}
          className="bg-dark-800 rounded-lg shadow-lg p-4 hover:bg-dark-700 transition-colors"
        >
          {renamingItem?.id === file.id ? (
            <form onSubmit={handleRenameSubmit} className="space-y-2">
              <input
                type="text"
                name="name"
                defaultValue={file.name}
                className="w-full bg-dark-600 text-dark-100 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-primary-500"
                autoFocus
              />
              <div className="flex justify-end space-x-2">
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
            <div className="space-y-2">
              <button
                onClick={() => onFileClick(file)}
                className="w-full flex flex-col items-center space-y-2 text-dark-100 hover:text-primary-400"
              >
                <div className="w-16 h-16 flex items-center justify-center">
                  {getFileOrFolderIcon(file, false, 'w-12 h-12')}
                </div>
                <span className="text-sm font-medium truncate w-full text-center">
                  <TranslatedText text={file.name} />
                </span>
              </button>
              <div className="text-xs text-dark-300 space-y-1">
                <div>
                  <TranslatedText text="Fiscal Year" />: <TranslatedText text={file.fiscalYear?.name || '-'} />
                </div>
                <div>
                  <TranslatedText text="Source" />: <TranslatedText text={file.source?.name || '-'} />
                </div>
                <div>
                  <TranslatedText text="Grant Type" />: <TranslatedText text={file.grantType?.name || '-'} />
                </div>
                <div>
                  <TranslatedText text="Created" />: {format(new Date(file.uploadedAt), 'MMM d, yyyy')}
                </div>
              </div>
              <div className="flex justify-end">
                <FileActions
                  item={file}
                  onOpen={() => onFileClick(file)}
                  onRename={() => handleRename(file, false)}
                  onDelete={onRefresh ?? (() => {})}
                />
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default DriveGrid; 