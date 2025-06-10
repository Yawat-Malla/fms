'use client';

import { useState, useEffect } from 'react';
import Card from '@/components/ui/Card';
import { motion, AnimatePresence } from 'framer-motion';
import { useSession } from 'next-auth/react';
import DriveTable, { getFileOrFolderIcon } from '@/components/DriveTable';
import FileActions from '@/components/FileActions';
import { TranslatedText } from '@/components/TranslatedText';
import { useApp } from '@/contexts/AppContext';

interface File {
  id: number;
  name: string;
  path: string;
  type: string;
  size: number;
  status: 'online' | 'offline';
  description?: string;
  uploadedAt: Date;
  lastModifiedAt: Date;
  uploadedBy?: number;
  user?: {
    name: string;
  };
  fiscalYearId?: number;
  fiscalYear?: {
    name: string;
  };
  sourceId?: number;
  source?: {
    name: string;
  };
  grantTypeId?: number;
  grantType?: {
    name: string;
  };
  folderId?: number;
  folder?: Folder;
  localHash: string;
  isDeleted: boolean;
  deletedAt?: Date;
  deleteAfter?: Date;
}

interface Folder {
  id: number;
  name: string;
  path: string;
  parentId?: number;
  parent?: Folder;
  subfolders: Folder[];
  files: File[];
  createdAt: Date;
  lastModifiedAt: Date;
  createdBy?: number;
  user?: {
    name: string;
  };
  isDeleted: boolean;
  deletedAt?: Date;
  deleteAfter?: Date;
  grantTypeId?: number;
  grantType?: {
    name: string;
  };
  fiscalYearId?: number;
  fiscalYear?: {
    name: string;
  };
  sourceId?: number;
  source?: {
    name: string;
  };
}

const Dashboard = () => {
  const { data: session } = useSession();
  const { language, mounted } = useApp();
  const [loading, setLoading] = useState(true);
  const [statsLoading, setStatsLoading] = useState(true);
  const [prevFolders, setPrevFolders] = useState<Folder[]>([]);
  const [prevFiles, setPrevFiles] = useState<File[]>([]);
  const [stats, setStats] = useState({
    totalFiles: 0,
    availableFiles: 0,
    deletedFiles: 0,
  });
  const [currentPath, setCurrentPath] = useState<string[]>([]);
  const [folders, setFolders] = useState<Folder[]>([]);
  const [currentFolder, setCurrentFolder] = useState<Folder | null>(null);
  const [history, setHistory] = useState<string[][]>([]);
  const [historyIndex, setHistoryIndex] = useState(0);
  const [view, setView] = useState<'grid' | 'list'>('list');
  const [renamingGridItem, setRenamingGridItem] = useState<{ id: number; name: string; isFolder: boolean } | null>(null);

  // Separate useEffect for stats - runs only once
  useEffect(() => {
    const fetchStats = async () => {
      try {
        setStatsLoading(true);
        const res = await fetch('/api/files/stats');
        const data = await res.json();
        setStats({
          totalFiles: data.totalFiles,
          availableFiles: data.availableFiles,
          deletedFiles: data.deletedFiles,
        });
        setStatsLoading(false);
      } catch (error) {
        console.error('Error fetching stats:', error);
        setStatsLoading(false);
      }
    };
    fetchStats();
  }, []);

  // Helper to fetch folder by path from backend
  const fetchFolderByPath = async (pathArr: string[]) => {
    if (pathArr.length === 0) return null;
    const res = await fetch(`/api/folders/by-path?path=${encodeURIComponent(pathArr.join('/'))}`);
    if (!res.ok) return null;
    return await res.json();
  };

  const fetchAndSetFolders = async (parentId: string | null) => {
    try {
      setLoading(true);
      // Fetch subfolders of the parent
      const foldersResponse = await fetch(`/api/folders?${parentId ? `parentId=${parentId}` : ''}`);
      const foldersData = await foldersResponse.json();
      setFolders(foldersData);

      // Fetch current folder data with its files
      if (parentId) {
        const currentFolderResponse = await fetch(`/api/folders/${parentId}`);
        const folderData = await currentFolderResponse.json();
        setCurrentFolder(folderData);
        // Store the files from the current folder
        setPrevFiles(folderData.files || []);
      } else {
        // At root level, get all files that don't belong to any folder
        const filesResponse = await fetch('/api/files');
        const filesData = await filesResponse.json();
        setCurrentFolder(null);
        setPrevFiles(filesData.files || []);
      }
    } catch (error) {
      console.error('Error fetching folders and files:', error);
    } finally {
      setLoading(false);
    }
  };

  // Folder navigation effect
  useEffect(() => {
    setLoading(true);
    if (currentPath.length === 0) {
      fetchAndSetFolders(null);
    } else {
      fetchFolderByPath(currentPath).then(folder => {
        if (folder) {
          fetchAndSetFolders(folder.id.toString());
        } else {
          setCurrentFolder(null);
          setFolders([]);
          setLoading(false);
        }
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPath]);

  // Refresh handler
  const handleRefresh = async () => {
    setLoading(true);
    if (currentPath.length === 0) {
      await fetchAndSetFolders(null);
    } else {
      const folder = await fetchFolderByPath(currentPath);
      if (folder) {
        await fetchAndSetFolders(folder.id.toString());
      } else {
        setCurrentFolder(null);
        setFolders([]);
      setLoading(false);
      }
    }
  };

  // Listen for refresh-folders event (from bin restore)
  useEffect(() => {
    const refreshListener = () => {
      handleRefresh();
    };
    window.addEventListener('refresh-folders', refreshListener);
    return () => window.removeEventListener('refresh-folders', refreshListener);
  }, []);

  // Helper to get current folder by path
  const getCurrentFolder = (foldersList: Folder[], pathArr: string[]) => {
    if (pathArr.length === 0) return null;
    let current = null;
    let list = foldersList;
    for (const name of pathArr) {
      current = list.find(f => f.name === name);
      if (!current) return null;
      list = current.subfolders || [];
    }
    return current;
  };

  const currentFolderObj = getCurrentFolder(folders, currentPath);
  const foldersToShow = currentFolderObj ? currentFolderObj.subfolders || [] : folders;
  const filesToShow = currentFolder ? currentFolder.files || [] : [];

  // Use previous content while loading
  const displayFolders = loading ? prevFolders : foldersToShow;
  const displayFiles = loading ? prevFiles : filesToShow;

  // Breadcrumbs
  const breadcrumbs = [
    { name: 'Root', path: [] },
    ...currentPath.map((name, idx) => ({
      name,
      path: currentPath.slice(0, idx + 1),
    })),
  ];

  // History navigation
  const goBack = () => {
    if (historyIndex > 0) {
      setHistoryIndex(historyIndex - 1);
      setCurrentPath(history[historyIndex - 1]);
    }
  };
  const goForward = () => {
    if (historyIndex < history.length - 1) {
      setHistoryIndex(historyIndex + 1);
      setCurrentPath(history[historyIndex + 1]);
    }
  };
  const handleFolderClick = (folder: Folder) => {
    const newPath = [...currentPath, folder.name];
    setCurrentPath(newPath);
    setHistory([...history.slice(0, historyIndex + 1), newPath]);
    setHistoryIndex(historyIndex + 1);
    // Store current files before navigation
    setPrevFiles(filesToShow);
  };
  const handleBreadcrumbClick = (path: string[]) => {
    setCurrentPath(path);
    setHistory([...history.slice(0, historyIndex + 1), path]);
    setHistoryIndex(historyIndex + 1);
    // Store current files before navigation
    setPrevFiles(filesToShow);
  };

  // Add handlers for grid view rename
  const handleGridRename = (item: File | Folder, isFolder: boolean) => {
    setRenamingGridItem({ id: item.id, name: item.name, isFolder });
  };
  const handleGridRenameSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!renamingGridItem) return;
    const formData = new FormData(e.currentTarget);
    const newName = formData.get('name');
    try {
      const response = await fetch(`/api/${renamingGridItem.isFolder ? 'folders' : 'files'}/${renamingGridItem.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newName }),
      });
      if (!response.ok) throw new Error('Failed to rename');
      setRenamingGridItem(null);
      handleRefresh();
    } catch {
      // Optionally show error
    }
  };
  const handleGridRenameCancel = () => setRenamingGridItem(null);

  // Add a useEffect to re-render on language change
  useEffect(() => {}, [language, mounted]);

  return (
    <div className="p-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-6">
        <Card interactive>
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-dark-300">
                <TranslatedText text="dashboard.stats.totalFiles" />
              </p>
              {statsLoading ? (
                <div className="h-8 w-24 bg-dark-600 animate-pulse rounded mt-1"></div>
              ) : (
                <p className="text-2xl font-bold text-dark-100">{stats.totalFiles}</p>
              )}
            </div>
            <div className="bg-primary-500/10 p-2 rounded-md">
              <svg className="w-6 h-6 text-primary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
          </div>
        </Card>
        <Card interactive>
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-dark-300">
                <TranslatedText text="dashboard.stats.availableFiles" />
              </p>
              {statsLoading ? (
                <div className="h-8 w-24 bg-dark-600 animate-pulse rounded mt-1"></div>
              ) : (
                <p className="text-2xl font-bold text-green-400">{stats.availableFiles}</p>
              )}
            </div>
            <div className="bg-green-500/10 p-2 rounded-md">
              <svg className="w-6 h-6 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
              </svg>
            </div>
          </div>
        </Card>
        <Card interactive>
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-dark-300">
                <TranslatedText text="dashboard.stats.deletedFiles" />
              </p>
              {statsLoading ? (
                <div className="h-8 w-24 bg-dark-600 animate-pulse rounded mt-1"></div>
              ) : (
                <p className="text-2xl font-bold text-red-400">{stats.deletedFiles}</p>
              )}
            </div>
            <div className="bg-red-500/10 p-2 rounded-md">
              <svg className="w-6 h-6 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
          </div>
        </Card>
      </div>
      {/* Breadcrumbs and Navigation */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <button onClick={goBack} disabled={historyIndex === 0} className="p-2 rounded text-dark-300 hover:text-dark-100 disabled:opacity-50">&#8592;</button>
          <button onClick={goForward} disabled={historyIndex === history.length - 1} className="p-2 rounded text-dark-300 hover:text-dark-100 disabled:opacity-50">&#8594;</button>
          <nav className="flex items-center space-x-1">
            {breadcrumbs.map((crumb, idx) => (
              <span key={idx} className="flex items-center">
                {idx > 0 && <span className="mx-1 text-dark-400">/</span>}
                <button onClick={() => handleBreadcrumbClick(crumb.path)} className="text-dark-300 hover:text-dark-100 text-sm font-medium">
                  <TranslatedText text={crumb.name} />
                </button>
              </span>
            ))}
          </nav>
        </div>
        {/* Grid/List Toggle */}
        <div className="flex items-center space-x-2">
          <button onClick={() => setView('list')} className={`p-2 rounded-md transition-colors ${view === 'list' ? 'bg-dark-600 text-dark-100' : 'text-dark-300 hover:text-dark-100'}`}>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <button onClick={() => setView('grid')} className={`p-2 rounded-md transition-colors ${view === 'grid' ? 'bg-dark-600 text-dark-100' : 'text-dark-300 hover:text-dark-100'}`}>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
            </svg>
          </button>
        </div>
      </div>
      {/* File/Folder Table or Grid with loading overlay */}
      <div className="relative">
        {loading && (
          <div className="absolute inset-0 bg-dark-800/50 backdrop-blur-sm z-10 flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
          </div>
        )}
        {view === 'list' ? (
          <DriveTable
            folders={displayFolders}
            files={displayFiles}
            onFolderClick={handleFolderClick}
            onFileClick={file => {/* handle file click */}}
            onRefresh={handleRefresh}
            currentFolder={currentFolder}
          />
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 p-4">
            {displayFolders.map(folder => (
              <div key={folder.id} className="flex flex-col items-center group relative">
                {/* Three-dot menu top right */}
                <div className="absolute top-2 right-2 z-20">
                  <FileActions
                    item={folder}
                    isFolder
                    onOpen={() => handleFolderClick(folder)}
                    onRename={() => handleGridRename(folder, true)}
                    onDelete={handleRefresh}
                  />
                </div>
                {renamingGridItem?.id === folder.id ? (
                  <form onSubmit={handleGridRenameSubmit} className="flex flex-col items-center w-full">
                    <input
                      type="text"
                      name="name"
                      defaultValue={folder.name}
                      className="bg-dark-600 text-dark-100 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-primary-500 text-center"
                      autoFocus
                    />
                    <div className="flex space-x-2 mt-2">
                      <button type="submit" className="text-green-400 hover:text-green-300">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                        </svg>
                      </button>
                      <button type="button" onClick={handleGridRenameCancel} className="text-red-400 hover:text-red-300">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  </form>
                ) : (
                  <>
                    <button
                      onClick={() => handleFolderClick(folder)}
                      className="p-4 rounded-full hover:bg-dark-600 transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 focus:ring-offset-dark-800"
                    >
                      <svg className="w-16 h-16 text-yellow-400 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                      </svg>
                    </button>
                    <span className="mt-2 font-medium text-dark-100 truncate w-full text-center group-hover:text-primary-400 transition-colors">
                      <TranslatedText text={folder.name} />
                    </span>
                  </>
                )}
              </div>
            ))}
            {displayFiles.map(file => (
              <div key={file.id} className="flex flex-col items-center group relative">
                {/* Three-dot menu top right */}
                <div className="absolute top-2 right-2 z-20">
                  <FileActions
                    item={file}
                    onOpen={() => {/* handle file click */}}
                    onRename={() => handleGridRename(file, false)}
                    onDelete={handleRefresh}
                  />
                </div>
                {renamingGridItem?.id === file.id ? (
                  <form onSubmit={handleGridRenameSubmit} className="flex flex-col items-center w-full">
                    <input
                      type="text"
                      name="name"
                      defaultValue={file.name}
                      className="bg-dark-600 text-dark-100 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-primary-500 text-center"
                      autoFocus
                    />
                    <div className="flex space-x-2 mt-2">
                      <button type="submit" className="text-green-400 hover:text-green-300">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                        </svg>
                      </button>
                      <button type="button" onClick={handleGridRenameCancel} className="text-red-400 hover:text-red-300">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  </form>
                ) : (
                  <>
                    <button
                      onClick={() => {/* handle file click */}}
                      className="p-4 rounded-full hover:bg-dark-600 transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 focus:ring-offset-dark-800"
                    >
                      <div className="w-16 h-16 group-hover:scale-110 transition-transform">
                        {getFileOrFolderIcon(file, false, 'w-16 h-16')}
                      </div>
                    </button>
                    <span className="mt-2 font-medium text-dark-100 truncate w-full text-center group-hover:text-primary-400 transition-colors">
                      <TranslatedText text={file.name} />
                    </span>
                  </>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard; 