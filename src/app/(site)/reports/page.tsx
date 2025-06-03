'use client';

import { useState, useEffect } from 'react';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { toast } from 'react-hot-toast';
import { format } from 'date-fns';
import { useSession } from 'next-auth/react';

interface Report {
  id: number;
  name: string;
  type: string;
  createdAt: string;
  fileFormat: 'pdf' | 'excel';
  downloadUrl: string | null;
  user: {
    name: string;
    email: string;
  };
}

export default function ReportsPage() {
  const { data: session } = useSession();
  const [selectedReportType, setSelectedReportType] = useState('file_count');
  const [selectedFormat, setSelectedFormat] = useState('pdf');
  const [isGenerating, setIsGenerating] = useState(false);
  const [reports, setReports] = useState<Report[]>([]);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [selectedFiscalYear, setSelectedFiscalYear] = useState('');
  const [selectedSource, setSelectedSource] = useState('');
  const [selectedGrantType, setSelectedGrantType] = useState('');
  const [loading, setLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);

  const reportTypes = [
    { id: 'file_count', name: 'Files by Year' },
    { id: 'missing_uploads', name: 'Missing Uploads' },
    { id: 'recently_updated', name: 'Recently Updated Files' },
    { id: 'custom', name: 'Custom Report' },
  ] as const;

  // Fetch reports on mount
  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/reports');
      if (!response.ok) throw new Error('Failed to fetch reports');
      const data = await response.json();
      setReports(data);
    } catch (error) {
      console.error('Error fetching reports:', error);
      toast.error('Failed to load reports');
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateReport = async () => {
    try {
    setIsGenerating(true);

      // Validate required fields
      if (!selectedReportType) {
        toast.error('Please select a report type');
        return;
      }

      // Validate date range if selected
      if (startDate && !endDate) {
        toast.error('Please select an end date');
        return;
      }
      if (!startDate && endDate) {
        toast.error('Please select a start date');
        return;
      }
      if (startDate && endDate && new Date(startDate) > new Date(endDate)) {
        toast.error('Start date must be before end date');
        return;
      }

      // Build parameters based on report type
      const parameters: any = {
        startDate,
        endDate,
        fiscalYear: selectedFiscalYear,
        source: selectedSource,
        grantType: selectedGrantType,
      };

      // Add specific parameters based on report type
      if (selectedReportType === 'recently_updated') {
        parameters.days = 30; // Default to last 30 days
      }

      const response = await fetch('/api/reports', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: `${reportTypes.find(r => r.id === selectedReportType)?.name} - ${format(new Date(), 'yyyy-MM-dd')}`,
          type: selectedReportType,
          parameters,
          fileFormat: selectedFormat.toLowerCase(),
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to generate report');
      }

      const report = await response.json();
      toast.success('Report generated successfully');
      
      // Refresh reports list
      fetchReports();

      // Reset form
      setStartDate('');
      setEndDate('');
      setSelectedFiscalYear('');
      setSelectedSource('');
      setSelectedGrantType('');
    } catch (error) {
      console.error('Error generating report:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to generate report');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownload = async (report: Report) => {
    if (!report.downloadUrl) {
      toast.error('Download URL not available');
      return;
    }

    try {
      const response = await fetch(report.downloadUrl);
      if (!response.ok) throw new Error('Failed to download report');

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${report.name}.${report.fileFormat.toLowerCase()}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Error downloading report:', error);
      toast.error('Failed to download report');
    }
  };

  const handleDeleteAllReports = async () => {
    if (!confirm('Are you sure you want to delete all reports? This action cannot be undone.')) {
      return;
    }

    try {
      setIsDeleting(true);
      const response = await fetch('/api/reports/delete-all', {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete reports');
      }

      toast.success('All reports deleted successfully');
      setReports([]); // Clear reports from UI
    } catch (error) {
      console.error('Error deleting reports:', error);
      toast.error('Failed to delete reports');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleDeleteReport = async (report: Report) => {
    if (!confirm(`Are you sure you want to delete the report "${report.name}"? This action cannot be undone.`)) {
      return;
    }

    try {
      const response = await fetch(`/api/reports/${report.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete report');
      }

      toast.success('Report deleted successfully');
      // Remove the deleted report from the state
      setReports(reports.filter(r => r.id !== report.id));
    } catch (error) {
      console.error('Error deleting report:', error);
      toast.error('Failed to delete report');
    }
  };

  return (
    <>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-dark-100">Reports</h1>
        <p className="mt-1 text-dark-300">Generate and download various system reports</p>
      </div>

      {/* Report Generator Card */}
      <Card className="mb-6">
        <h2 className="text-lg font-medium text-dark-100 mb-4">Generate Report</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Report Type Selector */}
          <div>
            <label className="block text-sm font-medium text-dark-200 mb-2">
              Report Type <span className="text-red-500">*</span>
            </label>
            <div className="space-y-2">
              {reportTypes.map((type) => (
                <div key={type.id} className="flex items-center">
                  <input
                    id={type.id}
                    name="report-type"
                    type="radio"
                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-dark-500 bg-dark-700"
                    checked={selectedReportType === type.id}
                    onChange={() => setSelectedReportType(type.id)}
                    required
                  />
                  <label htmlFor={type.id} className="ml-3 block text-sm text-dark-100">
                    {type.name}
                  </label>
                </div>
              ))}
            </div>
          </div>

          {/* Report Options */}
          <div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-dark-200 mb-2">
                Date Range
              </label>
              <div className="flex space-x-4">
                <div className="w-1/2">
                  <label htmlFor="start-date" className="block text-xs text-dark-300 mb-1">
                    Start Date
                  </label>
                  <input
                    type="date"
                    id="start-date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="block w-full rounded-md border-dark-600 bg-dark-800 text-dark-100 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                  />
                </div>
                <div className="w-1/2">
                  <label htmlFor="end-date" className="block text-xs text-dark-300 mb-1">
                    End Date
                  </label>
                  <input
                    type="date"
                    id="end-date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="block w-full rounded-md border-dark-600 bg-dark-800 text-dark-100 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                  />
                </div>
              </div>
            </div>

            {/* Fiscal Year */}
            <div className="mb-4">
              <label htmlFor="fiscal-year" className="block text-sm font-medium text-dark-200 mb-2">
                Fiscal Year
              </label>
              <select
                id="fiscal-year"
                value={selectedFiscalYear}
                onChange={(e) => setSelectedFiscalYear(e.target.value)}
                className="block w-full rounded-md border-dark-600 bg-dark-800 text-dark-100 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
              >
                <option value="">All Fiscal Years</option>
                <option value="2080/81">2080/81</option>
                <option value="2079/80">2079/80</option>
                <option value="2078/79">2078/79</option>
              </select>
            </div>

            {/* Source */}
            <div className="mb-4">
              <label htmlFor="source" className="block text-sm font-medium text-dark-200 mb-2">
                Source
              </label>
              <select
                id="source"
                value={selectedSource}
                onChange={(e) => setSelectedSource(e.target.value)}
                className="block w-full rounded-md border-dark-600 bg-dark-800 text-dark-100 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
              >
                <option value="">All Sources</option>
                <option value="Federal Government">Federal Government</option>
                <option value="Provincial Government">Provincial Government</option>
                <option value="Local Municipality">Local Municipality</option>
                <option value="Other">Other</option>
              </select>
            </div>

            {/* Format */}
              <label className="block text-sm font-medium text-dark-200 mb-2">
              Format <span className="text-red-500">*</span>
              </label>
              <div className="flex space-x-4">
                <div className="flex items-center">
                  <input
                    id="format-pdf"
                    name="format"
                    type="radio"
                    checked={selectedFormat === 'pdf'}
                    onChange={() => setSelectedFormat('pdf')}
                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-dark-500 bg-dark-700"
                  />
                  <label htmlFor="format-pdf" className="ml-3 block text-sm text-dark-100">
                    PDF
                  </label>
                </div>
                <div className="flex items-center">
                  <input
                    id="format-excel"
                    name="format"
                    type="radio"
                    checked={selectedFormat === 'excel'}
                    onChange={() => setSelectedFormat('excel')}
                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-dark-500 bg-dark-700"
                  />
                  <label htmlFor="format-excel" className="ml-3 block text-sm text-dark-100">
                    Excel
                  </label>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6">
          <Button
            variant="primary"
            onClick={handleGenerateReport}
            isLoading={isGenerating}
            leftIcon={
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
              </svg>
            }
          >
            Generate Report
          </Button>
        </div>
      </Card>

      {/* Recent Reports Card */}
      <Card className="mb-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-medium text-dark-100">Recent Reports</h2>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={fetchReports}
              isLoading={loading}
            >
              Refresh
            </Button>
            {reports.length > 0 && (
              <Button
                variant="danger"
                size="sm"
                onClick={handleDeleteAllReports}
                isLoading={isDeleting}
                leftIcon={
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                }
              >
                Delete All
              </Button>
            )}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-dark-600">
            <thead>
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-dark-300 uppercase tracking-wider">
                  Name
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-dark-300 uppercase tracking-wider">
                  Type
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-dark-300 uppercase tracking-wider">
                  Generated By
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-dark-300 uppercase tracking-wider">
                  Generated On
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-dark-300 uppercase tracking-wider">
                  Format
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-dark-300 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-dark-700 divide-y divide-dark-600">
              {loading ? (
                Array(3).fill(0).map((_, index) => (
                  <tr key={index} className="animate-pulse">
                    <td className="px-6 py-4">
                      <div className="h-4 bg-dark-600 rounded w-3/4"></div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="h-4 bg-dark-600 rounded w-1/2"></div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="h-4 bg-dark-600 rounded w-1/2"></div>
                </td>
                    <td className="px-6 py-4">
                      <div className="h-4 bg-dark-600 rounded w-1/4"></div>
                </td>
                    <td className="px-6 py-4">
                      <div className="h-4 bg-dark-600 rounded w-1/4"></div>
                </td>
                    <td className="px-6 py-4">
                      <div className="h-8 bg-dark-600 rounded w-20"></div>
                </td>
                  </tr>
                ))
              ) : reports.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-4 text-center text-dark-300">
                    No reports generated yet
                </td>
              </tr>
              ) : (
                reports.map((report) => (
                  <tr key={report.id} className="hover:bg-dark-600 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-dark-100">
                      {report.name}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-dark-300">
                      {report.type}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-dark-300">
                      {report.user.name}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-dark-300">
                      {format(new Date(report.createdAt), 'MMM d, yyyy h:mm a')}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-dark-300">
                      <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        report.fileFormat === 'pdf' 
                          ? 'bg-red-100/10 text-red-400' 
                          : 'bg-green-100/10 text-green-400'
                      }`}>
                        {report.fileFormat.toUpperCase()}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-dark-300">
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDownload(report)}
                          disabled={!report.downloadUrl}
                        >
                          Download
                        </Button>
                        <Button
                          size="sm"
                          variant="danger"
                          onClick={() => handleDeleteReport(report)}
                        >
                          Delete
                        </Button>
                      </div>
                </td>
              </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Report Templates Card */}
      <Card>
        <h2 className="text-lg font-medium text-dark-100 mb-4">Report Templates</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card interactive className="card-hover">
            <div className="flex items-center">
              <div className="flex-shrink-0 h-10 w-10 bg-primary-100/10 text-primary-400 rounded-md flex items-center justify-center">
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div className="ml-4">
                <h4 className="text-sm font-medium text-dark-100">Monthly Files Summary</h4>
                <p className="text-xs text-dark-300">Files by Year, Month-to-Month</p>
              </div>
            </div>
          </Card>

          <Card interactive className="card-hover">
            <div className="flex items-center">
              <div className="flex-shrink-0 h-10 w-10 bg-blue-100/10 text-blue-400 rounded-md flex items-center justify-center">
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div className="ml-4">
                <h4 className="text-sm font-medium text-dark-100">Quarterly Source Analysis</h4>
                <p className="text-xs text-dark-300">Files by Source, Quarterly</p>
              </div>
            </div>
          </Card>

          <Card interactive className="card-hover">
            <div className="flex items-center">
              <div className="flex-shrink-0 h-10 w-10 bg-yellow-100/10 text-yellow-400 rounded-md flex items-center justify-center">
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div className="ml-4">
                <h4 className="text-sm font-medium text-dark-100">Grant Type Distribution</h4>
                <p className="text-xs text-dark-300">Files by Grant Type, All Time</p>
              </div>
            </div>
          </Card>
        </div>
      </Card>
    </>
  );
} 