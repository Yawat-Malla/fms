'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/Card';
import { motion, AnimatePresence } from 'framer-motion';
import { useSession } from 'next-auth/react';
import DriveTable, { getFileOrFolderIcon } from '@/components/DriveTable';
import FileActions from '@/components/FileActions';

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
    if (!Array.isArray(pathArr) || pathArr.length === 0) return null;
    const res = await fetch(`/api/folders/by-path?path=${encodeURIComponent(pathArr.join('/'))}`);
    if (!res.ok) return null;
    return await res.json();
  };

  const fetchAndSetFolders = async (parentId) => {
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
        const filesResponse = await fetch('/api/files?folderId=null');
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
          fetchAndSetFolders(folder.id);
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
        await fetchAndSetFolders(folder.id);
      } else {
        setCurrentFolder(null);
        setFolders([]);
      setLoading(false);
      }
    }
  };

  // Helper to get current folder by path
  const getCurrentFolder = (foldersList: Folder[], pathArr: string[]) => {
    if (!pathArr || pathArr.length === 0) return null;
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
    ...(Array.isArray(currentPath) ? currentPath.map((name, idx) => ({
      name,
      path: currentPath.slice(0, idx + 1),
    })) : []),
  ];

  // History navigation
  const goBack = () => {
    if (currentPath.length > 0) {
      const newPath = currentPath.slice(0, -1);
      setCurrentPath(newPath);
      setHistory([...history.slice(0, historyIndex + 1), newPath]);
      setHistoryIndex(historyIndex + 1);
      // Store current files before navigation
      setPrevFiles(filesToShow);
    }
  };

  const goForward = () => {
    if (historyIndex < history.length - 1) {
      const nextPath = history[historyIndex + 1];
      setCurrentPath(nextPath);
      setHistoryIndex(historyIndex + 1);
      // Store current files before navigation
      setPrevFiles(filesToShow);
    }
  };

  const handleFolderClick = (folder) => {
    const newPath = [...(Array.isArray(currentPath) ? currentPath : []), folder.name];
    setCurrentPath(newPath);
    setHistory([...history.slice(0, historyIndex + 1), newPath]);
    setHistoryIndex(historyIndex + 1);
    // Store current files before navigation
    setPrevFiles(filesToShow);
  };

  const handleBreadcrumbClick = (index) => {
    const newPath = currentPath.slice(0, index + 1);
    setCurrentPath(newPath);
    setHistory([...history.slice(0, historyIndex + 1), newPath]);
    setHistoryIndex(historyIndex + 1);
    // Store current files before navigation
    setPrevFiles(filesToShow);
  };

  // Add handlers for grid view rename
  const handleGridRename = (item, isFolder) => {
    setRenamingGridItem({ id: item.id, name: item.name, isFolder });
  };
  const handleGridRenameSubmit = async (e) => {
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

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark-900">
      <div className="container mx-auto px-4 py-8">
        {/* Stats Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card variant="elevated" className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-dark-300">Total Files</p>
                <p className="text-2xl font-semibold text-gray-900 dark:text-dark-100">{statsLoading ? '...' : stats.totalFiles}</p>
              </div>
              <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-full">
                <svg className="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
            </div>
          </Card>

          <Card variant="elevated" className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-dark-300">Available Files</p>
                <p className="text-2xl font-semibold text-gray-900 dark:text-dark-100">{statsLoading ? '...' : stats.availableFiles}</p>
              </div>
              <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-full">
                <svg className="w-6 h-6 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
              </div>
            </div>
          </Card>

          <Card variant="elevated" className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-dark-300">Deleted Files</p>
                <p className="text-2xl font-semibold text-gray-900 dark:text-dark-100">{statsLoading ? '...' : stats.deletedFiles}</p>
              </div>
              <div className="p-3 bg-red-50 dark:bg-red-900/20 rounded-full">
                <svg className="w-6 h-6 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </div>
            </div>
          </Card>
        </div>

        {/* Navigation and Actions */}
        <div className="mb-6">
          <Card variant="outlined" className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <button
                  onClick={goBack}
                  disabled={currentPath.length === 0}
                  className="p-2 text-gray-600 dark:text-dark-300 hover:text-gray-900 dark:hover:text-dark-100 disabled:opacity-50"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <button
                  onClick={goForward}
                  disabled={historyIndex === history.length - 1}
                  className="p-2 text-gray-600 dark:text-dark-300 hover:text-gray-900 dark:hover:text-dark-100 disabled:opacity-50"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                  </svg>
                </button>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handleBreadcrumbClick(-1)}
                    className="text-gray-600 dark:text-dark-300 hover:text-gray-900 dark:hover:text-dark-100"
                  >
                    Root
                  </button>
                  {Array.isArray(currentPath) && currentPath.map((folder, index) => (
                    <div key={index} className="flex items-center">
                      <svg className="w-4 h-4 mx-2 text-gray-400 dark:text-dark-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                      </svg>
                      <button
                        onClick={() => handleBreadcrumbClick(index)}
                        className="text-gray-600 dark:text-dark-300 hover:text-gray-900 dark:hover:text-dark-100"
                      >
                        {folder}
                      </button>
                    </div>
                  ))}
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => setView(view === 'grid' ? 'list' : 'grid')}
                  className="p-2 text-gray-600 dark:text-dark-300 hover:text-gray-900 dark:hover:text-dark-100"
                >
                  {view === 'grid' ? (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                    </svg>
                  )}
                </button>
                <button
                  onClick={handleRefresh}
                  className="p-2 text-gray-600 dark:text-dark-300 hover:text-gray-900 dark:hover:text-dark-100"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                </button>
              </div>
            </div>
          </Card>
        </div>

        {/* Content Area */}
        <Card variant="default" className="p-6">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 dark:border-dark-100"></div>
            </div>
          ) : (
            <div className={view === 'grid' ? 'grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6' : ''}>
              <AnimatePresence mode="wait">
                {folders.map((folder) => (
                  <motion.div
                    key={folder.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Card
                      variant="outlined"
                      className={`p-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-dark-700 transition-colors ${
                        view === 'grid' ? 'h-full' : ''
                      }`}
                      onClick={() => handleFolderClick(folder)}
                    >
                      <div className="flex items-center space-x-3">
                        <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                          <svg className="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                          </svg>
                        </div>
                        <div className="flex-1 min-w-0">
                          {renamingGridItem && renamingGridItem.id === folder.id && renamingGridItem.isFolder ? (
                            <form onSubmit={handleGridRenameSubmit} className="flex items-center space-x-2 w-full">
                              <input
                                type="text"
                                name="name"
                                defaultValue={folder.name}
                                className="w-full bg-gray-100 dark:bg-dark-700 text-gray-900 dark:text-dark-100 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-primary-500"
                                autoFocus
                              />
                              <button type="submit" className="text-green-500 hover:text-green-400">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                                </svg>
                              </button>
                              <button type="button" onClick={handleGridRenameCancel} className="text-red-500 hover:text-red-400">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                              </button>
                            </form>
                          ) : (
                            <>
                              <p className="text-sm font-medium text-gray-900 dark:text-dark-100 truncate">{folder.name}</p>
                              <p className="text-xs text-gray-500 dark:text-dark-400">
                                {folder.files?.length || 0} files
                              </p>
                            </>
                          )}
                        </div>
                        <div className="flex-shrink-0 relative" onClick={(e) => e.stopPropagation()}>
                          <FileActions
                            item={folder}
                            isFolder
                            onOpen={() => handleFolderClick(folder)}
                            onRename={() => handleGridRename(folder, true)}
                            onDelete={handleRefresh}
                          />
                        </div>
                      </div>
                    </Card>
                  </motion.div>
                ))}

                {prevFiles.map((file) => (
                  <motion.div
                    key={file.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Card
                      variant="outlined"
                      className={`p-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-dark-700 transition-colors ${
                        view === 'grid' ? 'h-full' : ''
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <div className="p-2 bg-gray-50 dark:bg-dark-700 rounded-lg">
                          {getFileOrFolderIcon(file.type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          {renamingGridItem && renamingGridItem.id === file.id && !renamingGridItem.isFolder ? (
                            <form onSubmit={handleGridRenameSubmit} className="flex items-center space-x-2 w-full">
                              <input
                                type="text"
                                name="name"
                                defaultValue={file.name}
                                className="w-full bg-gray-100 dark:bg-dark-700 text-gray-900 dark:text-dark-100 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-primary-500"
                                autoFocus
                              />
                              <button type="submit" className="text-green-500 hover:text-green-400">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                                </svg>
                              </button>
                              <button type="button" onClick={handleGridRenameCancel} className="text-red-500 hover:text-red-400">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                              </button>
                            </form>
                          ) : (
                            <>
                              <p className="text-sm font-medium text-gray-900 dark:text-dark-100 truncate">{file.name}</p>
                              <p className="text-xs text-gray-500 dark:text-dark-400">
                                {new Date(file.uploadedAt).toLocaleDateString()}
                              </p>
                            </>
                          )}
                        </div>
                        <div className="flex-shrink-0 relative">
                          <FileActions
                            item={file}
                            onOpen={() => onFileClick(file)}
                            onRename={() => handleGridRename(file, false)}
                            onDelete={handleRefresh}
                          />
                        </div>
                      </div>
                    </Card>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};

export default Dashboard; 