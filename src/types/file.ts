export interface File {
  id: string;
  name: string;
  type: string;
  size: number;
  createdAt: Date;
  lastModifiedAt: Date;
  fiscalYear?: {
    id: string;
    name: string;
  };
  source?: {
    id: string;
    name: string;
  };
  grantType?: {
    id: string;
    name: string;
  };
}

export interface Folder {
  id: string;
  name: string;
  createdAt: Date;
  fiscalYear?: {
    id: string;
    name: string;
  };
  source?: {
    id: string;
    name: string;
  };
  grantType?: {
    id: string;
    name: string;
  };
} 