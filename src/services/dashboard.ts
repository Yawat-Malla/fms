import { DashboardStats } from "@/types";

// Mock dashboard data
const MOCK_DASHBOARD_DATA: DashboardStats = {
  totalFiles: 333,
  onlineFiles: 298,
  offlineFiles: 35,
  fiscalYearData: [
    { year: 'FY 2079/80', count: 87 },
    { year: 'FY 2080/81', count: 123 },
    { year: 'FY 2081/82', count: 78 },
    { year: 'FY 2082/83', count: 45 },
  ],
  grantTypeData: [
    { name: 'Current Expenditure', value: 125 },
    { name: 'Capital Expenditure', value: 86 },
    { name: 'Supplementary Grant', value: 44 },
    { name: 'Special Grant', value: 36 },
    { name: 'Other Grants', value: 42 },
  ],
  sourceData: [
    { name: 'Federal Government', value: 143 },
    { name: 'Provincial Government', value: 112 },
    { name: 'Local Municipality', value: 78 },
  ],
  recentFiles: [
    {
      id: '1',
      name: 'Budget_Report.pdf',
      type: 'PDF',
      fiscalYear: 'FY 2080/81',
      uploadedAt: '2023-04-15T10:30:00Z',
    },
    {
      id: '2',
      name: 'Annual_Report_2080.pdf',
      type: 'PDF',
      fiscalYear: 'FY 2080/81',
      uploadedAt: '2023-04-15T08:45:00Z',
    },
    {
      id: '3',
      name: 'Municipality_Grant_Q3.xlsx',
      type: 'XLSX',
      fiscalYear: 'FY 2080/81',
      uploadedAt: '2023-04-14T14:20:00Z',
    },
    {
      id: '4',
      name: 'Federal_Funding_Report.pdf',
      type: 'PDF',
      fiscalYear: 'FY 2079/80',
      uploadedAt: '2023-04-13T09:15:00Z',
    },
    {
      id: '5',
      name: 'Capital_Projects_2079.xlsx',
      type: 'XLSX',
      fiscalYear: 'FY 2079/80',
      uploadedAt: '2023-04-12T16:30:00Z',
    },
  ],
};

/**
 * Fetch dashboard statistics
 * In a real application, this would make an API call to the backend
 */
export async function getDashboardStats(): Promise<DashboardStats> {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 800));
  
  return MOCK_DASHBOARD_DATA;
} 