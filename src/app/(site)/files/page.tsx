'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useSearchParams } from 'next/navigation';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { IFile } from '@/types/index';
import FileRow from '@/components/files/FileRow';
import { format } from 'date-fns';
import { toast } from 'react-hot-toast';
import { generateFiscalYears } from '@/utils/fiscalYears';

export default function FilesPage() {
  const { data: session, status } = useSession();
  const searchParams = useSearchParams();
  const [files, setFiles] = useState<IFile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('view-all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFiles, setSelectedFiles] = useState<IFile[]>([]);
  const [viewType, setViewType] = useState<'grid' | 'list'>('list');
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

  // Filter tabs
  const tabs = [
    { id: 'view-all', name: 'View all' },
    { id: 'by-fiscal-year', name: 'By Fiscal Year' },
    { id: 'by-source', name: 'By Source' },
    { id: 'pdfs', name: 'PDFs' },
    { id: 'images', name: 'Images' },
  ];

  // Get fiscal years using the utility function
  const fiscalYearOptions = generateFiscalYears();

  // Source filter options
  const sourceFilters = [
    { id: 'federal', name: 'Federal' },
    { id: 'provincial', name: 'Provincial' },
    { id: 'local', name: 'Local' },
    { id: 'other', name: 'Other' },
  ];

  // Fetch files when URL parameters or session changes
  useEffect(() => {
    const fetchFiles = async () => {
      try {
        setIsLoading(true);
        
        // Don't fetch if not authenticated
        if (!session?.user?.email) return;

        // Build the query URL with current filters
        const queryParams = new URLSearchParams();
        if (selectedFiscalYear) queryParams.append('fiscal-year', selectedFiscalYear);
        if (selectedSource) queryParams.append('source', selectedSource);
        if (selectedGrantType) queryParams.append('grant-type', selectedGrantType);

        const response = await fetch(`/api/files?${queryParams.toString()}`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch files');
        }

        const data = await response.json();
        setFiles(data.files);
        setFilterOptions(data.filterOptions);
      } catch (error) {
        console.error('Error fetching files:', error);
        toast.error('Failed to load files');
      } finally {
        setIsLoading(false);
      }
    };

    fetchFiles();
  }, [session, selectedFiscalYear, selectedSource, selectedGrantType]);

  // Filter files based on current URL parameters and active tab
  const filteredFiles = files.filter((file) => {
    // Get current URL parameters for filtering
    const currentFiscalYear = searchParams.get('fiscal-year');
    const currentSource = searchParams.get('source');
    const currentGrantType = searchParams.get('grant-type');

    // First apply the URL parameter filters
    if (currentFiscalYear) {
      const normalizedFileFiscalYear = file.fiscalYear?.replace('FY ', '');
      if (normalizedFileFiscalYear !== currentFiscalYear) return false;
    }

    if (currentSource && file.source !== currentSource) {
      return false;
    }

    if (currentGrantType && file.grantType !== currentGrantType) {
      return false;
    }

    // Then apply the tab filters
    const type = file.type.toLowerCase();
    switch (activeTab) {
      case 'documents':
        return [
          'doc', 'docx', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
          'application/vnd.oasis.opendocument.text', 'odt', 'rtf', 'txt', 'application/rtf', 'application/txt', 'text/plain'
        ].some(ext => type.includes(ext));
      case 'spreadsheets':
        return [
          'xls', 'xlsx', 'csv', 'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          'application/vnd.oasis.opendocument.spreadsheet', 'ods', 'text/csv'
        ].some(ext => type.includes(ext));
      case 'pdfs':
        return type.includes('pdf');
      case 'images':
        return [
          'jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp', 'svg', 'image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/bmp', 'image/svg+xml'
        ].some(ext => type.includes(ext));
      default:
        return true;
    }
  });

  // Recently modified files (last 3)
  const recentFiles = [...files]
    .sort((a, b) => new Date(b.lastModifiedAt).getTime() - new Date(a.lastModifiedAt).getTime())
    .slice(0, 3);

  // Handle file selection
  const handleSelectFile = (file: IFile) => {
    setSelectedFiles((prevSelectedFiles) => {
      const fileIndex = prevSelectedFiles.findIndex((f) => f.id === file.id);
      if (fileIndex >= 0) {
        return prevSelectedFiles.filter((f) => f.id !== file.id);
      } else {
        return [...prevSelectedFiles, file];
      }
    });
  };

  // Handle delete file
  const handleDeleteFile = async (file: IFile) => {
    try {
      const response = await fetch(`/api/files/${file.id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) throw new Error('Failed to delete file');
      
    setFiles((prevFiles) => prevFiles.filter((f) => f.id !== file.id));
    setSelectedFiles((prevSelected) => prevSelected.filter((f) => f.id !== file.id));
      toast.success('File deleted successfully');
    } catch (error) {
      console.error('Failed to delete file:', error);
      toast.error('Failed to delete file');
    }
  };

  // Format file size (e.g., 1.2 MB)
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    
    const units = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${units[i]}`;
  };

  // File card for grid view
  const renderFileCard = (file: IFile) => {
    const getFileIcon = () => {
      const fileType = file.type.toLowerCase();
      
      const iconClasses = "h-10 w-10 rounded flex items-center justify-center";
      
      switch (fileType) {
        case 'pdf':
        case 'application/pdf':
          return (
            <div className={`${iconClasses} bg-red-100/10 text-red-400`}>
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12H9M9 16h6" />
              </svg>
            </div>
          );
        case 'doc':
        case 'docx':
          return (
            <div className={`${iconClasses} bg-blue-100/10 text-blue-400`}>
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 11h3m-3 4h3m-6-4h.01M9 15h.01" />
              </svg>
            </div>
          );
        case 'xls':
        case 'xlsx':
        case 'csv':
          return (
            <div className={`${iconClasses} bg-emerald-100/10 text-emerald-400`}>
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12H9M9 8h6M15 16H9" />
              </svg>
            </div>
          );
        case 'jpg':
        case 'jpeg':
        case 'png':
        case 'gif':
        case 'webp':
        case 'image/jpeg':
        case 'image/png':
        case 'image/gif':
        case 'image/webp':
          return (
            <div className={`${iconClasses} bg-purple-100/10 text-purple-400`}>
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
          );
        case 'mp4':
        case 'mov':
        case 'avi':
        case 'mkv':
        case 'video/mp4':
        case 'video/quicktime':
        case 'video/x-msvideo':
        case 'video/x-matroska':
          return (
            <div className={`${iconClasses} bg-pink-100/10 text-pink-400`}>
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
            </div>
          );
        case 'mp3':
        case 'wav':
        case 'ogg':
        case 'audio/mpeg':
        case 'audio/wav':
        case 'audio/ogg':
          return (
            <div className={`${iconClasses} bg-yellow-100/10 text-yellow-400`}>
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
              </svg>
            </div>
          );
        case 'zip':
        case 'rar':
        case '7z':
        case 'application/zip':
        case 'application/x-rar-compressed':
        case 'application/x-7z-compressed':
          return (
            <div className={`${iconClasses} bg-amber-100/10 text-amber-400`}>
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
              </svg>
            </div>
          );
        case 'ppt':
        case 'pptx':
        case 'application/vnd.ms-powerpoint':
        case 'application/vnd.openxmlformats-officedocument.presentationml.presentation':
          return (
            <div className={`${iconClasses} bg-orange-100/10 text-orange-400`}>
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v8m-4-4h8" />
              </svg>
            </div>
          );
        default:
          return (
            <div className={`${iconClasses} bg-gray-100/10 text-gray-400`}>
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 11v.01M12 15v.01" />
              </svg>
            </div>
          );
      }
    };

    return (
      <Card
        key={file.id}
        className="cursor-pointer h-full hover:scale-105 hover:shadow-dark-md"
        onClick={() => handleSelectFile(file)}
      >
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-between mb-4">
            {getFileIcon()}
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
              {formatFileSize(file.size)}
              <span className="ml-1 text-dark-500">•</span>
              <span className="ml-1">{file.type}</span>
            </div>
            {file.description && (
              <p className="text-dark-300 text-sm mt-2 line-clamp-2">{file.description}</p>
            )}
          </div>

          <div className="flex items-center justify-between mt-4 pt-4 border-t border-dark-600">
            <div className="flex items-center">
              <span className="text-xs text-dark-300">{file.user?.name || 'Unknown User'}</span>
            </div>
            <span className="text-xs text-dark-400">
              {format(new Date(file.lastModifiedAt), 'MMM d, yyyy')}
            </span>
          </div>

          {selectedFiles.some(f => f.id === file.id) && (
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

  // Render empty state
  const renderEmptyState = () => (
    <div className="flex flex-col items-center justify-center py-12 bg-dark-700 border border-dark-600 rounded-lg">
      <svg className="h-16 w-16 text-dark-400 mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 13h6m-3-3v6m-9 1V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
      </svg>
      <h3 className="text-lg font-medium text-dark-200">No files found</h3>
      <p className="text-dark-400 mt-1">
        {selectedFiscalYear && `No files found for Fiscal Year ${selectedFiscalYear}`}
        {selectedSource && `No files found from ${selectedSource}`}
        {selectedGrantType && `No ${selectedGrantType} files found`}
        {!selectedFiscalYear && !selectedSource && !selectedGrantType && 'No files match your current filters'}
      </p>
      <button
        onClick={clearFilters}
        className="mt-4 px-4 py-2 bg-dark-600 text-dark-200 rounded-md hover:bg-dark-500 transition-colors"
      >
        Clear Filters
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
    }
  };

  // Get the current filter description
  const getFilterDescription = () => {
    const fiscalYear = searchParams.get('fiscal-year');
    const source = searchParams.get('source');
    const grantType = searchParams.get('grant-type');

    if (fiscalYear) return `Files from Fiscal Year ${fiscalYear}`;
    if (source) return `Files from ${source}`;
    if (grantType) return `${grantType} Files`;
    return 'All Files';
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-dark-100">{getFilterDescription()}</h1>
        <p className="mt-1 text-dark-300">
          {filteredFiles.length} {filteredFiles.length === 1 ? 'file' : 'files'} found
        </p>
      </div>

      {/* Only show file creation cards when no filters are active */}
      {!selectedFiscalYear && !selectedSource && !selectedGrantType && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card className="bg-dark-700 border border-dark-600 hover:bg-dark-600 transition-colors cursor-pointer">
            <div className="flex flex-col items-center justify-center py-4">
              <div className="w-12 h-12 bg-primary-500/10 text-primary-500 rounded-lg flex items-center justify-center mb-3">
                <svg className="h-6 w-6" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M10 5V15M5 10H15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <h3 className="text-dark-100 font-medium text-lg">New document</h3>
            </div>
          </Card>
          
          <Card className="bg-dark-700 border border-dark-600 hover:bg-dark-600 transition-colors cursor-pointer">
            <div className="flex flex-col items-center justify-center py-4">
              <div className="w-12 h-12 bg-primary-500/10 text-primary-500 rounded-lg flex items-center justify-center mb-3">
                <svg className="h-6 w-6" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M5 15H15M5 10H15M5 5H15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <h3 className="text-dark-100 font-medium text-lg">New file</h3>
            </div>
          </Card>
          
          <Card className="bg-dark-700 border border-dark-600 hover:bg-dark-600 transition-colors cursor-pointer">
            <div className="flex flex-col items-center justify-center py-4">
              <div className="w-12 h-12 bg-primary-500/10 text-primary-500 rounded-lg flex items-center justify-center mb-3">
                <svg className="h-6 w-6" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M13 5H5C3.89543 5 3 5.89543 3 7V15C3 16.1046 3.89543 17 5 17H15C16.1046 17 17 16.1046 17 15V9M13 5L17 9M13 5V9H17" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <h3 className="text-dark-100 font-medium text-lg">New folder</h3>
            </div>
          </Card>
        </div>
      )}

      {/* Only show recently modified section when no filters are active */}
      {!selectedFiscalYear && !selectedSource && !selectedGrantType && (
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-medium text-dark-100">Recently modified</h2>
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => {
                clearFilters();
                setActiveTab('view-all');
                window.history.pushState({}, '', '/files');
                window.dispatchEvent(new Event('urlchange'));
              }}
              rightIcon={
                <svg className="h-4 w-4" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M8 5L13 10L8 15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              }
            >
              View all
            </Button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {recentFiles.map(file => renderFileCard(file))}
          </div>
        </div>
      )}

      {/* All files section */}
      <div>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-medium text-dark-100">
            {selectedFiscalYear || selectedSource || selectedGrantType ? 'Filtered Results' : 'All Files'}
          </h2>
          <div className="flex items-center space-x-2">
            {/* View toggle */}
            <div className="flex items-center bg-dark-700 border border-dark-600 rounded-md p-1">
              <button 
                className={viewType === 'grid' ? 'p-1 rounded bg-dark-600 text-dark-100' : 'p-1 rounded text-dark-400'}
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
                className={viewType === 'list' ? 'p-1 rounded bg-dark-600 text-dark-100' : 'p-1 rounded text-dark-400'}
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
              Filters
            </Button>
          </div>
        </div>

        {/* Filter panel */}
        {showFilters && (
          <div className="mb-6 p-4 bg-dark-700 rounded-lg border border-dark-600">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Fiscal Year Filter */}
              <div>
                <label className="block text-sm font-medium text-dark-200 mb-2">Fiscal Year</label>
                <select
                  value={selectedFiscalYear || ''}
                  onChange={(e) => handleFilterChange('fiscalYear', e.target.value || null)}
                  className="w-full bg-dark-600 border border-dark-500 rounded-md py-2 px-3 text-sm"
                >
                  <option value="">All Fiscal Years</option>
                  {fiscalYearOptions.map((year) => (
                    <option key={year.id} value={year.id}>{year.name}</option>
                  ))}
                </select>
              </div>

              {/* Source Filter */}
              <div>
                <label className="block text-sm font-medium text-dark-200 mb-2">Source</label>
                <select
                  value={selectedSource || ''}
                  onChange={(e) => handleFilterChange('source', e.target.value || null)}
                  className="w-full bg-dark-600 border border-dark-500 rounded-md py-2 px-3 text-sm"
                >
                  <option value="">All Sources</option>
                  {sourceFilters.map((source) => (
                    <option key={source.id} value={source.id}>{source.name}</option>
                  ))}
                </select>
              </div>

              {/* Grant Type Filter */}
              <div>
                <label className="block text-sm font-medium text-dark-200 mb-2">Grant Type</label>
                <select
                  value={selectedGrantType || ''}
                  onChange={(e) => handleFilterChange('grantType', e.target.value || null)}
                  className="w-full bg-dark-600 border border-dark-500 rounded-md py-2 px-3 text-sm"
                >
                  <option value="">All Grant Types</option>
                  {filterOptions.grantTypes.map((type) => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        )}

        {/* File filter tabs */}
        <div className="border-b border-dark-600 mb-4">
          <nav className="-mb-px flex space-x-6" aria-label="Tabs">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => handleTabChange(tab.id)}
                className={
                  activeTab === tab.id
                    ? 'whitespace-nowrap border-b-2 py-3 px-1 text-sm font-medium border-primary-500 text-primary-500'
                    : 'whitespace-nowrap border-b-2 py-3 px-1 text-sm font-medium border-transparent text-dark-400 hover:border-dark-500 hover:text-dark-200'
                }
              >
                {tab.name}
              </button>
            ))}
          </nav>
        </div>

        {/* Files display (grid or list) */}
        {isLoading ? (
          <div className="flex justify-center items-center py-20">
            <svg className="animate-spin h-8 w-8 text-primary-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          </div>
        ) : filteredFiles.length === 0 ? (
          renderEmptyState()
        ) : viewType === 'grid' ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredFiles.map((file) => renderFileCard(file))}
          </div>
        ) : (
          <div className="bg-dark-700 border border-dark-600 rounded-lg overflow-visible">
            <table className="min-w-full divide-y divide-dark-600">
              <thead className="bg-dark-800">
                <tr>
                  <th scope="col" className="px-4 py-3 w-12">
                    <div className="flex items-center">
                      <input
                        id="select-all"
                        type="checkbox"
                        className="h-4 w-4 text-primary-600 border-dark-400 rounded focus:ring-primary-500 focus:ring-offset-dark-800"
                        checked={selectedFiles.length === filteredFiles.length && filteredFiles.length > 0}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedFiles(filteredFiles);
                          } else {
                            setSelectedFiles([]);
                          }
                        }}
                      />
                    </div>
                  </th>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-dark-300 uppercase tracking-wider">
                    File name
                  </th>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-dark-300 uppercase tracking-wider">
                    Uploaded by
                  </th>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-dark-300 uppercase tracking-wider">
                    Last modified
                  </th>
                  <th scope="col" className="px-4 py-3 w-12">
                    <span className="sr-only">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-dark-600">
                {filteredFiles.map((file) => (
                  <FileRow
                    key={file.id}
                    file={file}
                    onSelect={handleSelectFile}
                    onDelete={handleDeleteFile}
                  />
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
} 