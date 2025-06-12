'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '@/contexts/AppContext';
import { TranslatedText } from '@/components/TranslatedText';
import { translations } from '@/translations';

interface Option {
  id: string;
  translationKey: string;
  translations?: {
    [key: string]: string;
    en: string;
    ne: string;
  };
}

interface SearchableSelectProps {
  options: Option[];
  value: Option | null;
  onChange: (option: Option | null) => void;
  placeholderTranslationKey: string;
  disabled?: boolean;
  language?: string;
}

export default function SearchableSelect({
  options,
  value,
  onChange,
  placeholderTranslationKey,
  disabled = false,
  language
}: SearchableSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { language: contextLanguage } = useApp();
  const currentLanguage = language || contextLanguage;

  const getOptionLabel = (option: Option) => {
    if (!option) return '';
    
    if (option.translations) {
      return option.translations[currentLanguage as 'en' | 'ne'] || option.translations.en || option.id;
    }
    
    // Fallback to global translations
    const reports: any = translations[currentLanguage as 'en' | 'ne']?.reports;
    const sourceTranslation = reports?.source?.[option.id];
    const grantTypeTranslation = reports?.grantType?.[option.id];
    
    return sourceTranslation || grantTypeTranslation || option.id;
  };

  const filteredOptions = options.filter(option => {
    const label = getOptionLabel(option);
    return label.toLowerCase().includes(searchTerm.toLowerCase());
  });

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => !disabled && setIsOpen(!isOpen)}
        className={`w-full px-3 py-2 text-left border rounded-md ${
          disabled ? 'bg-gray-100 cursor-not-allowed' : 'bg-white cursor-pointer'
        } ${isOpen ? 'border-blue-500' : 'border-gray-300'}`}
        disabled={disabled}
      >
        {value ? (
          <span className="block truncate">{getOptionLabel(value)}</span>
        ) : (
          <span className="block truncate text-gray-500">
            <TranslatedText text={placeholderTranslationKey} />
          </span>
        )}
      </button>

      {isOpen && !disabled && (
        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg">
          <div className="p-2">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="max-h-60 overflow-auto">
            {filteredOptions.length > 0 ? (
              filteredOptions.map((option) => (
                <div
                  key={option.id}
                  onClick={() => {
                    onChange(option);
                    setIsOpen(false);
                    setSearchTerm('');
                  }}
                  className="px-3 py-2 cursor-pointer hover:bg-gray-100"
                >
                  {getOptionLabel(option)}
                </div>
              ))
            ) : (
              <div className="px-3 py-2 text-gray-500">No options found</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
} 