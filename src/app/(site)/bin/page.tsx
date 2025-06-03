'use client';

import { useState, useEffect } from 'react';
import Card from '@/components/ui/Card';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';

const FolderIcon = () => (
  <svg className="w-5 h-5 text-yellow-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
  </svg>
);
const FileIcon = () => (
  <svg className="w-5 h-5 text-dark-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
  </svg>
);

export default function BinPage() {
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<'list' | 'grid'>('list');
  const [selectedItems, setSelectedItems] = useState<{ id: string, type: 'file' | 'folder' }[]>([]);
  const [deletedFiles, setDeletedFiles] = useState<any[]>([]);
  const [deletedFolders, setDeletedFolders] = useState<any[]>([]);
  const [selectedType, setSelectedType] = useState<string>('');
  const [selectedModified, setSelectedModified] = useState<string>('');
  const [selectedSource, setSelectedSource] = useState<string>('');
  const [selectedFiscalYear, setSelectedFiscalYear] = useState<string>('');
  const [selectedGrantType, setSelectedGrantType] = useState<string>('');
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [showConfirm, setShowConfirm] = useState<'restore' | 'delete' | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  // Filter options
  const typeOptions = ['PDF', 'Excel', 'Word', 'Image', 'Other'];
  const modifiedOptions = ['Today', 'Yesterday', 'Last 7 days', 'Last 30 days'];
  const sourceOptions = ['Federal Government', 'Provincial Government', 'Local Municipality', 'Other'];
  const fiscalYearOptions = ['2080/81', '2079/80', '2078/79', '2077/78'];
  const grantTypeOptions = ['Current Expenditure', 'Capital Expenditure', 'Special Grant', 'Supplementary Grant', 'Other Grant'];

  useEffect(() => {
    setLoading(true);
    fetch('/api/bin')
      .then(res => res.json())
      .then(data => {
        setDeletedFiles(data.files || []);
        setDeletedFolders(data.folders || []);
        setLoading(false);
      });
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (openDropdown && !(event.target as Element).closest('.filter-dropdown')) {
        setOpenDropdown(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [openDropdown]);

  // Filter files based on selected filters
  const filteredFiles = deletedFiles.filter(file => {
    if (selectedType && !file.name.toLowerCase().includes(selectedType.toLowerCase())) return false;
    if (selectedSource && file.source !== selectedSource) return false;
    if (selectedFiscalYear && file.fiscalYear !== selectedFiscalYear) return false;
    if (selectedGrantType && file.grantType !== selectedGrantType) return false;
    if (selectedModified) {
      const today = new Date();
      const deletedDate = new Date(file.deletedAt);
      const diffDays = Math.floor((today.getTime() - deletedDate.getTime()) / (1000 * 60 * 60 * 24));
      
      switch (selectedModified) {
        case 'Today':
          if (diffDays !== 0) return false;
          break;
        case 'Yesterday':
          if (diffDays !== 1) return false;
          break;
        case 'Last 7 days':
          if (diffDays > 7) return false;
          break;
        case 'Last 30 days':
          if (diffDays > 30) return false;
          break;
      }
    }
    return true;
  });

  // Filter folders based on selected filters
  const filteredFolders = deletedFolders.filter(folder => {
    if (selectedType && !folder.name.toLowerCase().includes(selectedType.toLowerCase())) return false;
    if (selectedSource && folder.source !== selectedSource) return false;
    if (selectedFiscalYear && folder.fiscalYear !== selectedFiscalYear) return false;
    if (selectedGrantType && folder.grantType !== selectedGrantType) return false;
    if (selectedModified) {
      const today = new Date();
      const deletedDate = new Date(folder.deletedAt);
      const diffDays = Math.floor((today.getTime() - deletedDate.getTime()) / (1000 * 60 * 60 * 24));
      
      switch (selectedModified) {
        case 'Today':
          if (diffDays !== 0) return false;
          break;
        case 'Yesterday':
          if (diffDays !== 1) return false;
          break;
        case 'Last 7 days':
          if (diffDays > 7) return false;
          break;
        case 'Last 30 days':
          if (diffDays > 30) return false;
          break;
      }
    }
    return true;
  });

  // Toggle dropdown
  const toggleDropdown = (dropdown: string) => {
    setOpenDropdown(openDropdown === dropdown ? null : dropdown);
  };

  // Handle filter selection
  const handleFilterSelect = (filter: string, value: string) => {
    switch (filter) {
      case 'type':
        setSelectedType(value);
        break;
      case 'modified':
        setSelectedModified(value);
        break;
      case 'source':
        setSelectedSource(value);
        break;
      case 'fiscalYear':
        setSelectedFiscalYear(value);
        break;
      case 'grantType':
        setSelectedGrantType(value);
        break;
    }
    setOpenDropdown(null);
  };

  // Selection logic for both files and folders
  const handleSelectAll = () => {
    if (selectedItems.length === filteredFiles.length + filteredFolders.length) {
      setSelectedItems([]);
    } else {
      setSelectedItems([
        ...filteredFolders.map(f => ({ id: f.id, type: 'folder' })),
        ...filteredFiles.map(f => ({ id: f.id, type: 'file' })),
      ]);
    }
  };
  const handleSelectItem = (id: string, type: 'file' | 'folder') => {
    setSelectedItems(prev => {
      if (prev.some(item => item.id === id && item.type === type)) {
        return prev.filter(item => !(item.id === id && item.type === type));
      } else {
        return [...prev, { id, type }];
      }
    });
  };

  // Restore selected
  const handleRestore = async () => {
    setActionLoading(true);
    for (const item of selectedItems) {
      const url = item.type === 'file'
        ? `/api/files/${item.id}/restore`
        : `/api/folders/${item.id}/restore`;
      await fetch(url, { method: 'PATCH' });
    }
    toast.success('Restored successfully');
    setSelectedItems([]);
    setActionLoading(false);
    setShowConfirm(null);
    setLoading(true);
    fetch('/api/bin')
      .then(res => res.json())
      .then(data => {
        setDeletedFiles(data.files || []);
        setDeletedFolders(data.folders || []);
        setLoading(false);
      });
  };

  // Delete forever selected
  const handleDelete = async () => {
    setActionLoading(true);
    for (const item of selectedItems) {
      const url = item.type === 'file'
        ? `/api/files/${item.id}/forever`
        : `/api/folders/${item.id}/forever`;
      await fetch(url, { method: 'DELETE' });
    }
    toast.success('Deleted forever');
    setSelectedItems([]);
    setActionLoading(false);
    setShowConfirm(null);
    setLoading(true);
    fetch('/api/bin')
      .then(res => res.json())
      .then(data => {
        setDeletedFiles(data.files || []);
        setDeletedFolders(data.folders || []);
        setLoading(false);
      });
  };

  return (
    <>
      {/* Confirmation Dialog */}
      {showConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-dark-800 rounded-lg shadow-lg p-6 w-full max-w-sm">
            <h2 className="text-lg font-semibold text-dark-100 mb-2">
              {showConfirm === 'restore' ? 'Restore Items?' : 'Delete Forever?'}
            </h2>
            <p className="text-dark-300 mb-4">
              {showConfirm === 'restore'
                ? 'Are you sure you want to restore the selected items?'
                : 'This will permanently delete the selected items. This action cannot be undone.'}
            </p>
            <div className="flex justify-end space-x-3">
              <button
                className="px-4 py-2 text-sm font-medium text-dark-100 bg-dark-700 hover:bg-dark-600 rounded-md"
                onClick={() => setShowConfirm(null)}
                disabled={actionLoading}
              >
                Cancel
              </button>
              <button
                className={`px-4 py-2 text-sm font-medium rounded-md ${showConfirm === 'restore' ? 'bg-primary-500 text-white hover:bg-primary-600' : 'bg-red-500 text-white hover:bg-red-600'}`}
                onClick={showConfirm === 'restore' ? handleRestore : handleDelete}
                disabled={actionLoading}
              >
                {actionLoading ? (
                  <span className="flex items-center"><span className="animate-spin h-4 w-4 mr-2 border-b-2 border-white rounded-full"></span>Processing...</span>
                ) : showConfirm === 'restore' ? 'Restore' : 'Delete Forever'}
              </button>
            </div>
          </div>
        </div>
      )}
      <div className="mb-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-dark-100">Bin</h1>
            <p className="mt-1 text-sm text-dark-300">Items will be permanently deleted after 30 days</p>
          </div>
          {selectedItems.length > 0 && (
            <div className="flex space-x-3">
              <button
                onClick={() => setShowConfirm('restore')}
                className="px-4 py-2 text-sm font-medium text-dark-100 bg-dark-700 hover:bg-dark-600 rounded-md transition-colors disabled:opacity-60"
                disabled={actionLoading}
              >
                {actionLoading && showConfirm === 'restore' ? <span className="animate-spin h-4 w-4 mr-2 border-b-2 border-white rounded-full inline-block"></span> : null}
                Restore
              </button>
              <button
                onClick={() => setShowConfirm('delete')}
                className="px-4 py-2 text-sm font-medium text-red-400 bg-red-400/10 hover:bg-red-400/20 rounded-md transition-colors disabled:opacity-60"
                disabled={actionLoading}
              >
                {actionLoading && showConfirm === 'delete' ? <span className="animate-spin h-4 w-4 mr-2 border-b-2 border-red-400 rounded-full inline-block"></span> : null}
                Delete Forever
              </button>
            </div>
          )}
        </div>

        {/* Filter boxes */}
        <div className="mt-6 flex flex-wrap gap-3">
          {/* Type Filter */}
          <div className="relative filter-dropdown">
            <button
              onClick={() => toggleDropdown('type')}
              className={`px-4 py-2 text-sm font-medium ${selectedType ? 'text-primary-500 bg-primary-500/10' : 'text-dark-100 bg-dark-700'} hover:bg-dark-600 rounded-md transition-colors flex items-center gap-2`}
            >
              Type {selectedType && `(${selectedType})`}
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            {openDropdown === 'type' && (
              <div className="absolute z-10 mt-2 w-48 rounded-md shadow-lg bg-dark-700 ring-1 ring-dark-500 ring-opacity-5">
                <div className="py-1">
                  {typeOptions.map((option) => (
                    <button
                      key={option}
                      onClick={() => handleFilterSelect('type', option)}
                      className={`block px-4 py-2 text-sm w-full text-left ${selectedType === option ? 'bg-primary-500/10 text-primary-500' : 'text-dark-100 hover:bg-dark-600'}`}
                    >
                      {option}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Modified Filter */}
          <div className="relative filter-dropdown">
            <button
              onClick={() => toggleDropdown('modified')}
              className={`px-4 py-2 text-sm font-medium ${selectedModified ? 'text-primary-500 bg-primary-500/10' : 'text-dark-100 bg-dark-700'} hover:bg-dark-600 rounded-md transition-colors flex items-center gap-2`}
            >
              Modified {selectedModified && `(${selectedModified})`}
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            {openDropdown === 'modified' && (
              <div className="absolute z-10 mt-2 w-48 rounded-md shadow-lg bg-dark-700 ring-1 ring-dark-500 ring-opacity-5">
                <div className="py-1">
                  {modifiedOptions.map((option) => (
                    <button
                      key={option}
                      onClick={() => handleFilterSelect('modified', option)}
                      className={`block px-4 py-2 text-sm w-full text-left ${selectedModified === option ? 'bg-primary-500/10 text-primary-500' : 'text-dark-100 hover:bg-dark-600'}`}
                    >
                      {option}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Source Filter */}
          <div className="relative filter-dropdown">
            <button
              onClick={() => toggleDropdown('source')}
              className={`px-4 py-2 text-sm font-medium ${selectedSource ? 'text-primary-500 bg-primary-500/10' : 'text-dark-100 bg-dark-700'} hover:bg-dark-600 rounded-md transition-colors flex items-center gap-2`}
            >
              Source {selectedSource && `(${selectedSource})`}
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            {openDropdown === 'source' && (
              <div className="absolute z-10 mt-2 w-64 rounded-md shadow-lg bg-dark-700 ring-1 ring-dark-500 ring-opacity-5">
                <div className="py-1">
                  {sourceOptions.map((option) => (
                    <button
                      key={option}
                      onClick={() => handleFilterSelect('source', option)}
                      className={`block px-4 py-2 text-sm w-full text-left ${selectedSource === option ? 'bg-primary-500/10 text-primary-500' : 'text-dark-100 hover:bg-dark-600'}`}
                    >
                      {option}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Fiscal Year Filter */}
          <div className="relative filter-dropdown">
            <button
              onClick={() => toggleDropdown('fiscalYear')}
              className={`px-4 py-2 text-sm font-medium ${selectedFiscalYear ? 'text-primary-500 bg-primary-500/10' : 'text-dark-100 bg-dark-700'} hover:bg-dark-600 rounded-md transition-colors flex items-center gap-2`}
            >
              Fiscal Year {selectedFiscalYear && `(${selectedFiscalYear})`}
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            {openDropdown === 'fiscalYear' && (
              <div className="absolute z-10 mt-2 w-48 rounded-md shadow-lg bg-dark-700 ring-1 ring-dark-500 ring-opacity-5">
                <div className="py-1">
                  {fiscalYearOptions.map((option) => (
                    <button
                      key={option}
                      onClick={() => handleFilterSelect('fiscalYear', option)}
                      className={`block px-4 py-2 text-sm w-full text-left ${selectedFiscalYear === option ? 'bg-primary-500/10 text-primary-500' : 'text-dark-100 hover:bg-dark-600'}`}
                    >
                      {option}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Grant Type Filter */}
          <div className="relative filter-dropdown">
            <button
              onClick={() => toggleDropdown('grantType')}
              className={`px-4 py-2 text-sm font-medium ${selectedGrantType ? 'text-primary-500 bg-primary-500/10' : 'text-dark-100 bg-dark-700'} hover:bg-dark-600 rounded-md transition-colors flex items-center gap-2`}
            >
              Grant Type {selectedGrantType && `(${selectedGrantType})`}
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            {openDropdown === 'grantType' && (
              <div className="absolute z-10 mt-2 w-64 rounded-md shadow-lg bg-dark-700 ring-1 ring-dark-500 ring-opacity-5">
                <div className="py-1">
                  {grantTypeOptions.map((option) => (
                    <button
                      key={option}
                      onClick={() => handleFilterSelect('grantType', option)}
                      className={`block px-4 py-2 text-sm w-full text-left ${selectedGrantType === option ? 'bg-primary-500/10 text-primary-500' : 'text-dark-100 hover:bg-dark-600'}`}
                    >
                      {option}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Clear Filters Button */}
          {(selectedType || selectedModified || selectedSource || selectedFiscalYear || selectedGrantType) && (
            <button
              onClick={() => {
                setSelectedType('');
                setSelectedModified('');
                setSelectedSource('');
                setSelectedFiscalYear('');
                setSelectedGrantType('');
              }}
              className="px-4 py-2 text-sm font-medium text-red-400 bg-red-400/10 hover:bg-red-400/20 rounded-md transition-colors flex items-center gap-2"
            >
              Clear Filters
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
      </div>

      <Card>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-4">
            <div className="flex items-center">
              <input
                type="checkbox"
                className="h-4 w-4 text-primary-500 rounded border-dark-500 bg-dark-700 focus:ring-primary-500"
                checked={selectedItems.length === filteredFiles.length + filteredFolders.length}
                onChange={handleSelectAll}
              />
              <span className="ml-2 text-sm text-dark-300">
                {selectedItems.length} selected
              </span>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button 
              onClick={() => setView('list')}
              className={`p-2 rounded-md transition-colors ${view === 'list' ? 'bg-dark-700' : 'hover:bg-dark-700'}`}
            >
              <svg className="w-5 h-5 text-dark-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
              </svg>
            </button>
            <button 
              onClick={() => setView('grid')}
              className={`p-2 rounded-md transition-colors ${view === 'grid' ? 'bg-dark-700' : 'hover:bg-dark-700'}`}
            >
              <svg className="w-5 h-5 text-dark-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
              </svg>
            </button>
          </div>
        </div>

        {view === 'list' ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-dark-600">
              <thead className="bg-dark-800">
                <tr>
                  <th scope="col" className="w-12 px-6 py-3">
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        className="h-4 w-4 text-primary-500 rounded border-dark-500 bg-dark-700 focus:ring-primary-500"
                        checked={selectedItems.length === filteredFiles.length + filteredFolders.length}
                        onChange={handleSelectAll}
                      />
                    </div>
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-dark-300 uppercase tracking-wider">
                    Name
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-dark-300 uppercase tracking-wider">
                    Type
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-dark-300 uppercase tracking-wider">
                    Deleted
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-dark-300 uppercase tracking-wider">
                    Delete After
                  </th>
                </tr>
              </thead>
              <tbody className="bg-dark-700 divide-y divide-dark-600">
                {loading ? (
                  Array(3).fill(0).map((_, index) => (
                    <tr key={index} className="animate-pulse">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="h-4 w-4 bg-dark-600 rounded"></div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="h-4 bg-dark-600 rounded w-3/4"></div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="h-4 bg-dark-600 rounded w-1/2"></div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="h-4 bg-dark-600 rounded w-1/4"></div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="h-4 bg-dark-600 rounded w-1/4"></div>
                      </td>
                    </tr>
                  ))
                ) : (
                  filteredFiles.map((file) => (
                    <tr
                      key={file.id}
                      className="hover:bg-dark-600 transition-colors"
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <input
                            type="checkbox"
                            className="h-4 w-4 text-primary-500 rounded border-dark-500 bg-dark-700 focus:ring-primary-500"
                            checked={selectedItems.some(item => item.id === file.id && item.type === 'file')}
                            onChange={() => handleSelectItem(file.id, 'file')}
                          />
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <FileIcon />
                          <span className="text-sm font-medium text-dark-100">{file.name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-dark-300">
                        {file.type}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-dark-300">
                        {file.deletedAt}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-dark-300">
                        {file.deleteAfter}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {loading ? (
              Array(6).fill(0).map((_, index) => (
                <div key={index} className="animate-pulse">
                  <div className="h-32 bg-dark-700 rounded-lg"></div>
                </div>
              ))
            ) : (
              filteredFiles.map((file) => (
                <motion.div
                  key={file.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2 }}
                  className="relative p-4 bg-dark-700 rounded-lg border border-dark-600"
                >
                  <div className="absolute top-2 left-2">
                    <input
                      type="checkbox"
                      className="h-4 w-4 text-primary-500 rounded border-dark-500 bg-dark-700 focus:ring-primary-500"
                      checked={selectedItems.some(item => item.id === file.id && item.type === 'file')}
                      onChange={() => handleSelectItem(file.id, 'file')}
                    />
                  </div>
                  <div className="flex flex-col space-y-3 mt-4">
                    <div className="flex items-center space-x-3">
                      <FileIcon />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-dark-100 truncate">
                          {file.name}
                        </p>
                      </div>
                    </div>
                    <div className="text-xs text-dark-400 space-y-1">
                      <p>Type: {file.type}</p>
                      <p>Deleted: {file.deletedAt}</p>
                      <p>Delete After: {file.deleteAfter}</p>
                    </div>
                  </div>
                </motion.div>
              ))
            )}
          </div>
        )}
      </Card>
    </>
  );
} 