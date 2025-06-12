'use client';

import { useState, useEffect } from 'react';
import Card from '@/components/ui/Card';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { useApp } from '@/contexts/AppContext';
import { TranslatedText } from '@/components/TranslatedText';

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
  const { language } = useApp();
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<'list' | 'grid'>('list');
  const [selectedItems, setSelectedItems] = useState<{ id: string; type: 'file' | 'folder' }[]>([]);
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

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (openDropdown && !(event.target as Element).closest('.filter-dropdown')) {
        setOpenDropdown(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [openDropdown]);

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

  const toggleDropdown = (dropdown: string) => {
    setOpenDropdown(openDropdown === dropdown ? null : dropdown);
  };

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

  const handleSelectAll = () => {
    if (selectedItems.length === filteredFiles.length + filteredFolders.length) {
      setSelectedItems([]);
    } else {
      setSelectedItems([
        ...filteredFolders.map(f => ({ id: String(f.id), type: 'folder' as const })),
        ...filteredFiles.map(f => ({ id: String(f.id), type: 'file' as const })),
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

  const handleRestore = async () => {
    setActionLoading(true);
    for (const item of selectedItems) {
      const url = item.type === 'file'
        ? `/api/files/${item.id}/restore`
        : `/api/folders/${item.id}/restore`;
      const res = await fetch(url, { method: 'PATCH' });
      if (!res.ok) {
        toast.error('Failed to restore some items');
        setActionLoading(false);
        return;
      }
    }
    toast.success('Restored successfully');
    setSelectedItems([]);
    setActionLoading(false);
    setShowConfirm(null);
    setLoading(true);
    setTimeout(() => {
      fetch('/api/bin')
        .then(res => res.json())
        .then(data => {
          setDeletedFiles(data.files || []);
          setDeletedFolders(data.folders || []);
          setLoading(false);
          window.dispatchEvent(new Event('refresh-folders'));
        });
    }, 300);
  };

  const handleDelete = async () => {
    setActionLoading(true);
    let hasError = false;
    for (const item of selectedItems) {
      const url = item.type === 'file'
        ? `/api/files/${item.id}/forever`
        : `/api/folders/${item.id}/forever`;
      const res = await fetch(url, { method: 'DELETE' });
      if (!res.ok) {
        hasError = true;
        console.error(`Failed to delete ${item.type} with id ${item.id}`);
      }
    }
    setSelectedItems([]);
    setActionLoading(false);
    setShowConfirm(null);
    setLoading(true);
    setTimeout(() => {
      fetch('/api/bin')
        .then(res => res.json())
        .then(data => {
          setDeletedFiles(data.files || []);
          setDeletedFolders(data.folders || []);
          setLoading(false);
          // Check if any of the selected items are still present
          const stillPresent = selectedItems.some(item => {
            if (item.type === 'file') {
              return (data.files || []).some((f: any) => String(f.id) === item.id);
            } else {
              return (data.folders || []).some((f: any) => String(f.id) === item.id);
            }
          });
          if (stillPresent) {
            toast.error('Failed to delete some items');
          } else {
            toast.success('Deleted forever');
          }
        });
    }, 300);
  };

  return (
    <>
      {/* Confirmation Dialog */}
      {showConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-sm">
            <h2 className="text-lg font-semibold text-gray-900 mb-2">
              <TranslatedText text={showConfirm === 'restore' ? 'bin.confirmRestore' : 'bin.confirmDelete'} />
            </h2>
            <p className="text-gray-600 mb-4">
              <TranslatedText text={showConfirm === 'restore' ? 'bin.confirmRestoreMessage' : 'bin.confirmDeleteMessage'} />
            </p>
            <div className="flex justify-end space-x-3">
              <button
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md"
                onClick={() => setShowConfirm(null)}
                disabled={actionLoading}
              >
                <TranslatedText text="common.cancel" />
              </button>
              <button
                className={`px-4 py-2 text-sm font-medium rounded-md ${showConfirm === 'restore' ? 'bg-primary-500 text-white hover:bg-primary-600' : 'bg-red-500 text-white hover:bg-red-600'}`}
                onClick={showConfirm === 'restore' ? handleRestore : handleDelete}
                disabled={actionLoading}
              >
                {actionLoading ? (
                  <span className="flex items-center">
                    <span className="animate-spin h-4 w-4 mr-2 border-b-2 border-white rounded-full"></span>
                    <TranslatedText text="bin.processing" />
                  </span>
                ) : (
                  <TranslatedText text={showConfirm === 'restore' ? 'bin.restore' : 'bin.deleteForever'} />
                )}
              </button>
            </div>
          </div>
        </div>
      )}
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-dark-100">
              <TranslatedText text="bin.title" />
            </h1>
            <p className="text-dark-300">
              <TranslatedText text="bin.subtitle" />
            </p>
          </div>
          {selectedItems.length > 0 && (
            <div className="flex space-x-3">
              <button
                className="px-4 py-2 text-sm font-medium text-white bg-primary-500 hover:bg-primary-600 rounded-md"
                onClick={() => setShowConfirm('restore')}
              >
                <TranslatedText text="bin.restore" />
              </button>
              <button
                className="px-4 py-2 text-sm font-medium text-white bg-red-500 hover:bg-red-600 rounded-md"
                onClick={() => setShowConfirm('delete')}
              >
                <TranslatedText text="bin.deleteForever" />
              </button>
            </div>
          )}
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin h-8 w-8 border-b-2 border-primary-500 rounded-full"></div>
          </div>
        ) : filteredFiles.length + filteredFolders.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-dark-300">
              <TranslatedText text={selectedType || selectedModified || selectedSource || selectedFiscalYear || selectedGrantType ? 'bin.emptyState.noItemsForFilter' : 'bin.emptyState.noItems'} />
            </p>
          </div>
        ) : (
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
                    {selectedItems.length} <TranslatedText text="files.found" />
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
                        <TranslatedText text="files.table.name" />
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-dark-300 uppercase tracking-wider">
                        <TranslatedText text="files.table.type" />
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-dark-300 uppercase tracking-wider">
                        <TranslatedText text="files.table.lastModified" />
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-dark-300 uppercase tracking-wider">
                        <TranslatedText text="files.table.fiscalYear" />
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-dark-300 uppercase tracking-wider">
                        <TranslatedText text="files.table.source" />
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-dark-300 uppercase tracking-wider">
                        <TranslatedText text="files.table.grantType" />
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-dark-700 divide-y divide-dark-600">
                    {filteredFiles.map((file) => (
                      <tr
                        key={file.id}
                        className="hover:bg-dark-600 transition-colors"
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <input
                              type="checkbox"
                              className="h-4 w-4 text-primary-500 rounded border-dark-500 bg-dark-700 focus:ring-primary-500"
                              checked={selectedItems.some(item => item.id === String(file.id) && item.type === 'file')}
                              onChange={() => handleSelectItem(String(file.id), 'file')}
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
                          {file.fiscalYear?.name || '-'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-dark-300">
                          {file.source?.name || '-'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-dark-300">
                          {file.grantType?.name || '-'}
                        </td>
                      </tr>
                    ))}
                    {filteredFolders.map((folder) => (
                      <tr
                        key={folder.id}
                        className="hover:bg-dark-600 transition-colors"
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <input
                              type="checkbox"
                              className="h-4 w-4 text-primary-500 rounded border-dark-500 bg-dark-700 focus:ring-primary-500"
                              checked={selectedItems.some(item => item.id === String(folder.id) && item.type === 'folder')}
                              onChange={() => handleSelectItem(String(folder.id), 'folder')}
                            />
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <FolderIcon />
                            <span className="text-sm font-medium text-dark-100">{folder.name}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-dark-300">
                          {folder.type}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-dark-300">
                          {folder.deletedAt}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-dark-300">
                          {folder.fiscalYear?.name || '-'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-dark-300">
                          {folder.source?.name || '-'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-dark-300">
                          {folder.grantType?.name || '-'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredFiles.map((file) => (
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
                        checked={selectedItems.some(item => item.id === String(file.id) && item.type === 'file')}
                        onChange={() => handleSelectItem(String(file.id), 'file')}
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
                        <p>
                          <TranslatedText text="files.table.type" />: {file.type}
                        </p>
                        <p>
                          <TranslatedText text="files.table.lastModified" />: {file.deletedAt}
                        </p>
                        <p>
                          <TranslatedText text="files.table.fiscalYear" />: {file.fiscalYear?.name || '-'}
                        </p>
                        <p>
                          <TranslatedText text="files.table.source" />: {file.source?.name || '-'}
                        </p>
                        <p>
                          <TranslatedText text="files.table.grantType" />: {file.grantType?.name || '-'}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                ))}
                {filteredFolders.map((folder) => (
                  <motion.div
                    key={folder.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2 }}
                    className="relative p-4 bg-dark-700 rounded-lg border border-dark-600"
                  >
                    <div className="absolute top-2 left-2">
                      <input
                        type="checkbox"
                        className="h-4 w-4 text-primary-500 rounded border-dark-500 bg-dark-700 focus:ring-primary-500"
                        checked={selectedItems.some(item => item.id === String(folder.id) && item.type === 'folder')}
                        onChange={() => handleSelectItem(String(folder.id), 'folder')}
                      />
                    </div>
                    <div className="flex flex-col space-y-3 mt-4">
                      <div className="flex items-center space-x-3">
                        <FolderIcon />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-dark-100 truncate">
                            {folder.name}
                          </p>
                        </div>
                      </div>
                      <div className="text-xs text-dark-400 space-y-1">
                        <p>
                          <TranslatedText text="files.table.type" />: {folder.type}
                        </p>
                        <p>
                          <TranslatedText text="files.table.lastModified" />: {folder.deletedAt}
                        </p>
                        <p>
                          <TranslatedText text="files.table.fiscalYear" />: {folder.fiscalYear?.name || '-'}
                        </p>
                        <p>
                          <TranslatedText text="files.table.source" />: {folder.source?.name || '-'}
                        </p>
                        <p>
                          <TranslatedText text="files.table.grantType" />: {folder.grantType?.name || '-'}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </Card>
        )}
      </div>
    </>
  );
} 