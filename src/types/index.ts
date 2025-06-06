// File metadata types
export interface FileMetadata {
  id: string;
  name: string;
  type: string;
  size: number;
  createdAt: string;
  updatedAt: string;
  fiscalYear: string;
  grantType: string;
  syncStatus: 'online' | 'offline';
}

// Dashboard data types
export interface FiscalYearSummary {
  year: string;
  files: number;
}

export interface GrantTypeSummary {
  name: string;
  value: number;
}

export interface DashboardStats {
  totalFiles: number;
  onlineFiles: number;
  offlineFiles: number;
  fiscalYearData: FiscalYearSummary[];
  grantTypeData: GrantTypeSummary[];
}

// File type
export enum FileStatus {
  online = 'online',
  offline = 'offline'
}

export interface IFile {
  id: number;
  name: string;
  path: string;
  type: string;
  size: number;
  status: FileStatus;
  description?: string | null;
  uploadedAt: Date | string;
  lastModifiedAt: Date | string;
  uploadedBy: string;
  fiscalYear?: {
    id: string;
    name: string;
  } | null;
  source?: {
    id: string;
    name: string;
  } | null;
  grantType?: {
    id: string;
    name: string;
  } | null;
  fiscalYearId?: string | null;
  sourceId?: string | null;
  grantTypeId?: string | null;
  user?: {
    name: string;
  };
}

// User type
export interface IUser {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'editor' | 'viewer';
  avatar?: string;
  createdAt: string;
  lastLogin?: string;
  status: 'active' | 'inactive' | 'suspended';
}

// Dashboard stats
export interface IDashboardStats {
  totalFiles: number;
  totalSize: number;
  totalUsers: number;
  recentUploads: number;
  filesByType: Record<string, number>;
  uploadTrend: Array<{date: string, count: number}>;
}

// Filter options
export interface IFilterOptions {
  fiscalYears: string[];
  sources: string[];
  grantTypes: string[];
  fileTypes: string[];
}

// File upload response
export interface IFileUploadResponse {
  success: boolean;
  file?: IFile;
  error?: string;
} 