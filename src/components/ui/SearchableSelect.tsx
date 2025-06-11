'use client';

import { Fragment, useState } from 'react';
import { Listbox, Transition } from '@headlessui/react';
import { ChevronUpDownIcon } from '@heroicons/react/20/solid';
import { TranslatedText } from '@/components/TranslatedText';

interface Option {
  id?: string;
  name?: string;
  value?: string;
  label?: string;
  translationKey?: string;
}

interface SearchableSelectProps {
  options: Option[];
  value: Option | null;
  onChange: (value: Option) => void;
  placeholder?: string;
  placeholderTranslationKey?: string;
  disabled?: boolean;
}

export default function SearchableSelect({
  options,
  value,
  onChange,
  placeholder = 'Select an option...',
  placeholderTranslationKey,
  disabled = false,
}: SearchableSelectProps) {
  const [query, setQuery] = useState('');

  const getOptionLabel = (option: Option) => {
    if (option.translationKey) {
      return <TranslatedText text={option.translationKey} />;
    }
    return option.name || option.label || '';
  };

  const getOptionValue = (option: Option) => {
    return option.id || option.value || '';
  };

  const filteredOptions =
    query === ''
      ? options
      : options.filter((option) => {
          const label = option.name || option.label || '';
          return label
            .toLowerCase()
            .replace(/\s+/g, '')
            .includes(query.toLowerCase().replace(/\s+/g, ''));
        });

  return (
    <div className="relative">
      <Listbox value={value} onChange={onChange} disabled={disabled}>
        <div className="relative">
          <Listbox.Button className="relative w-full bg-white border border-gray-200 rounded-lg shadow-sm pl-4 pr-10 py-2.5 text-left cursor-default focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 sm:text-sm">
            <span className="block truncate text-gray-900">
              {value ? (
                getOptionLabel(value)
              ) : placeholderTranslationKey ? (
                <TranslatedText text={placeholderTranslationKey} />
              ) : (
                placeholder
              )}
            </span>
            <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
              <ChevronUpDownIcon
                className="h-5 w-5 text-gray-400"
                aria-hidden="true"
              />
            </span>
          </Listbox.Button>

          <Transition
            as={Fragment}
            leave="transition ease-in duration-100"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <Listbox.Options className="absolute z-50 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
              <div className="sticky top-0 z-10 bg-white px-3 py-2">
                <input
                  type="text"
                  className="w-full rounded-md border border-gray-200 bg-white py-1.5 pl-3 pr-10 text-gray-900 focus:ring-2 focus:ring-primary-500 sm:text-sm sm:leading-6"
                  placeholder="Search..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                />
              </div>

              {filteredOptions.length === 0 ? (
                <div className="relative cursor-default select-none py-2 pl-10 pr-4 text-gray-500">
                  <TranslatedText text="common.noOptionsFound" />
                </div>
              ) : (
                filteredOptions.map((option) => (
                <Listbox.Option
                    key={getOptionValue(option)}
                  className={({ active }) =>
                    `relative cursor-default select-none py-2 pl-10 pr-4 ${
                        active ? 'bg-primary-50 text-primary-900' : 'text-gray-900'
                    }`
                  }
                  value={option}
                >
                  {({ selected, active }) => (
                      <div className="flex items-center">
                        <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                          {selected && (
                            <svg className="h-5 w-5 text-primary-600" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                          )}
                        </span>
                        <span className={`block truncate ${selected ? 'font-medium' : 'font-normal'}`}>
                          {getOptionLabel(option)}
                      </span>
                      </div>
                  )}
                </Listbox.Option>
                ))
              )}
            </Listbox.Options>
          </Transition>
        </div>
    </Listbox>
    </div>
  );
} 