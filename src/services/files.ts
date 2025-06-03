import { File, FiscalYear, Source, GrantType } from '@/types';
import { FileStatus } from '@/types/index';

// Mock data for files
const MOCK_FILES: File[] = Array(50)
  .fill(null)
  .map((_, index) => {
    const id = index + 1;
    const fileTypes = ['pdf', 'docx', 'xlsx', 'jpg'];
    const fileType = fileTypes[index % fileTypes.length];
    const fileName = `Sample ${fileType.toUpperCase()} File ${id}`;
    const now = new Date().toISOString();

    return {
      id,
      name: fileName,
      path: `/uploads/${fileName.toLowerCase().replace(/\s+/g, '-')}.${fileType}`,
      type: fileType,
      size: Math.floor(Math.random() * 10000000), // Random size up to 10MB
      uploadedAt: now,
      lastModifiedAt: now,
      uploadedBy: 'Test User',
      fiscalYearId: `${(index % 3) + 1}`,
      sourceId: `${(index % 4) + 1}`,
      grantTypeId: `${(index % 3) + 1}`,
      status: index % 2 === 0 ? FileStatus.online : FileStatus.offline,
    };
  });

// Mock fiscal years data
const MOCK_FISCAL_YEARS: FiscalYear[] = [
  {
    id: '2079-80',
    name: 'FY 2079/80',
    startDate: '2079-04-14T00:00:00Z',
    endDate: '2080-04-13T23:59:59Z',
  },
  {
    id: '2080-81',
    name: 'FY 2080/81',
    startDate: '2080-04-14T00:00:00Z',
    endDate: '2081-04-13T23:59:59Z',
  },
  {
    id: '2081-82',
    name: 'FY 2081/82',
    startDate: '2081-04-14T00:00:00Z',
    endDate: '2082-04-13T23:59:59Z',
  },
  {
    id: '2082-83',
    name: 'FY 2082/83',
    startDate: '2082-04-14T00:00:00Z',
    endDate: '2083-04-13T23:59:59Z',
  },
];

// Mock sources data
const MOCK_SOURCES: Source[] = [
  { id: 'federal', name: 'Federal Government' },
  { id: 'provincial', name: 'Provincial Government' },
  { id: 'local', name: 'Local Municipality' },
  { id: 'other', name: 'Other' },
];

// Mock grant types data
const MOCK_GRANT_TYPES: GrantType[] = [
  { id: 'current', name: 'Current Expenditure' },
  { id: 'capital', name: 'Capital Expenditure' },
  { id: 'supplementary', name: 'Supplementary Grant' },
  { id: 'special', name: 'Special Grant' },
  { id: 'other', name: 'Other Grant' },
];

/**
 * Fetch all files with optional filtering
 */
export async function getFiles(filters?: {
  search?: string;
  fiscalYearId?: string;
  sourceId?: string;
  grantTypeId?: string;
  status?: FileStatus;
}): Promise<File[]> {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 500));

  let filteredFiles = [...MOCK_FILES];

  if (filters) {
    if (filters.search) {
      const searchTerm = filters.search.toLowerCase();
      filteredFiles = filteredFiles.filter(
        (file) => file.name.toLowerCase().includes(searchTerm)
      );
    }

    if (filters.fiscalYearId) {
      filteredFiles = filteredFiles.filter(
        (file) => file.fiscalYearId === filters.fiscalYearId
      );
    }

    if (filters.sourceId) {
      filteredFiles = filteredFiles.filter(
        (file) => file.sourceId === filters.sourceId
      );
    }

    if (filters.grantTypeId) {
      filteredFiles = filteredFiles.filter(
        (file) => file.grantTypeId === filters.grantTypeId
      );
    }

    if (filters.status) {
      filteredFiles = filteredFiles.filter(
        (file) => file.status === filters.status
      );
    }
  }

  return filteredFiles;
}

/**
 * Get file by ID
 */
export async function getFileById(id: string): Promise<File | null> {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 300));
  
  const file = MOCK_FILES.find((file) => file.id === parseInt(id));
  return file || null;
}

/**
 * Get all fiscal years
 */
export async function getFiscalYears(): Promise<FiscalYear[]> {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 200));
  
  return MOCK_FISCAL_YEARS;
}

/**
 * Get all sources
 */
export async function getSources(): Promise<Source[]> {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 200));
  
  return MOCK_SOURCES;
}

/**
 * Get all grant types
 */
export async function getGrantTypes(): Promise<GrantType[]> {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 200));
  
  return MOCK_GRANT_TYPES;
}

/**
 * Upload files with metadata
 */
export async function uploadFiles(data: {
  files: File[];
  title: string;
  description?: string;
  fiscalYearId: string;
  sourceId: string;
  grantTypeId: string;
}): Promise<{ success: boolean; fileIds: string[] }> {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 1500));
  
  // In a real app, this would handle file uploads and return the created file IDs
  return {
    success: true,
    fileIds: Array(data.files.length)
      .fill(null)
      .map((_, i) => `new-${Date.now()}-${i}`),
  };
}

export const deleteFile = async (id: string): Promise<boolean> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 800));
  
  // Find the file first
  const file = MOCK_FILES.find((file) => file.id === parseInt(id));
  if (!file) {
    return false;
  }
  
  // Simulate delete success (95% success rate)
  return Math.random() > 0.05;
}; 