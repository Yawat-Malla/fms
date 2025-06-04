import React, { HTMLAttributes } from 'react';
import { twMerge } from 'tailwind-merge';

export interface Column<T> {
  key: string;
  title: string;
  dataIndex?: keyof T;
  render?: (record: T, index: number) => React.ReactNode;
  className?: string;
}

interface TableProps<T> extends HTMLAttributes<HTMLTableElement> {
  data: T[];
  columns: Column<T>[];
  loading?: boolean;
  emptyText?: string;
  rowKey?: keyof T | ((record: T) => string);
  onRowClick?: (record: T) => void;
  className?: string;
}

interface TableHeaderProps extends HTMLAttributes<HTMLTableSectionElement> {
  className?: string;
}

interface TableBodyProps extends HTMLAttributes<HTMLTableSectionElement> {
  className?: string;
}

interface TableRowProps extends HTMLAttributes<HTMLTableRowElement> {
  className?: string;
}

interface TableCellProps extends HTMLAttributes<HTMLTableCellElement> {
  className?: string;
}

export function Table<T extends Record<string, any>>({
  data,
  columns,
  loading = false,
  emptyText = 'No data available',
  rowKey = 'id',
  onRowClick,
  className = '',
  ...props
}: TableProps<T>) {
  // Function to get row key
  const getRowKey = (record: T, index: number): string => {
    if (typeof rowKey === 'function') {
      return rowKey(record);
    }
    return String(record[rowKey] ?? index);
  };

  // Empty state
  if (data.length === 0 && !loading) {
    return (
      <div className="flex flex-col justify-center items-center h-40 bg-dark-700 border border-dark-600 rounded-lg">
        <svg className="h-12 w-12 text-dark-400 mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        <p className="text-dark-300">{emptyText}</p>
      </div>
    );
  }

  return (
    <div className={`overflow-hidden border border-dark-600 rounded-lg ${className}`}>
      <div className="overflow-x-auto">
        <table
          className={twMerge(
            'min-w-full divide-y divide-dark-600 dark:divide-dark-700',
            className
          )}
          {...props}
        >
          <TableHeader>
            <tr>
              {columns.map((column) => (
                <TableHeaderCell
                  key={column.key}
                  scope="col"
                  className={`py-3.5 px-4 text-left text-xs font-medium text-dark-300 uppercase tracking-wider ${column.className || ''}`}
                >
                  {column.title}
                </TableHeaderCell>
              ))}
            </tr>
          </TableHeader>
          <TableBody>
            {loading ? (
              // Loading state - show skeleton rows
              Array.from({ length: 5 }).map((_, index) => (
                <TableRow key={index} className="animate-pulse">
                  {columns.map((column) => (
                    <TableCell key={column.key} className="whitespace-nowrap py-4 px-4">
                      <div className="h-4 bg-dark-600 rounded w-full"></div>
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              // Data rows
              data.map((record, index) => (
                <TableRow
                  key={getRowKey(record, index)}
                  className={`${onRowClick ? 'hover:bg-dark-600 cursor-pointer' : ''}`}
                  onClick={onRowClick ? () => onRowClick(record) : undefined}
                >
                  {columns.map((column) => (
                    <TableCell
                      key={column.key}
                      className={`whitespace-nowrap py-4 px-4 text-sm text-dark-200 ${column.className || ''}`}
                    >
                      {column.render
                        ? column.render(record, index)
                        : column.dataIndex
                        ? record[column.dataIndex]
                        : null}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            )}
          </TableBody>
        </table>
      </div>
    </div>
  );
}

export function TableHeader({ className = '', ...props }: TableHeaderProps) {
  return (
    <thead
      className={twMerge(
        'bg-light-100 dark:bg-dark-800',
        className
      )}
      {...props}
    />
  );
}

export function TableBody({ className = '', ...props }: TableBodyProps) {
  return (
    <tbody
      className={twMerge(
        'divide-y divide-dark-600 dark:divide-dark-700 bg-light-50 dark:bg-dark-900',
        className
      )}
      {...props}
    />
  );
}

export function TableRow({ className = '', ...props }: TableRowProps) {
  return (
    <tr
      className={twMerge(
        'hover:bg-light-100 dark:hover:bg-dark-800',
        className
      )}
      {...props}
    />
  );
}

export function TableCell({ className = '', ...props }: TableCellProps) {
  return (
    <td
      className={twMerge(
        'whitespace-nowrap px-6 py-4 text-sm text-dark-900 dark:text-dark-100',
        className
      )}
      {...props}
    />
  );
}

export function TableHeaderCell({ className = '', ...props }: TableCellProps) {
  return (
    <th
      className={twMerge(
        'px-6 py-3 text-left text-xs font-medium text-dark-900 dark:text-dark-100 uppercase tracking-wider',
        className
      )}
      {...props}
    />
  );
}