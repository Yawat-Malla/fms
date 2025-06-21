'use client';

import { useState, useEffect, useMemo } from 'react';
import { useSession } from 'next-auth/react';
import { useSearchParams } from 'next/navigation';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { IFile } from '@/types/index';
import FileRow from '@/components/files/FileRow';
import { format, isValid } from 'date-fns';
import { toast } from 'react-hot-toast';
import { generateFiscalYears } from '@/utils/fiscalYears';
import { TranslatedText } from '@/components/TranslatedText';
import SearchableSelect from '@/components/ui/SearchableSelect';
import { useApp } from '@/contexts/AppContext';
import FileActions from '@/components/FileActions';
import { motion, AnimatePresence } from 'framer-motion';
import { getFileOrFolderIcon } from '@/components/DriveTable';
import { useTranslation } from 'react-i18next';
import { File, Folder } from '@/types/file';

export default function FilesPage() {
  const { t, i18n } = useTranslation();
  const { data: session, status } = useSession();
  const searchParams = useSearchParams();
  const [folders, setFolders] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('view-all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFolders, setSelectedFolders] = useState<any[]>([]);
  const [viewType, setViewType] = useState<'list' | 'grid'>('list');
  const [selectedFiscalYear, setSelectedFiscalYear] = useState<string | null>(null);
  const [selectedSource, setSelectedSource] = useState<string | null>(null);
  const [selectedGrantType, setSelectedGrantType] = useState<string | null>(null);
  const [filterOptions, setFilterOptions] = useState<{
    fiscalYears: string[];
    sources: string[];
    grantTypes: string[];
  }>({
    fiscalYears: [],
    sources: [],
    grantTypes: []
  });
  const [showFilters, setShowFilters] = useState(false);

  // Add new state for folder navigation
  const [currentPath, setCurrentPath] = useState<string[]>([]);
  const [history, setHistory] = useState<string[][]>([]);
  const [historyIndex, setHistoryIndex] = useState(0);
  const [currentFolder, setCurrentFolder] = useState<any | null>(null);
  const [prevFolders, setPrevFolders] = useState<any[]>([]);
  const [prevFiles, setPrevFiles] = useState<any[]>([]);
  const [renamingGridItem, setRenamingGridItem] = useState<{ id: number; name: string; isFolder: boolean } | null>(null);
  const [renamingListItem, setRenamingListItem] = useState<{ id: number; name: string; isFolder: boolean } | null>(null);
  const [recentlyModifiedFolders, setRecentlyModifiedFolders] = useState<any[]>([]);

  // Add state for files
  const [files, setFiles] = useState<any[]>([]);

  // Add state for filter options
  const [fiscalYears, setFiscalYears] = useState<{ id: string; name: string; }[]>([]);
  const [sourceOptions, setSourceOptions] = useState<{ id: string; translationKey: string; translations: any; }[]>([]);
  const [grantTypeOptions, setGrantTypeOptions] = useState<{ id: string; translationKey: string; translations: any; }[]>([]);

  // Add state for sorting
  const [sortField, setSortField] = useState<keyof File | keyof Folder>('name');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  // Add state for selected items
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());

  // Add utility functions for translations and number conversion
  const toNepaliNumber = (input: string | number) => {
    if (typeof input !== 'string') input = String(input);
    const nepaliDigits = ['०','१','२','३','४','५','६','७','८','९'];
    return input.replace(/[0-9]/g, d => nepaliDigits[d as any]);
  };

  // Helper function to format file size
  const formatFileSize = (bytes: number | undefined | null): string => {
    if (!bytes) return '-';
    const units = ['B', 'KB', 'MB', 'GB', 'TB'];
    let size = bytes;
    let unitIndex = 0;
    
    while (size >= 1024 && unitIndex < units.length - 1) {
      size /= 1024;
      unitIndex++;
    }
    
    const formattedSize = size.toFixed(1).replace(/\.0$/, '');
    const formatted = `${formattedSize} ${units[unitIndex]}`;
    
    return i18n.language === 'ne' ? toNepaliNumber(formatted) : formatted;
  };

  // Helper function to format date based on current language
  const formatDate = (date: Date | string | null | undefined) => {
    if (!date) return '-';
    try {
      const dateObj = typeof date === 'string' ? new Date(date) : date;
      if (isNaN(dateObj.getTime())) return '-';
      
      let formattedDate = format(dateObj, 'MMM d, yyyy');
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
    } catch (error) {
      console.error('Error formatting date:', error);
      return '-';
    }
  };

  // Helper function to get translated source name
  const getTranslatedSource = (sourceName: string | undefined) => {
    if (!sourceName) return '-';
    const key = sourceName.toLowerCase().replace(/\s+/g, '_');
    const translationKey = `reports.sources.${key}`;
    const translation = t(translationKey);
    return translation === translationKey ? sourceName : translation;
  };

  // Helper function to get translated grant type
  const getTranslatedGrantType = (grantTypeName: string | undefined) => {
    if (!grantTypeName) return '-';
    const key = grantTypeName.toLowerCase().replace(/\s+/g, '_');
    const translationKey = `reports.grantTypes.${key}`;
    const translation = t(translationKey);
    return translation === translationKey ? grantTypeName : translation;
  };

  // Handle URL changes
  useEffect(() => {
    const handleUrlChange = () => {
      const searchParams = new URLSearchParams(window.location.search);
      const fiscalYear = searchParams.get('fiscal-year');
      const source = searchParams.get('source');
      const grantType = searchParams.get('grant-type');
      const currentPath = searchParams.get('path')?.split('/').filter(Boolean) || [];

      console.log('[Files] URL parameters changed:', {
        fiscalYear,
        source,
        grantType,
        currentPath,
        searchParams: Object.fromEntries(searchParams.entries())
      });

      // Update state with new values
      setSelectedFiscalYear(fiscalYear);
      setSelectedSource(source);
      setSelectedGrantType(grantType);
      setCurrentPath(currentPath);
    };

    // Initial call
    handleUrlChange();

    // Add event listener
    window.addEventListener('urlchange', handleUrlChange);
    window.addEventListener('popstate', handleUrlChange);

    return () => {
      window.removeEventListener('urlchange', handleUrlChange);
      window.removeEventListener('popstate', handleUrlChange);
    };
  }, []);

  // Fetch folders when session or filters change
  useEffect(() => {
    if (session) {
      fetchFolders();
    }
  }, [session, selectedFiscalYear, selectedSource, selectedGrantType, currentPath]);

  // Fetch recently modified folders
  const fetchRecentlyModifiedFolders = async () => {
    try {
      const response = await fetch('/api/folders');
      if (!response.ok) throw new Error('Failed to fetch recently modified folders');
      const data = await response.json();
      const recentFolders = [...data]
        .filter(f => !!f.lastModifiedAt)
        .sort((a, b) => new Date(b.lastModifiedAt).getTime() - new Date(a.lastModifiedAt).getTime())
        .slice(0, 5);
      setRecentlyModifiedFolders(recentFolders);
      } catch (error) {
      console.error('Error fetching recently modified folders:', error);
      }
    };

  // Update fetchFolders to handle files
  const fetchFolders = async () => {
      try {
        setIsLoading(true);
        
        // Don't fetch if not authenticated
        if (!session?.user?.email) return;

        // Build the query URL with current filters
        const queryParams = new URLSearchParams();
        if (selectedFiscalYear) queryParams.append('fiscal-year', selectedFiscalYear);
        if (selectedSource) queryParams.append('source', selectedSource);
        if (selectedGrantType) queryParams.append('grant-type', selectedGrantType);

      let response;
      if (currentPath.length === 0) {
        // Fetch root folders only
        response = await fetch(`/api/folders?${queryParams.toString()}`);
        setFiles([]); // Clear files at root level
      } else {
        // Fetch folder by path
        const folder = await fetchFolderByPath(currentPath);
        if (folder) {
          setCurrentFolder(folder);
          // Store the files from the current folder
          setFiles(folder.files || []);
          response = await fetch(`/api/folders?parentId=${folder.id}&${queryParams.toString()}`);
        } else {
          setCurrentFolder(null);
          setFolders([]);
          setFiles([]);
          setIsLoading(false);
          return;
        }
      }
        
        if (!response.ok) {
        throw new Error('Failed to fetch folders');
        }

        const data = await response.json();
      setFolders(data);
      setFilterOptions({
        fiscalYears: [...new Set(data.map((f: any) => f.fiscalYear?.name).filter(Boolean))] as string[],
        sources: [...new Set(data.map((f: any) => f.source?.name).filter(Boolean))] as string[],
        grantTypes: [...new Set(data.map((f: any) => f.grantType?.name).filter(Boolean))] as string[]
      });
      } catch (error) {
      console.error('Error fetching folders:', error);
      toast.error('Failed to load folders');
      } finally {
        setIsLoading(false);
      }
    };

  // Fetch recently modified folders on initial load
  useEffect(() => {
    fetchRecentlyModifiedFolders();
  }, [session]);

  // Add navigation handlers
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

  const handleFolderClick = (folder: any) => {
    const newPath = [...currentPath, folder.name];
    setCurrentPath(newPath);
    setHistory([...history.slice(0, historyIndex + 1), newPath]);
    setHistoryIndex(historyIndex + 1);
    // Store current files before navigation
    setPrevFiles(folders);
  };

  const handleBreadcrumbClick = (path: string[]) => {
    setCurrentPath(path);
    setHistory([...history.slice(0, historyIndex + 1), path]);
    setHistoryIndex(historyIndex + 1);
    // Store current files before navigation
    setPrevFiles(folders);
  };

  // Add handlers for grid view rename
  const handleGridRename = (item: any, isFolder: boolean) => {
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
      fetchFolders();
    } catch {
      // Optionally show error
    }
  };

  const handleGridRenameCancel = () => setRenamingGridItem(null);

  const handleListRename = (item: any, isFolder: boolean) => {
    setRenamingListItem({ id: item.id, name: item.name, isFolder });
  };

  const handleListRenameSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!renamingListItem) return;

    const formData = new FormData(e.currentTarget);
    const newName = formData.get('name') as string;

    try {
      const response = await fetch(
        `/api/${renamingListItem.isFolder ? 'folders' : 'files'}/${
          renamingListItem.id
        }`,
        {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: newName }),
        }
      );

      if (!response.ok) {
        throw new Error('Failed to rename');
      }

      toast.success(
        `${renamingListItem.isFolder ? 'Folder' : 'File'} renamed successfully`
      );

      // Optimistic UI Update
      if (renamingListItem.isFolder) {
        setFolders(folders.map(f => f.id === renamingListItem.id ? { ...f, name: newName } : f));
      } else {
        setFiles(files.map(f => f.id === renamingListItem.id ? { ...f, name: newName } : f));
      }

      setRenamingListItem(null);
    } catch (error) {
      toast.error(
        `Failed to rename ${renamingListItem.isFolder ? 'folder' : 'file'}`
      );
      // Optional: Revert optimistic update on error
      fetchFolders();
    }
  };

  const handleListRenameCancel = () => {
    setRenamingListItem(null);
  };

  // Add breadcrumbs
  const breadcrumbs = [
    { name: 'Root', path: [] },
    ...currentPath.map((name, idx) => ({
      name,
      path: currentPath.slice(0, idx + 1),
    })),
  ];

  // Handle URL parameter changes
  useEffect(() => {
    const source = searchParams.get('source');
    const grantType = searchParams.get('grant-type');
    const fiscalYear = searchParams.get('fiscal-year');

    if (source) {
      setSelectedSource(source);
      setActiveTab('by-source');
    }
    if (grantType) {
      setSelectedGrantType(grantType);
      setActiveTab('by-grant-type');
    }
    if (fiscalYear) {
      setSelectedFiscalYear(fiscalYear);
      setActiveTab('by-fiscal-year');
    }
  }, [searchParams]);

  // Handle folder selection
  const handleSelectFolder = (folder: any) => {
    setSelectedFolders((prevSelectedFolders) => {
      const folderIndex = prevSelectedFolders.findIndex((f) => f.id === folder.id);
      if (folderIndex >= 0) {
        return prevSelectedFolders.filter((f) => f.id !== folder.id);
      } else {
        return [...prevSelectedFolders, folder];
      }
    });
  };

  // Handle delete folder
  const handleDeleteFolder = async (folder: any) => {
    try {
      const response = await fetch(`/api/folders/${folder.id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) throw new Error('Failed to delete folder');
      
      setFolders((prevFolders) => prevFolders.filter((f) => f.id !== folder.id));
      setSelectedFolders((prevSelected) => prevSelected.filter((f) => f.id !== folder.id));
      toast.success('Folder deleted successfully');
    } catch (error) {
      console.error('Failed to delete folder:', error);
      toast.error('Failed to delete folder');
    }
  };

  // Folder card for grid view
  const renderFolderCard = (folder: any) => {
    return (
      <Card
        key={folder.id}
        className="cursor-pointer h-full hover:scale-105 hover:shadow-dark-md"
        onClick={() => handleFolderClick(folder)}
      >
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-between mb-4">
            <div className="h-10 w-10 rounded flex items-center justify-center bg-yellow-100/10 text-yellow-400">
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
              </svg>
            </div>
            <button
              type="button"
              className="text-dark-400 hover:text-dark-100"
              onClick={(e) => {
                e.stopPropagation();
                // Toggle dropdown
              }}
            >
              <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path d="M6 10a2 2 0 11-4 0 2 2 0 014 0zM12 10a2 2 0 11-4 0 2 2 0 014 0zM16 12a2 2 0 100-4 2 2 0 000 4z" />
              </svg>
            </button>
          </div>
          
          <div className="flex-grow">
            <div className="font-medium text-dark-100 truncate">
              {folder.name}
            </div>
            <div className="text-xs text-dark-400 mt-1">
              <span>{folder.files?.length || 0} files</span>
              <span className="ml-1 text-dark-500">•</span>
              <span className="ml-1">{folder.subfolders?.length || 0} subfolders</span>
            </div>
          </div>

          <div className="flex items-center justify-between mt-4 pt-4 border-t border-dark-600">
            <div className="flex items-center">
              <span className="text-xs text-dark-300">{folder.user?.name || 'Unknown User'}</span>
            </div>
            <span className="text-xs text-dark-400">
              {formatDate(folder.lastModifiedAt)}
            </span>
          </div>

          {selectedFolders.some(f => f.id === folder.id) && (
            <div className="absolute top-2 right-2 h-6 w-6 rounded-full bg-primary-600 flex items-center justify-center">
              <svg className="h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            </div>
          )}
        </div>
      </Card>
    );
  };

  // Recently modified folder card (without navigation)
  const renderRecentFolderCard = (folder: any) => {
    return (
      <Card
        key={folder.id}
        className="h-full"
      >
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-between mb-4">
            <div className="h-10 w-10 rounded flex items-center justify-center bg-yellow-100/10 text-yellow-400">
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
              </svg>
            </div>
          </div>
          
          <div className="flex-grow">
            <div className="font-medium text-dark-100 truncate">
              {folder.name}
            </div>
            <div className="text-xs text-dark-400 mt-1">
              <span>{folder.files?.length || 0} files</span>
              <span className="ml-1 text-dark-500">•</span>
              <span className="ml-1">{folder.subfolders?.length || 0} subfolders</span>
            </div>
          </div>

          <div className="flex items-center justify-between mt-4 pt-4 border-t border-dark-600">
            <div className="flex items-center">
              <span className="text-xs text-dark-300">{folder.user?.name || 'Unknown User'}</span>
            </div>
            <span className="text-xs text-dark-400">
              {formatDate(folder.lastModifiedAt)}
            </span>
          </div>
        </div>
      </Card>
    );
  };

  // Render empty state
  const renderEmptyState = () => (
    <div className="flex flex-col items-center justify-center py-12 bg-dark-700 border border-dark-600 rounded-lg">
      <svg className="h-16 w-16 text-dark-400 mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
      </svg>
      <h3 className="text-lg font-medium text-dark-200"><TranslatedText text="files.emptyState.noFolders" /></h3>
      <p className="text-dark-400 mt-1">
        {selectedFiscalYear && <TranslatedText text="files.emptyState.noFoldersForFiscalYear" />}
        {selectedSource && <TranslatedText text="files.emptyState.noFoldersForSource" />}
        {selectedGrantType && <TranslatedText text="files.emptyState.noFoldersForGrantType" />}
        {!selectedFiscalYear && !selectedSource && !selectedGrantType && <TranslatedText text="files.emptyState.noFoldersMatchFilters" />}
      </p>
      <button
        onClick={clearFilters}
        className="mt-4 px-4 py-2 bg-dark-600 text-dark-200 rounded-md hover:bg-dark-500 transition-colors"
      >
        <TranslatedText text="files.emptyState.clearFilters" />
      </button>
    </div>
  );

  // Update the filter panel to handle multiple filters
  const handleFilterChange = (type: 'fiscalYear' | 'source' | 'grantType', value: string | null) => {
    switch (type) {
      case 'fiscalYear':
        setSelectedFiscalYear(value);
        break;
      case 'source':
        setSelectedSource(value);
        break;
      case 'grantType':
        setSelectedGrantType(value);
        break;
    }
  };

  // Update the clear filters function
  const clearFilters = () => {
    setSelectedFiscalYear(null);
    setSelectedSource(null);
    setSelectedGrantType(null);
    setActiveTab('view-all');
  };

  // Handle tab changes
  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId);
    if (tabId === 'view-all') {
      clearFilters();
    } else if (tabId === 'by-source') {
      setSelectedFiscalYear(null);
      setSelectedGrantType(null);
      // Do not clear selectedSource so user can pick
    } else {
      setSelectedSource(null);
    }
  };

  // Get the current filter description
  const getFilterDescription = () => {
    const fiscalYear = searchParams.get('fiscal-year');
    const source = searchParams.get('source');
    const grantType = searchParams.get('grant-type');

    if (fiscalYear) return `Folders from Fiscal Year ${fiscalYear}`;
    if (source) return `Folders from ${source}`;
    if (grantType) return `${grantType} Folders`;
    return 'All Folders';
  };

  // Handle source selection
  const handleSourceChange = (source: string | null) => {
    console.log('Source changed:', source);
    setSelectedSource(source);
  };

  // Handle grant type selection
  const handleGrantTypeChange = (grantType: string | null) => {
    console.log('Grant type changed:', grantType);
    setSelectedGrantType(grantType);
  };

  // Helper function to format source name for translation
  const formatSourceName = (sourceName: string | undefined) => {
    if (!sourceName) return '-';
    // Convert to lowercase and replace spaces with underscores
    const formatted = sourceName.toLowerCase().replace(/\s+/g, '_');
    return formatted;
  };

  // Helper function to format grant type name for translation
  const formatGrantTypeName = (grantTypeName: string | undefined) => {
    if (!grantTypeName) return '-';
    // Convert to lowercase and replace spaces with underscores
    const formatted = grantTypeName.toLowerCase().replace(/\s+/g, '_');
    return formatted;
  };

  // Update the filter options to use the correct type
  const fiscalYearOptions = filterOptions.fiscalYears.map(year => ({
    id: year,
    translationKey: `fiscalYears.${year}`
  }));

  // Add file click handler
  const handleFileClick = (file: any) => {
    // TODO: Implement file preview/download
    console.log('File clicked:', file);
  };

  // Add file delete handler
  const handleDeleteFile = async (file: any) => {
    try {
      const response = await fetch(`/api/files/${file.id}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Failed to delete file');
      toast.success('File deleted successfully');
      // Refresh the current folder to update the file list
      fetchFolders();
    } catch (error) {
      console.error('Error deleting file:', error);
      toast.error('Failed to delete file');
    }
  };

  // Add handler for creating subfolder
  const handleCreateSubfolder = async () => {
    if (!currentFolder) return;

    const folderName = prompt('Enter folder name:');
    if (!folderName) return;

    try {
      const response = await fetch('/api/folders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: folderName,
          parentId: currentFolder.id,
          fiscalYearId: currentFolder.fiscalYear?.id,
          sourceId: currentFolder.source?.id,
          grantTypeId: currentFolder.grantType?.id,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create subfolder');
      }

      await fetchFolders();
      toast.success('Subfolder created successfully');
    } catch (error) {
      console.error('Error creating subfolder:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to create subfolder');
    }
  };

  // Helper to fetch folder by path from backend
  const fetchFolderByPath = async (pathArr: string[]) => {
    if (pathArr.length === 0) return null;
    const res = await fetch(`/api/folders/by-path?path=${encodeURIComponent(pathArr.join('/'))}`);
    if (!res.ok) return null;
    const data = await res.json();
    return data;
  };

  // Insert filteredFolders definition here
  const filteredFolders = useMemo(() => {
    console.log('[Files] Filtering folders with state:', {
      selectedFiscalYear,
      selectedSource,
      selectedGrantType,
      totalFolders: folders.length
    });

    return folders.filter((folder) => {
      console.log('[Files] Filtering folder:', {
        folderName: folder.name,
        folderFiscalYear: folder.fiscalYear?.name,
        folderSource: folder.source?.name,
        folderGrantType: folder.grantType?.name,
        selectedFiscalYear,
        selectedSource,
        selectedGrantType
      });

      // Fiscal year filter
      if (selectedFiscalYear) {
        // Remove "FY " prefix and normalize both values
        const normalizedFolderFiscalYear = folder.fiscalYear?.name?.replace('FY ', '').trim();
        const normalizedSelectedFiscalYear = selectedFiscalYear.trim();
        const matches = normalizedFolderFiscalYear === normalizedSelectedFiscalYear;
        
        console.log('[Files] Fiscal year filter:', {
          normalizedFolderFiscalYear,
          normalizedSelectedFiscalYear,
          matches
        });
        
        if (!matches) return false;
      }

      // Source filter
      if (selectedSource) {
        // Normalize both the selected source and folder source
        const normalizedSource = selectedSource.toLowerCase().replace(/\s+/g, '_');
        const folderSource = folder.source?.key?.toLowerCase() || 
                            folder.source?.name?.toLowerCase().replace(/\s+/g, '_');
        
        const matches = folderSource === normalizedSource;
        
        console.log('[Files] Source filter:', {
          normalizedSource,
          folderSource,
          matches,
          folderSourceKey: folder.source?.key,
          folderSourceName: folder.source?.name
        });
        
        if (!matches) return false;
      }

      // Grant type filter
      if (selectedGrantType) {
        // Normalize both the selected grant type and folder grant type
        const normalizedGrantType = selectedGrantType.toLowerCase().replace(/\s+/g, '_');
        const folderGrantType = folder.grantType?.key?.toLowerCase() || 
                              folder.grantType?.name?.toLowerCase().replace(/\s+/g, '_');
        
        const matches = folderGrantType === normalizedGrantType;
        
        console.log('[Files] Grant type filter:', {
          normalizedGrantType,
          folderGrantType,
          matches,
          folderGrantTypeKey: folder.grantType?.key,
          folderGrantTypeName: folder.grantType?.name
        });
        
        if (!matches) return false;
      }

      return true;
    });
  }, [folders, selectedFiscalYear, selectedSource, selectedGrantType]);

  // Initialize fiscal years
  useEffect(() => {
    setFiscalYears(generateFiscalYears());
  }, []);

  // Fetch sources and grant types
  useEffect(() => {
    const fetchOptions = async () => {
      try {
        // Fetch sources
        const sourcesRes = await fetch('/api/admin/sources');
        const sourcesData = await sourcesRes.json();
        setSourceOptions(sourcesData.map((source: any) => ({
          id: source.key,
          translationKey: `reports.sources.${source.key}`,
          translations: source.translations
        })));

        // Fetch grant types
        const grantTypesRes = await fetch('/api/admin/grant-types');
        const grantTypesData = await grantTypesRes.json();
        setGrantTypeOptions(grantTypesData.map((grant: any) => ({
          id: grant.key,
          translationKey: `reports.grantTypes.${grant.key}`,
          translations: grant.translations
        })));
      } catch (error) {
        console.error('Error fetching options:', error);
      }
    };
    fetchOptions();
  }, []);

  return (
    <div className="min-h-screen bg-dark-800">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-dark-100"><TranslatedText text="files.heading" /></h1>
        <p className="mt-1 text-dark-300">
          {filteredFolders.length} {filteredFolders.length === 1 ? <TranslatedText text="files.folder" /> : <TranslatedText text="files.folders" />} <TranslatedText text="files.found" />
        </p>
      </div>

      {/* Recently Modified Folders Section */}
      {recentlyModifiedFolders.length > 0 && (
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-dark-200 mb-4 flex items-center">
            <svg className="h-5 w-5 mr-2 text-primary-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" /></svg>
            <TranslatedText text="files.recentlyModified" />
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {recentlyModifiedFolders.map(folder => renderRecentFolderCard(folder))}
          </div>
        </div>
      )}

      {/* Show all folders and files with filter panel */}
      <div className="mt-8">
        {/* Filter panel */}
        {showFilters && (
          <div className="mb-6 p-4 bg-dark-800 rounded-lg border border-dark-700">
            {/* Add filter dropdowns */}
            <div className="flex items-center space-x-4 mb-4">
              {/* Fiscal Year Filter */}
              <div className="relative">
                <select
                  value={selectedFiscalYear || ''}
                  onChange={(e) => handleFilterChange('fiscalYear', e.target.value || null)}
                  className="block w-full rounded-md border-dark-600 bg-dark-800 text-dark-100 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                >
                  <option value=""><TranslatedText text="files.filters.allFiscalYears" /></option>
                  {fiscalYears.map((year) => (
                    <option key={year.id} value={year.name}>
                      {year.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Source Filter */}
              <div className="relative">
                <select
                  value={selectedSource || ''}
                  onChange={(e) => handleFilterChange('source', e.target.value || null)}
                  className="block w-full rounded-md border-dark-600 bg-dark-800 text-dark-100 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                >
                  <option value=""><TranslatedText text="files.filters.allSources" /></option>
                  {sourceOptions.map((source) => (
                    <option key={source.id} value={source.id}>
                      {source.translations[i18n.language] || source.translations.en}
                    </option>
                  ))}
                </select>
              </div>

              {/* Grant Type Filter */}
              <div className="relative">
                <select
                  value={selectedGrantType || ''}
                  onChange={(e) => handleFilterChange('grantType', e.target.value || null)}
                  className="block w-full rounded-md border-dark-600 bg-dark-800 text-dark-100 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                >
                  <option value=""><TranslatedText text="files.filters.allGrantTypes" /></option>
                  {grantTypeOptions.map((grantType) => (
                    <option key={grantType.id} value={grantType.id}>
                      {grantType.translations[i18n.language] || grantType.translations.en}
                    </option>
                  ))}
                </select>
              </div>

              {/* Clear Filters Button */}
              {(selectedFiscalYear || selectedSource || selectedGrantType) && (
                <button
                  onClick={clearFilters}
                  className="px-3 py-2 text-sm text-dark-300 hover:text-white transition-colors"
                >
                  <TranslatedText text="files.emptyState.clearFilters" />
                </button>
              )}
            </div>
          </div>
        )}

        {/* Loading state */}
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
          </div>
        ) : (
      <div>
            {viewType === 'grid' ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Show folders */}
                {filteredFolders.map(folder => renderFolderCard(folder))}
                
                {/* Show files from current folder */}
                {files.map((file: any) => (
                  <Card
                    key={file.id}
                    className="cursor-pointer h-full hover:scale-105 hover:shadow-dark-md"
                    onClick={() => handleFileClick(file)}
                  >
                    <div className="flex flex-col h-full">
                      <div className="flex items-center justify-between mb-4">
                        <div className="h-10 w-10 rounded flex items-center justify-center bg-primary-100/10 text-primary-400">
                          {getFileOrFolderIcon(file, false, 'h-6 w-6')}
                        </div>
                        <button
                          type="button"
                          className="text-dark-400 hover:text-dark-100"
                          onClick={(e) => {
                            e.stopPropagation();
                            // Toggle dropdown
                          }}
                        >
                          <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                            <path d="M6 10a2 2 0 11-4 0 2 2 0 014 0zM12 10a2 2 0 11-4 0 2 2 0 014 0zM16 12a2 2 0 100-4 2 2 0 000 4z" />
                          </svg>
                        </button>
                      </div>
                      
                      <div className="flex-grow">
                        <div className="font-medium text-dark-100 truncate">
                          {file.name}
                        </div>
                        <div className="text-xs text-dark-400 mt-1">
                          <span>{formatFileSize(file.size)}</span>
                          <span className="ml-1 text-dark-500">•</span>
                          <span className="ml-1">{file.type}</span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between mt-4 pt-4 border-t border-dark-600">
                        <div className="flex items-center">
                          <span className="text-xs text-dark-300">{file.user?.name || 'Unknown User'}</span>
                        </div>
                        <span className="text-xs text-dark-400">
                          {formatDate(file.lastModifiedAt)}
                        </span>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            ) : (
              <>
                {/* Navigation and view controls */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-2">
                    <button 
                      onClick={goBack} 
                      disabled={historyIndex === 0} 
                      className="p-2 rounded text-dark-300 hover:text-dark-100 disabled:opacity-50"
                    >
                      &#8592;
                    </button>
                    <button 
                      onClick={goForward} 
                      disabled={historyIndex === history.length - 1} 
                      className="p-2 rounded text-dark-300 hover:text-dark-100 disabled:opacity-50"
                    >
                      &#8594;
                    </button>
                    <nav className="flex items-center space-x-1">
                      {breadcrumbs.map((crumb, idx) => (
                        <span key={idx} className="flex items-center">
                          {idx > 0 && <span className="mx-1 text-dark-400">/</span>}
                          <button 
                            onClick={() => handleBreadcrumbClick(crumb.path)} 
                            className="text-dark-300 hover:text-dark-100 text-sm font-medium"
                          >
                            <TranslatedText text={crumb.name} />
                          </button>
                        </span>
                      ))}
                    </nav>
                  </div>
                  <div className="flex items-center space-x-2">
                    {/* Add Create Subfolder button when in a subfolder */}
                    
            {/* View toggle */}
            <div className="flex items-center bg-dark-700 border border-dark-600 rounded-md p-1">
              <button 
                className={(viewType as 'list' | 'grid') === 'grid' ? 'p-1 rounded bg-dark-600 text-dark-100' : 'p-1 rounded text-dark-400'}
                onClick={() => setViewType('grid')}
              >
                <svg className="h-5 w-5" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M3 5C3 3.89543 3.89543 3 5 3H7C8.10457 3 9 3.89543 9 5V7C9 8.10457 8.10457 9 7 9H5C3.89543 9 3 8.10457 3 7V5Z" stroke="currentColor" strokeWidth="1.5" />
                  <path d="M11 5C11 3.89543 11.8954 3 13 3H15C16.1046 3 17 3.89543 17 5V7C17 8.10457 16.1046 9 15 9H13C11.8954 9 11 8.10457 11 7V5Z" stroke="currentColor" strokeWidth="1.5" />
                  <path d="M3 13C3 11.8954 3.89543 11 5 11H7C8.10457 11 9 11.8954 9 13V15C9 16.1046 8.10457 17 7 17H5C3.89543 17 3 16.1046 3 15V13Z" stroke="currentColor" strokeWidth="1.5" />
                  <path d="M11 13C11 11.8954 11.8954 11 13 11H15C16.1046 11 17 11.8954 17 13V15C17 16.1046 16.1046 17 15 17H13C11.8954 17 11 16.1046 11 15V13Z" stroke="currentColor" strokeWidth="1.5" />
                </svg>
              </button>
              <button 
                className={(viewType as 'list' | 'grid') === 'list' ? 'p-1 rounded bg-dark-600 text-dark-100' : 'p-1 rounded text-dark-400'}
                onClick={() => setViewType('list')}
              >
                <svg className="h-5 w-5" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M5 5H15M5 10H15M5 15H15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
            </div>

            {/* Filters button */}
            <Button 
              variant="secondary" 
              size="sm"
              leftIcon={
                <svg className="h-4 w-4" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M5 10H15M3 5H17M7 15H13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              }
              onClick={() => setShowFilters(!showFilters)}
            >
              <TranslatedText text="files.filters.title" />
            </Button>
          </div>
        </div>

                <div className="bg-dark-800 rounded-lg border border-dark-700 overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-dark-700 table-fixed">
                      <thead className="bg-dark-700">
                        <tr>
                          <th className="w-1/3 px-6 py-3 text-left text-xs font-medium text-dark-300 uppercase tracking-wider">
                            <TranslatedText text="files.table.name" />
                          </th>
                          <th className="w-1/6 px-6 py-3 text-left text-xs font-medium text-dark-300 uppercase tracking-wider">
                            <TranslatedText text="files.table.fiscalYear" />
                          </th>
                          <th className="w-1/6 px-6 py-3 text-left text-xs font-medium text-dark-300 uppercase tracking-wider">
                            <TranslatedText text="files.table.source" />
                          </th>
                          <th className="w-1/6 px-6 py-3 text-left text-xs font-medium text-dark-300 uppercase tracking-wider">
                            <TranslatedText text="files.table.grantType" />
                          </th>
                          <th className="w-1/6 px-6 py-3 text-left text-xs font-medium text-dark-300 uppercase tracking-wider">
                            <TranslatedText text="files.table.created" />
                          </th>
                          <th className="w-1/12 px-6 py-3 text-left text-xs font-medium text-dark-300 uppercase tracking-wider">
                            <TranslatedText text="files.table.actions" />
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-dark-700">
                        {/* Show folders */}
                        {filteredFolders.map((folder) => (
                          <tr key={folder.id} className="hover:bg-dark-700">
                            <td className="px-6 py-4 max-w-0">
                              {renamingListItem?.id === folder.id ? (
                                <form onSubmit={handleListRenameSubmit} className="flex items-center">
                                  <input
                                    type="text"
                                    name="name"
                                    defaultValue={renamingListItem.name}
                                    className="bg-dark-900 border border-primary-500 rounded px-2 py-1 w-full text-black"
                                    autoFocus
                                  />
                                  <button type="submit" className="p-1 text-green-500">✓</button>
                                  <button type="button" onClick={handleListRenameCancel} className="p-1 text-red-500">✗</button>
                                </form>
                              ) : (
                                <button
                                  onClick={() => handleFolderClick(folder)}
                                  className="flex items-center text-dark-100 hover:text-primary-500 transition-colors w-full"
                                >
                                  <svg className="w-5 h-5 mr-2 text-yellow-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                                  </svg>
                                  <span className="truncate block">{folder.name}</span>
                                </button>
                              )}
                            </td>
                            <td className="px-6 py-4 max-w-0">
                              <span className="truncate block">
                                {i18n.language === 'ne' ? toNepaliNumber(folder.fiscalYear?.name ?? '') : folder.fiscalYear?.name}
                              </span>
                            </td>
                            <td className="px-6 py-4 max-w-0">
                              <span className="truncate block">
                                {getTranslatedSource(folder.source?.name)}
                              </span>
                            </td>
                            <td className="px-6 py-4 max-w-0">
                              <span className="truncate block">
                                {getTranslatedGrantType(folder.grantType?.name)}
                              </span>
                            </td>
                            <td className="px-6 py-4 max-w-0">
                              <span className="truncate block">
                                {formatDate(folder.createdAt)}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-right text-sm font-medium">
                              <FileActions
                                item={folder}
                                isFolder={true}
                                onOpen={() => handleFolderClick(folder)}
                                onRename={() => handleListRename(folder, true)}
                                onDelete={() => handleDeleteFolder(folder)}
                              />
                            </td>
                          </tr>
                        ))}
                        
                        {/* Show files from current folder */}
                        {files.map((file: any) => (
                          <tr key={file.id} className="hover:bg-dark-700">
                            <td className="px-6 py-4 max-w-0">
                            {renamingListItem?.id === file.id ? (
                                <form onSubmit={handleListRenameSubmit} className="flex items-center">
                                  <input
                                    type="text"
                                    name="name"
                                    defaultValue={renamingListItem.name}
                                    className="bg-dark-900 border border-primary-500 rounded px-2 py-1 w-full text-black"
                                    autoFocus
                                  />
                                  <button type="submit" className="p-1 text-green-500">✓</button>
                                  <button type="button" onClick={handleListRenameCancel} className="p-1 text-red-500">✗</button>
                                </form>
                              ) : (
                              <button
                                onClick={() => handleFileClick(file)}
                                className="flex items-center text-dark-100 hover:text-primary-500 transition-colors w-full"
                              >
                                {getFileOrFolderIcon(file, false, 'w-5 h-5 mr-2 text-primary-400 flex-shrink-0')}
                                <span className="truncate block">{file.name}</span>
                              </button>
                              )}
                            </td>
                            <td className="px-6 py-4 max-w-0">
                              <span className="truncate block">
                                {i18n.language === 'ne' ? toNepaliNumber(file.fiscalYear?.name ?? '') : file.fiscalYear?.name}
                              </span>
                            </td>
                            <td className="px-6 py-4 max-w-0">
                              <span className="truncate block">
                                {file.source?.name || '-'}
                              </span>
                            </td>
                            <td className="px-6 py-4 max-w-0">
                              <span className="truncate block">
                                {file.grantType?.name || '-'}
                              </span>
                            </td>
                            <td className="px-6 py-4 max-w-0">
                              <span className="truncate block">
                                {formatDate(file.createdAt)}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-right text-sm font-medium">
                              <FileActions
                                item={file}
                                isFolder={false}
                                onOpen={() => handleFileClick(file)}
                                onRename={() => handleListRename(file, false)}
                                onDelete={() => handleDeleteFile(file)}
                              />
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
} 