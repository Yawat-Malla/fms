import { FileStatus } from './types/index';

// File record type
export interface File {
  id: number;
  name: string;
  path: string;
  type: string;
  size: number;
  fiscalYearId?: string | null;
  sourceId?: string | null;
  grantTypeId?: string | null;
  uploadedBy: string;
  uploadedAt: Date | string;
  lastModifiedAt: Date | string;
  status: FileStatus;
}

// Fiscal year type
export interface FiscalYear {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
}

// Source type
export interface Source {
  id: string;
  name: string;
}

// Grant type
export interface GrantType {
  id: string;
  name: string;
}

// User type
export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'data_entry' | 'viewer' | 'auditor';
  createdAt: string;
  lastLogin: string | null;
  active: boolean;
}

// Dashboard stats type
export interface DashboardStats {
  totalFiles: number;
  onlineFiles: number;
  offlineFiles: number;
  fiscalYearData: {
    year: string;
    count: number;
  }[];
  grantTypeData: {
    name: string;
    value: number;
  }[];
  sourceData: {
    name: string;
    value: number;
  }[];
  recentFiles: {
    id: string;
    name: string;
    type: string;
    fiscalYear: string;
    uploadedAt: string;
  }[];
}

// Sync log type
export interface SyncLog {
  id: string;
  startTime: string;
  endTime: string | null;
  status: 'completed' | 'failed' | 'in_progress';
  filesProcessed: number;
  filesSuccess: number;
  filesFailed: number;
  initiatedBy: string;
  notes: string | null;
}

// Report type
export interface Report {
  id: string;
  name: string;
  type: 'file_count' | 'missing_uploads' | 'recently_updated' | 'custom';
  createdAt: string;
  createdBy: string;
  parameters: {
    startDate?: string;
    endDate?: string;
    fiscalYearId?: string;
    sourceId?: string;
    grantTypeId?: string;
    status?: FileStatus;
    limit?: number;
    [key: string]: string | number | FileStatus | undefined;
  };
  fileFormat: 'pdf' | 'excel';
  downloadUrl: string | null;
} 