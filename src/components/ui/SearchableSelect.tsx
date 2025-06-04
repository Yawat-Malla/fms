'use client';

import { Fragment, useState, useCallback } from 'react';
import { Listbox, Transition } from '@headlessui/react';
import { ChevronUpDownIcon } from '@heroicons/react/20/solid';

interface Option {
  value: string;
  label: string;
}

interface SearchableSelectProps {
  options: Option[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export default function SearchableSelect({
  options,
  value,
  onChange,
  placeholder = 'Select an option...',
  className = '',
}: SearchableSelectProps) {
  const [query, setQuery] = useState('');

  // Find the selected option based on the value
  const selectedOption = options.find(option => option.value === value);

  // Memoize button classes to prevent hydration mismatch
  const getButtonClasses = useCallback(() => {
    return `relative w-full bg-white dark:bg-dark-700 border border-gray-200 dark:border-dark-600 rounded-lg shadow-sm pl-4 pr-10 py-2.5 text-left cursor-default focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 sm:text-sm cursor-pointer ${className}`;
  }, [className]);

  const filteredOptions =
    query === ''
      ? options
      : options.filter((option) =>
          option.label
            .toLowerCase()
            .replace(/\s+/g, '')
            .includes(query.toLowerCase().replace(/\s+/g, ''))
        );

  return (
    <Listbox value={value} onChange={onChange}>
      {({ open }) => (
        <div className="relative">
          <Listbox.Button className={getButtonClasses()}>
            <span className="block truncate text-gray-900 dark:text-dark-100">
              {selectedOption ? selectedOption.label : placeholder}
            </span>
            <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
              <ChevronUpDownIcon
                className="h-5 w-5 text-gray-400 dark:text-dark-400"
                aria-hidden="true"
              />
            </span>
          </Listbox.Button>

          <Transition
            show={open}
            as={Fragment}
            leave="transition ease-in duration-100"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <Listbox.Options className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white dark:bg-dark-700 py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
              <div className="sticky top-0 z-10 bg-white dark:bg-dark-700 px-3 py-2">
                <input
                  type="text"
                  className="w-full rounded-md border-0 bg-gray-50 dark:bg-dark-600 py-1.5 pl-3 pr-10 text-gray-900 dark:text-dark-100 placeholder-gray-500 dark:placeholder-dark-400 focus:ring-2 focus:ring-primary-500 sm:text-sm sm:leading-6"
                  placeholder="Search..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                />
              </div>

              {filteredOptions.map((option) => (
                <Listbox.Option
                  key={option.value}
                  className={({ active }) =>
                    `relative cursor-default select-none py-2 pl-10 pr-4 ${
                      active 
                        ? 'bg-primary-50 dark:bg-primary-600 text-primary-900 dark:text-white' 
                        : 'text-gray-900 dark:text-dark-100'
                    }`
                  }
                  value={option.value}
                >
                  {({ selected, active }) => (
                    <>
                      <span
                        className={`block truncate ${
                          selected ? 'font-medium' : 'font-normal'
                        }`}
                      >
                        {option.label}
                      </span>
                    </>
                  )}
                </Listbox.Option>
              ))}
            </Listbox.Options>
          </Transition>
        </div>
      )}
    </Listbox>
  );
} 