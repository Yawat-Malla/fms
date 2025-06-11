'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { FiFile, FiFolder, FiClock, FiX } from 'react-icons/fi';
import { formatDistanceToNow } from 'date-fns';

interface SearchResult {
  id: number;
  name: string;
  path: string;
  isFolder: boolean;
  type?: string;
  size?: number;
  sortDate: Date;
}

interface SearchResultsProps {
  query: string;
  onClose: () => void;
}

export default function SearchResults({ query, onClose }: SearchResultsProps) {
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const searchFiles = async () => {
      if (!query.trim()) {
        setResults([]);
        return;
      }

      setIsLoading(true);
      try {
        const response = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
        if (!response.ok) throw new Error('Search failed');
        const data = await response.json();
        setResults(data);
      } catch (error) {
        console.error('Search error:', error);
      } finally {
        setIsLoading(false);
      }
    };

    const debounceTimer = setTimeout(searchFiles, 300);
    return () => clearTimeout(debounceTimer);
  }, [query]);

  const handleResultClick = (result: SearchResult) => {
    if (result.isFolder) {
      router.push(`/files${result.path}`);
    } else {
      router.push(`/files${result.path}`);
    }
    onClose();
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-[60vh] overflow-y-auto"
    >
      <div className="p-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Search Results</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <FiX className="w-5 h-5" />
          </button>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
          </div>
        ) : results.length > 0 ? (
          <div className="space-y-2">
            {results.map((result) => (
              <motion.button
                key={`${result.isFolder ? 'folder' : 'file'}-${result.id}`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                onClick={() => handleResultClick(result)}
                className="w-full text-left p-3 rounded-lg hover:bg-gray-50 transition-colors duration-200"
              >
                <div className="flex items-center space-x-3">
                  {result.isFolder ? (
                    <FiFolder className="w-5 h-5 text-yellow-500" />
                  ) : (
                    <FiFile className="w-5 h-5 text-blue-500" />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-gray-900 truncate">{result.name}</p>
                    <p className="text-sm text-gray-500 truncate">{result.path}</p>
                  </div>
                  <div className="flex items-center text-sm text-gray-500">
                    <FiClock className="w-4 h-4 mr-1" />
                    {formatDistanceToNow(new Date(result.sortDate), { addSuffix: true })}
                  </div>
                </div>
              </motion.button>
            ))}
          </div>
        ) : query.trim() ? (
          <div className="text-center py-8 text-gray-500">
            No results found for "{query}"
          </div>
        ) : null}
      </div>
    </motion.div>
  );
} 