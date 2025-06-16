'use client';

import { useState, useEffect } from 'react';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { toast } from 'react-hot-toast';
import { format } from 'date-fns';
import { useSession } from 'next-auth/react';
import { generateFiscalYears } from '@/utils/fiscalYears';
import { useApp } from '@/contexts/AppContext';
import { TranslatedText } from '@/components/TranslatedText';
import { translations } from '@/translations';
import SearchableSelect from '@/components/ui/SearchableSelect';

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
  const { language } = useApp();
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
  const [fiscalYears, setFiscalYears] = useState<{ id: string; name: string; }[]>([]);
  const [sourceOptions, setSourceOptions] = useState<{ id: string; translationKey: string; translations: any; }[]>([]);
  const [grantTypeOptions, setGrantTypeOptions] = useState<{ id: string; translationKey: string; translations: any; }[]>([]);

  const reportTypes = [
    { id: 'folder_count', name: 'reports.types.folder_count' },
    { id: 'empty_folders', name: 'reports.types.empty_folders' },
    { id: 'folder_metadata', name: 'reports.types.folder_metadata' },
    { id: 'custom', name: 'reports.types.custom' },
  ] as const;

  // Initialize fiscal years
  useEffect(() => {
    setFiscalYears(generateFiscalYears());
  }, []);

  // Fetch sources and grant types
  useEffect(() => {
    const fetchOptions = async () => {
      try {
        const sourcesRes = await fetch('/api/admin/sources');
        const sourcesData = await sourcesRes.json();
        setSourceOptions(sourcesData.map((source: any) => ({
          id: source.key,
          translationKey: `reports.sources.${source.key}`,
          translations: source.translations
        })));

        const grantTypesRes = await fetch('/api/admin/grant-types');
        const grantTypesData = await grantTypesRes.json();
        setGrantTypeOptions(grantTypesData.map((grant: any) => ({
          id: grant.key,
          translationKey: `reports.grant_types.${grant.key}`,
          translations: grant.translations
        })));
      } catch (error) {
        console.error('Error fetching options:', error);
        toast.error('Failed to load options');
      }
    };
    fetchOptions();
  }, []);

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
      toast.error(translations[language].reports.errors.generateFailed);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateReport = async () => {
    try {
    setIsGenerating(true);

      // Validate required fields
      if (!selectedReportType) {
        toast.error(translations[language].reports.errors.selectReportType);
        return;
      }

      // Validate date range if selected
      if (startDate && !endDate) {
        toast.error(translations[language].reports.errors.selectEndDate);
        return;
      }
      if (!startDate && endDate) {
        toast.error(translations[language].reports.errors.selectStartDate);
        return;
      }
      if (startDate && endDate && new Date(startDate) > new Date(endDate)) {
        toast.error(translations[language].reports.errors.invalidDateRange);
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
          name: `${translations[language].reports.types[selectedReportType as keyof typeof translations[typeof language]['reports']['types']]} - ${format(new Date(), 'yyyy-MM-dd')}`,
          type: selectedReportType,
          parameters,
          fileFormat: selectedFormat.toLowerCase(),
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || translations[language].reports.errors.generateFailed);
      }

      const report = await response.json();
      toast.success(translations[language].reports.success.generated);
      
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
      toast.error(error instanceof Error ? error.message : translations[language].reports.errors.generateFailed);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownload = async (report: Report) => {
    if (!report.downloadUrl) {
      toast.error(translations[language].reports.errors.downloadFailed);
      return;
    }

    try {
      const response = await fetch(report.downloadUrl);
      if (!response.ok) throw new Error(translations[language].reports.errors.downloadFailed);

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${report.name}.${report.fileFormat.toLowerCase()}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      toast.success(translations[language].reports.success.downloaded);
    } catch (error) {
      console.error('Error downloading report:', error);
      toast.error(translations[language].reports.errors.downloadFailed);
    }
  };

  const handleView = async (report: Report) => {
    if (!report.downloadUrl) {
      toast.error(translations[language].reports.errors.downloadFailed);
      return;
    }

    try {
      window.open(report.downloadUrl, '_blank');
    } catch (error) {
      console.error('Error viewing report:', error);
      toast.error(translations[language].reports.errors.downloadFailed);
    }
  };

  const handleDeleteAllReports = async () => {
    if (!confirm(translations[language].reports.confirmDeleteAllMessage)) {
      return;
    }

    try {
      setIsDeleting(true);
      const response = await fetch('/api/reports/delete-all', {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error(translations[language].reports.errors.deleteAllFailed);
      }

      toast.success(translations[language].reports.success.deletedAll);
      setReports([]); // Clear reports from UI
    } catch (error) {
      console.error('Error deleting reports:', error);
      toast.error(translations[language].reports.errors.deleteAllFailed);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleDeleteReport = async (report: Report) => {
    if (!confirm(translations[language].reports.confirmDeleteMessage.replace('{name}', report.name))) {
      return;
    }

    try {
      const response = await fetch(`/api/reports/${report.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error(translations[language].reports.errors.deleteFailed);
      }

      toast.success(translations[language].reports.success.deleted);
      // Remove the deleted report from the state
      setReports(reports.filter(r => r.id !== report.id));
    } catch (error) {
      console.error('Error deleting report:', error);
      toast.error(translations[language].reports.errors.deleteFailed);
    }
  };

  const handleRefresh = async () => {
    await fetchReports();
  };

  return (
    <>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-dark-100">
          <TranslatedText text="reports.title" />
        </h1>
        <p className="mt-1 text-dark-300">
          <TranslatedText text="reports.subtitle" />
        </p>
      </div>

      {/* Report Generator Card */}
      <Card className="mb-6">
        <h2 className="text-lg font-medium text-dark-100 mb-4">
          <TranslatedText text="reports.generateReport" />
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Report Type Selector */}
          <div>
            <label className="block text-sm font-medium text-dark-200 mb-2">
              <TranslatedText text="reports.reportType" /> <span className="text-red-500">*</span>
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
                    <TranslatedText text={type.name} />
                  </label>
                </div>
              ))}
            </div>
          </div>

          {/* Report Options */}
          <div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-dark-200 mb-2">
                <TranslatedText text="reports.dateRange" />
              </label>
              <div className="flex space-x-4">
                <div className="w-1/2">
                  <label htmlFor="start-date" className="block text-xs text-dark-300 mb-1">
                    <TranslatedText text="reports.startDate" />
                  </label>
                  <input
                    type="date"
                    id="start-date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    disabled={selectedReportType !== 'custom'}
                    className={`block w-full rounded-md border-dark-600 bg-dark-800 text-dark-100 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm ${
                      selectedReportType !== 'custom' ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                  />
                </div>
                <div className="w-1/2">
                  <label htmlFor="end-date" className="block text-xs text-dark-300 mb-1">
                    <TranslatedText text="reports.endDate" />
                  </label>
                  <input
                    type="date"
                    id="end-date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    disabled={selectedReportType !== 'custom'}
                    className={`block w-full rounded-md border-dark-600 bg-dark-800 text-dark-100 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm ${
                      selectedReportType !== 'custom' ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                  />
                </div>
              </div>
            </div>

            {/* Fiscal Year */}
            <div className="mb-4">
              <label htmlFor="fiscal-year" className="block text-sm font-medium text-dark-200 mb-2">
                <TranslatedText text="reports.fiscalYear" />
              </label>
              <select
                id="fiscal-year"
                value={selectedFiscalYear}
                onChange={(e) => setSelectedFiscalYear(e.target.value)}
                disabled={selectedReportType !== 'custom'}
                className={`block w-full rounded-md border-dark-600 bg-dark-800 text-dark-100 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm ${
                  selectedReportType !== 'custom' ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                <option value=""><TranslatedText text="files.filters.allFiscalYears" /></option>
                {fiscalYears.map((year) => (
                  <option key={year.id} value={year.name}>
                    {year.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Source */}
            <div className="mb-4">
              <label htmlFor="source" className="block text-sm font-medium text-dark-200 mb-2">
                <TranslatedText text="reports.source" />
              </label>
              <SearchableSelect
                options={sourceOptions}
                value={selectedSource ? { id: selectedSource, translationKey: `reports.sources.${selectedSource}` } : null}
                onChange={(option) => setSelectedSource(option?.id || '')}
                placeholderTranslationKey="reports.selectSource"
                disabled={selectedReportType !== 'custom'}
                language={language}
              />
            </div>

            {/* Grant Type */}
            <div className="mb-4">
              <label htmlFor="grant-type" className="block text-sm font-medium text-dark-200 mb-2">
                <TranslatedText text="reports.grantType" />
              </label>
              <SearchableSelect
                options={grantTypeOptions}
                value={selectedGrantType ? { id: selectedGrantType, translationKey: `reports.grant_types.${selectedGrantType}` } : null}
                onChange={(option) => setSelectedGrantType(option?.id || '')}
                placeholderTranslationKey="reports.selectGrantType"
                disabled={selectedReportType !== 'custom'}
                language={language}
              />
            </div>

            {/* Format */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-dark-200 mb-2">
                <TranslatedText text="reports.fileFormat" /> <span className="text-red-500">*</span>
              </label>
              <div className="space-y-2">
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
                    <TranslatedText text="reports.formats.pdf" />
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
                    <TranslatedText text="reports.formats.excel" />
                  </label>
                </div>
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
            {isGenerating ? (
              <TranslatedText text="reports.generating" />
            ) : (
              <TranslatedText text="reports.generate" />
            )}
          </Button>
        </div>
      </Card>

      {/* Recent Reports Card */}
      <Card className="mb-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-medium text-dark-100">
            <TranslatedText text="reports.title" />
          </h2>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={handleRefresh}
              className="ml-2"
            >
              <TranslatedText text="reports.buttons.refresh" />
            </Button>
            {reports.length > 0 && session?.user?.role !== 'viewer' && (
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
                <TranslatedText text="reports.deleteAll" />
              </Button>
            )}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-dark-600">
            <thead>
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-dark-300 uppercase tracking-wider">
                  <TranslatedText text="files.table.name" />
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-dark-300 uppercase tracking-wider">
                  <TranslatedText text="files.table.type" />
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-dark-300 uppercase tracking-wider">
                  <TranslatedText text="files.table.uploadedBy" />
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-dark-300 uppercase tracking-wider">
                  <TranslatedText text="files.table.uploadedAt" />
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-dark-300 uppercase tracking-wider">
                  <TranslatedText text="reports.fileFormat" />
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-dark-300 uppercase tracking-wider">
                  <TranslatedText text="files.table.actions" />
                </th>
              </tr>
            </thead>
            <tbody>
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
                    <TranslatedText text="files.emptyState.noFiles" />
                  </td>
                </tr>
              ) : (
                reports.map((report) => (
                  <tr key={report.id} className="hover:bg-dark-600 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-dark-100">
                      {report.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-dark-300">
                      <TranslatedText text={`reports.types.${report.type}`} />
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
                        <TranslatedText text={`reports.formats.${report.fileFormat}`} />
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
                          <TranslatedText text="reports.download" />
                        </Button>
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => handleView(report)}
                          disabled={!report.downloadUrl}
                        >
                          <TranslatedText text="reports.view" />
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
    </>
  );
} 