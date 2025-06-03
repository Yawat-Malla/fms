import React from 'react';

export interface Column<T> {
  key: string;
  title: string;
  dataIndex?: keyof T;
  render?: (record: T, index: number) => React.ReactNode;
  className?: string;
}

interface TableProps<T> {
  data: T[];
  columns: Column<T>[];
  loading?: boolean;
  emptyText?: string;
  rowKey?: keyof T | ((record: T) => string);
  onRowClick?: (record: T) => void;
  className?: string;
}

export default function Table<T extends Record<string, any>>({
  data,
  columns,
  loading = false,
  emptyText = 'No data available',
  rowKey = 'id',
  onRowClick,
  className = '',
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
        <table className="min-w-full divide-y divide-dark-600">
          <thead className="bg-dark-800">
            <tr>
              {columns.map((column) => (
                <th
                  key={column.key}
                  scope="col"
                  className={`py-3.5 px-4 text-left text-xs font-medium text-dark-300 uppercase tracking-wider ${column.className || ''}`}
                >
                  {column.title}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-dark-600 bg-dark-700">
            {loading ? (
              // Loading state - show skeleton rows
              Array.from({ length: 5 }).map((_, index) => (
                <tr key={index} className="animate-pulse">
                  {columns.map((column) => (
                    <td key={column.key} className="whitespace-nowrap py-4 px-4">
                      <div className="h-4 bg-dark-600 rounded w-full"></div>
                    </td>
                  ))}
                </tr>
              ))
            ) : (
              // Data rows
              data.map((record, index) => (
                <tr
                  key={getRowKey(record, index)}
                  className={`${onRowClick ? 'hover:bg-dark-600 cursor-pointer' : ''}`}
                  onClick={onRowClick ? () => onRowClick(record) : undefined}
                >
                  {columns.map((column) => (
                    <td
                      key={column.key}
                      className={`whitespace-nowrap py-4 px-4 text-sm text-dark-200 ${column.className || ''}`}
                    >
                      {column.render
                        ? column.render(record, index)
                        : column.dataIndex
                        ? record[column.dataIndex]
                        : null}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}