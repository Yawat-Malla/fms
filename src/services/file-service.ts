import { IFile, IFilterOptions, IFileUploadResponse, FileStatus } from "@/types/index";

// Mock data - in a real app this would come from an API
const mockFiles: IFile[] = Array(20).fill(null).map((_, index) => {
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
    description: `This is a sample ${fileType.toUpperCase()} file for testing purposes.`,
    uploadedAt: now,
    lastModifiedAt: now,
    uploadedBy: 'Test User',
    fiscalYear: { id: `${(index % 3) + 1}`, name: `FY${2023 + (index % 3)}` },
    source: { id: `${(index % 4) + 1}`, name: `Source ${(index % 4) + 1}` },
    grantType: { id: `${(index % 3) + 1}`, name: `Grant Type ${(index % 3) + 1}` },
    status: index % 2 === 0 ? FileStatus.online : FileStatus.offline,
    fiscalYearId: `${(index % 3) + 1}`,
    sourceId: `${(index % 4) + 1}`,
    grantTypeId: `${(index % 3) + 1}`,
  };
});

// Get all files
export const getFiles = async (): Promise<IFile[]> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1000));
  return mockFiles;
};

// Get a single file by ID
export const getFileById = async (id: string): Promise<IFile | null> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 500));
  return mockFiles.find(file => file.id === parseInt(id)) || null;
};

// Get filter options
export const getFilterOptions = async (): Promise<IFilterOptions> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 300));
  
  return {
    fiscalYears: Array.from(new Set(mockFiles.map(file => file.fiscalYear?.name || ''))).filter(Boolean),
    sources: Array.from(new Set(mockFiles.map(file => file.source?.name || ''))).filter(Boolean),
    grantTypes: Array.from(new Set(mockFiles.map(file => file.grantType?.name || ''))).filter(Boolean),
    fileTypes: Array.from(new Set(mockFiles.map(file => file.type))),
  };
};

// Upload a file
interface FileMetadata {
  description?: string;
  fiscalYear?: string;
  source?: string;
  grantType?: string;
  fiscalYearId?: string;
  sourceId?: string;
  grantTypeId?: string;
}

export const uploadFile = async (file: File, metadata: FileMetadata): Promise<IFileUploadResponse> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1200));
  
  // Simulate upload success (90% success rate)
  if (Math.random() > 0.1) {
    const newFile: IFile = {
      id: mockFiles.length + 1,
      name: file.name,
      path: `/uploads/${file.name.toLowerCase().replace(/\s+/g, '-')}`,
      type: file.name.split('.').pop() || '',
      size: file.size,
      description: metadata.description || null,
      uploadedAt: new Date().toISOString(),
      lastModifiedAt: new Date().toISOString(),
      uploadedBy: 'Current User',
      fiscalYear: metadata.fiscalYear ? { id: metadata.fiscalYear, name: metadata.fiscalYear } : undefined,
      source: metadata.source ? { id: metadata.source, name: metadata.source } : undefined,
      grantType: metadata.grantType ? { id: metadata.grantType, name: metadata.grantType } : undefined,
      status: FileStatus.online,
      fiscalYearId: metadata.fiscalYearId,
      sourceId: metadata.sourceId,
      grantTypeId: metadata.grantTypeId,
    };
    
    // In a real app, we'd add this to the database
    // For our mock, we'll just return it
    return {
      success: true,
      file: newFile,
    };
  }
  
  // Simulate upload failure
  return {
    success: false,
    error: 'Failed to upload file. Please try again.'
  };
};

// Delete a file
export const deleteFile = async (id: string): Promise<boolean> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 800));
  
  // Find the file first
  const file = mockFiles.find(file => file.id === parseInt(id));
  if (!file) {
    return false;
  }
  
  // Simulate delete success (95% success rate)
  return Math.random() > 0.05;
}; 