'use client';

import { useState, useEffect } from 'react';
import Card from '@/components/ui/Card';
import { motion, AnimatePresence } from 'framer-motion';
import { useSession } from 'next-auth/react';
import DriveTable, { getFileOrFolderIcon } from '@/components/DriveTable';
import FileActions from '@/components/FileActions';
import { TranslatedText } from '@/components/TranslatedText';
import { useApp } from '@/contexts/AppContext';
import { useTranslation } from 'react-i18next';
import DashboardStats from '@/components/DashboardStats';

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

interface Stats {
  totalFiles: number;
  totalFolders: number;
  totalSize: number;
  recentFiles: Array<{
    id: string;
    name: string;
    size: number;
    updatedAt: string;
  }>;
}

const defaultStats: Stats = {
  totalFiles: 0,
  totalFolders: 0,
  totalSize: 0,
  recentFiles: []
};

const Dashboard = () => {
  const { data: session } = useSession();
  const { language, mounted } = useApp();
  const [loading, setLoading] = useState(true);
  const [statsLoading, setStatsLoading] = useState(true);
  const [prevFolders, setPrevFolders] = useState<Folder[]>([]);
  const [prevFiles, setPrevFiles] = useState<File[]>([]);
  const [stats, setStats] = useState<Stats>(defaultStats);
  const [currentPath, setCurrentPath] = useState<string[]>([]);
  const [folders, setFolders] = useState<Folder[]>([]);
  const [currentFolder, setCurrentFolder] = useState<Folder | null>(null);
  const [history, setHistory] = useState<string[][]>([]);
  const [historyIndex, setHistoryIndex] = useState(0);
  const [view, setView] = useState<'grid' | 'list'>('list');
  const [renamingGridItem, setRenamingGridItem] = useState<{ id: number; name: string; isFolder: boolean } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { i18n } = useTranslation();

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await fetch('/api/stats');
        if (!response.ok) {
          throw new Error('Failed to fetch stats');
        }
        const data = await response.json();
        // Ensure all required fields are present
        setStats({
          totalFiles: data.totalFiles ?? 0,
          totalFolders: data.totalFolders ?? 0,
          totalSize: data.totalSize ?? 0,
          recentFiles: Array.isArray(data.recentFiles) ? data.recentFiles : []
        });
      } catch (error) {
        console.error('Error fetching stats:', error);
        setError(error instanceof Error ? error.message : 'Failed to fetch stats');
        // Reset to default stats on error
        setStats(defaultStats);
      } finally {
        setLoading(false);
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

  // Utility to convert English numbers to Nepali
  const toNepaliNumber = (input: string | number) => {
    if (typeof input !== 'string') input = String(input);
    const nepaliDigits = ['०','१','२','३','४','५','६','७','८','९'];
    return input.replace(/[0-9]/g, d => nepaliDigits[d as any]);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  if (error) {
    return (
      <div className="p-6">
        <Card className="p-6">
          <div className="text-center text-red-500">
            <p>Error: {error}</p>
            <button 
              onClick={() => window.location.reload()} 
              className="mt-4 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
            >
              Retry
            </button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-dark-400">
                <TranslatedText text="dashboard.stats.totalFiles" />
              </p>
              <h3 className="text-2xl font-bold text-dark-100 mt-1">
                {loading ? '...' : stats.totalFiles}
              </h3>
            </div>
            <div className="p-3 bg-blue-500/10 rounded-lg">
              <svg className="w-6 h-6 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-dark-400">
                <TranslatedText text="dashboard.stats.totalFolders" />
              </p>
              <h3 className="text-2xl font-bold text-dark-100 mt-1">
                {loading ? '...' : stats.totalFolders}
              </h3>
            </div>
            <div className="p-3 bg-green-500/10 rounded-lg">
              <svg className="w-6 h-6 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
              </svg>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-dark-400">
                <TranslatedText text="dashboard.stats.totalSize" />
              </p>
              <h3 className="text-2xl font-bold text-dark-100 mt-1">
                {loading ? '...' : formatFileSize(stats.totalSize)}
              </h3>
            </div>
            <div className="p-3 bg-purple-500/10 rounded-lg">
              <svg className="w-6 h-6 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" />
              </svg>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-dark-400">
                <TranslatedText text="dashboard.stats.recentUploads" />
              </p>
              <h3 className="text-2xl font-bold text-dark-100 mt-1">
                {loading ? '...' : stats.recentFiles.length}
              </h3>
            </div>
            <div className="p-3 bg-yellow-500/10 rounded-lg">
              <svg className="w-6 h-6 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </Card>
      </div>

      {/* Charts */}
      <DashboardStats />

      {/* Recent Files */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-dark-100 mb-4">
          <TranslatedText text="dashboard.stats.recentUploads" />
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left text-sm text-dark-400 border-b border-dark-700">
                <th className="pb-3 font-medium">
                  <TranslatedText text="files.table.name" />
                </th>
                <th className="pb-3 font-medium">
                  <TranslatedText text="files.table.size" />
                </th>
                <th className="pb-3 font-medium">
                  <TranslatedText text="files.table.lastModified" />
                </th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={3} className="py-4 text-center text-dark-400">
                    <TranslatedText text="common.loading" />
                  </td>
                </tr>
              ) : !stats.recentFiles || stats.recentFiles.length === 0 ? (
                <tr>
                  <td colSpan={3} className="py-4 text-center text-dark-400">
                    <TranslatedText text="files.emptyState.noFiles" />
                  </td>
                </tr>
              ) : (
                stats.recentFiles.map((file) => (
                  <tr key={file.id} className="border-b border-dark-700 last:border-0">
                    <td className="py-3">
                      <div className="flex items-center space-x-3">
                        {getFileOrFolderIcon(file)}
                        <span className="text-dark-100">{file.name}</span>
                      </div>
                    </td>
                    <td className="py-3 text-dark-400">
                      {formatFileSize(file.size)}
                    </td>
                    <td className="py-3 text-dark-400">
                      {new Date(file.updatedAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))
                )}
            </tbody>
          </table>
              </div>
      </Card>
    </div>
  );
};

export default Dashboard; 