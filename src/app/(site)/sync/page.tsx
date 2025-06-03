'use client';

import { useState } from 'react';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';

export default function SyncPage() {
  const [syncInProgress, setSyncInProgress] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState<string | null>('2023-12-15 14:30');
  const [autoSync, setAutoSync] = useState(true);

  // Mock sync logs for UI
  const syncLogs = [
    { id: 1, timestamp: '2023-12-15 14:30:22', action: 'Sync Completed', status: 'success', details: '45 files synchronized' },
    { id: 2, timestamp: '2023-12-15 14:29:10', action: 'Upload Files', status: 'success', details: '12 files uploaded' },
    { id: 3, timestamp: '2023-12-15 14:28:55', action: 'Download Updates', status: 'success', details: '3 files updated from server' },
    { id: 4, timestamp: '2023-12-14 10:15:32', action: 'Sync Failed', status: 'error', details: 'Connection timeout' },
    { id: 5, timestamp: '2023-12-13 16:42:18', action: 'Sync Completed', status: 'success', details: '8 files synchronized' },
  ];

  const handleManualSync = () => {
    setSyncInProgress(true);
    // Simulate sync process
    setTimeout(() => {
      setSyncInProgress(false);
      setLastSyncTime(new Date().toLocaleString('en-US', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
      }));
    }, 2500);
  };

  const toggleAutoSync = () => {
    setAutoSync(prev => !prev);
  };

  return (
    <>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-dark-100">Sync</h1>
        <p className="mt-1 text-dark-300">Synchronize your offline data with the central server</p>
      </div>

      {/* Sync Status Card */}
      <Card className="mb-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h2 className="text-lg font-medium text-dark-100">Sync Status</h2>
            <p className="text-dark-300 text-sm mt-1">
              {lastSyncTime ? (
                <>Last synchronized: <span className="text-dark-100">{lastSyncTime}</span></>
              ) : (
                'Never synchronized'
              )}
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              variant="primary"
              onClick={handleManualSync}
              isLoading={syncInProgress}
              leftIcon={
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              }
            >
              Sync Now
            </Button>
          </div>
        </div>

        <div className="mt-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <h3 className="text-dark-100 font-medium">Auto Sync</h3>
              <span className={`ml-2 px-2 py-0.5 text-xs rounded-full ${autoSync ? 'bg-green-100/10 text-green-400' : 'bg-dark-600 text-dark-300'}`}>
                {autoSync ? 'Enabled' : 'Disabled'}
              </span>
            </div>
            <div>
              <button
                type="button"
                className={`relative inline-flex flex-shrink-0 h-6 w-11 border-2 border-transparent rounded-full cursor-pointer transition-colors ease-in-out duration-200 focus:outline-none ${autoSync ? 'bg-primary-600' : 'bg-dark-600'}`}
                role="switch"
                aria-checked={autoSync}
                onClick={toggleAutoSync}
              >
                <span className="sr-only">Auto sync</span>
                <span
                  className={`pointer-events-none relative inline-block h-5 w-5 rounded-full bg-dark-100 shadow transform ring-0 transition ease-in-out duration-200 ${autoSync ? 'translate-x-5' : 'translate-x-0'}`}
                >
                  <span
                    className={`absolute inset-0 h-full w-full flex items-center justify-center transition-opacity ${autoSync ? 'opacity-0 ease-out duration-100' : 'opacity-100 ease-in duration-200'}`}
                    aria-hidden="true"
                  >
                    <svg className="h-3 w-3 text-dark-600" fill="none" viewBox="0 0 12 12">
                      <path d="M4 8l2-2m0 0l2-2M6 6L4 4m2 2l2 2" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </span>
                  <span
                    className={`absolute inset-0 h-full w-full flex items-center justify-center transition-opacity ${autoSync ? 'opacity-100 ease-in duration-200' : 'opacity-0 ease-out duration-100'}`}
                    aria-hidden="true"
                  >
                    <svg className="h-3 w-3 text-primary-600" fill="currentColor" viewBox="0 0 12 12">
                      <path d="M3.707 5.293a1 1 0 00-1.414 1.414l1.414-1.414zM5 8l-.707.707a1 1 0 001.414 0L5 8zm4.707-3.293a1 1 0 00-1.414-1.414l1.414 1.414zm-7.414 2l2 2 1.414-1.414-2-2-1.414 1.414zm3.414 2l4-4-1.414-1.414-4 4 1.414 1.414z" />
                    </svg>
                  </span>
                </span>
              </button>
            </div>
          </div>
          <div className="p-4 bg-dark-800 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <div>
                <span className="text-sm text-dark-300">Sync Frequency:</span>
                <span className="ml-2 text-sm text-dark-100">Every 30 minutes</span>
              </div>
              <Button size="sm" variant="outline">
                Configure
              </Button>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <span className="text-sm text-dark-300">Next Auto Sync:</span>
                <span className="ml-2 text-sm text-dark-100">12:45 PM</span>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Sync Statistics Card */}
      <Card className="mb-6" title="Sync Statistics">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-4 bg-dark-800 rounded-lg">
            <h4 className="text-dark-300 text-sm mb-1">Files Pending Upload</h4>
            <p className="text-2xl font-semibold text-dark-100">7</p>
          </div>
          <div className="p-4 bg-dark-800 rounded-lg">
            <h4 className="text-dark-300 text-sm mb-1">Files Pending Download</h4>
            <p className="text-2xl font-semibold text-dark-100">3</p>
          </div>
          <div className="p-4 bg-dark-800 rounded-lg">
            <h4 className="text-dark-300 text-sm mb-1">Last Successful Sync</h4>
            <p className="text-lg font-semibold text-dark-100">{lastSyncTime || 'Never'}</p>
          </div>
        </div>
      </Card>

      {/* Sync Logs Card */}
      <Card className="mb-6" title="Sync Logs">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-dark-600">
            <thead>
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-dark-300 uppercase tracking-wider">
                  Timestamp
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-dark-300 uppercase tracking-wider">
                  Action
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-dark-300 uppercase tracking-wider">
                  Status
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-dark-300 uppercase tracking-wider">
                  Details
                </th>
              </tr>
            </thead>
            <tbody className="bg-dark-700 divide-y divide-dark-600">
              {syncLogs.map((log) => (
                <tr key={log.id} className="transition-colors hover:bg-dark-600">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-dark-300">
                    {log.timestamp}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-dark-100">
                    {log.action}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      log.status === 'success' ? 'bg-green-100/10 text-green-400' : 'bg-red-100/10 text-red-400'
                    }`}>
                      {log.status === 'success' ? 'Success' : 'Failed'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-dark-300">
                    {log.details}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </>
  );
} 