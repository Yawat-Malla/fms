'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import FileUploader from '@/components/features/FileUploader';
import { motion, AnimatePresence } from 'framer-motion';
import { FiFileText, FiUpload, FiChevronRight, FiChevronLeft, FiCheckCircle } from 'react-icons/fi';
import { toast } from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import SearchableSelect from '@/components/ui/SearchableSelect';
import { generateFiscalYears } from '@/utils/fiscalYears';

// Define sources to match exactly with database records
const SOURCES = [
  { value: 'Federal Government', label: 'Federal Government' },
  { value: 'Provincial Government', label: 'Provincial Government' },
  { value: 'Local Municipality', label: 'Local Municipality' },
  { value: 'Other', label: 'Other' },
];

// Define grant types to match exactly with database records
const GRANT_TYPES = [
  { value: 'Current Expenditure', label: 'Current Expenditure' },
  { value: 'Capital Expenditure', label: 'Capital Expenditure' },
  { value: 'Supplementary Grant', label: 'Supplementary Grant' },
  { value: 'Special Grant', label: 'Special Grant' },
  { value: 'Other Grant', label: 'Other Grant' },
];

const steps = [
  {
    label: 'Metadata Entry',
    icon: <FiFileText className="h-5 w-5" />,
  },
  {
    label: 'Document Upload',
    icon: <FiUpload className="h-5 w-5" />,
  },
];

const UploadPage = () => {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [a4Files, setA4Files] = useState<File[]>([]);
  const [nepaliFiles, setNepaliFiles] = useState<File[]>([]);
  const [extraFiles, setExtraFiles] = useState<File[]>([]);
  const [otherFiles, setOtherFiles] = useState<File[]>([]);
  const [fiscalYear, setFiscalYear] = useState('');
  const [source, setSource] = useState('');
  const [grantType, setGrantType] = useState('');
  const [title, setTitle] = useState('');
  const [remarks, setRemarks] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, staggerChildren: 0.1 },
    },
  };
  const itemVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: {
      opacity: 1,
      x: 0,
      transition: { duration: 0.3, ease: 'easeOut' },
    },
  };

  // Get fiscal years
  const fiscalYears = generateFiscalYears().map(year => ({
    value: year.id,
    label: year.name
  }));

  const canGoNext = () => {
    if (step === 0) {
      return title && fiscalYear && source && grantType;
    }
    if (step === 1) {
      // At least one section can have files, but not required
      return true;
    }
    return false;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('title', title);
      formData.append('fiscalYear', fiscalYear);
      formData.append('source', source);
      formData.append('grantType', grantType);
      formData.append('remarks', remarks);
      
      // Append files with their section-specific keys
      a4Files.forEach(file => {
        formData.append('a4Files', file);
      });
      nepaliFiles.forEach(file => {
        formData.append('nepaliFiles', file);
      });
      extraFiles.forEach(file => {
        formData.append('extraFiles', file);
      });
      otherFiles.forEach(file => {
        formData.append('otherFiles', file);
      });

      // Send request to API
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Error uploading files');
      }
      toast.success('Files uploaded successfully');
      setIsSuccess(true);
      setTimeout(() => {
        setIsSuccess(false);
        setStep(0);
        setA4Files([]);
        setNepaliFiles([]);
        setExtraFiles([]);
        setOtherFiles([]);
        setFiscalYear('');
        setSource('');
        setGrantType('');
        setTitle('');
        setRemarks('');
        router.refresh();
      }, 3000);
    } catch (error) {
      console.error('Upload error:', error);
      toast.error(error instanceof Error ? error.message : 'Error uploading files');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="max-w-6xl mx-auto px-2 sm:px-6 lg:px-8 py-10 flex gap-8 min-h-screen"
    >
      {/* Stepper Sidebar */}
      <aside className="w-64 min-w-[220px] bg-white dark:bg-dark-800 rounded-2xl p-8 flex flex-col items-start shadow-lg h-fit sticky top-4 border border-gray-200 dark:border-dark-700">
        <h2 className="text-lg font-bold text-gray-900 dark:text-dark-100 mb-8 tracking-wide">Upload Files</h2>
        <ol className="space-y-6 w-full overflow-y-auto max-h-[calc(100vh-16rem)]">
          {steps.map((s, idx) => (
            <li key={s.label} className="flex items-center gap-4">
              <div
                className={`flex items-center justify-center h-8 w-8 rounded-full border-2 transition-all duration-200 ${
                  idx < step
                    ? 'bg-primary-500 border-primary-500 text-white'
                    : idx === step
                    ? 'bg-gray-100 dark:bg-dark-700 border-primary-500 text-primary-500'
                    : 'bg-gray-100 dark:bg-dark-700 border-gray-200 dark:border-dark-600 text-gray-400 dark:text-dark-400'
                }`}
              >
                {idx < step ? <FiCheckCircle className="h-5 w-5" /> : s.icon}
              </div>
              <span
                className={`text-base font-medium transition-colors duration-200 ${
                  idx === step
                    ? 'text-primary-500'
                    : idx < step
                    ? 'text-gray-900 dark:text-dark-100'
                    : 'text-gray-500 dark:text-dark-400'
                }`}
              >
                {s.label}
              </span>
            </li>
          ))}
        </ol>
      </aside>

      {/* Main Content */}
      <main className="flex-1">
        <AnimatePresence mode="wait">
          {isSuccess ? (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.3 }}
              className="max-w-xl mx-auto"
            >
              <Card className="bg-white dark:bg-dark-700 border border-primary-500/20">
                <div className="flex flex-col items-center py-12">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', stiffness: 260, damping: 20, delay: 0.2 }}
                    className="mx-auto flex items-center justify-center h-20 w-20 rounded-full bg-primary-500/10"
                  >
                    <FiCheckCircle className="h-10 w-10 text-primary-500" />
                  </motion.div>
                  <motion.h3
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="mt-6 text-2xl font-medium text-gray-900 dark:text-dark-100"
                  >
                    Upload Successful!
                  </motion.h3>
                  <motion.p
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="mt-3 text-gray-600 dark:text-dark-300 text-center max-w-md"
                  >
                    Your files have been successfully uploaded and organized in the system.
                  </motion.p>
                </div>
              </Card>
            </motion.div>
          ) : (
            <motion.form
              key={step}
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -40 }}
              transition={{ duration: 0.3 }}
              onSubmit={handleSubmit}
              className="max-w-2xl mx-auto"
            >
              {step === 0 && (
                <Card className="bg-white dark:bg-dark-800 border border-gray-200 dark:border-dark-700 transition-colors duration-300">
                  <div className="p-8 space-y-8">
                    <div>
                      <h2 className="text-2xl font-semibold text-gray-900 dark:text-dark-100 mb-2 flex items-center gap-2">
                        <FiFileText className="h-6 w-6 text-primary-500" /> Metadata Entry
                      </h2>
                      <p className="text-gray-600 dark:text-dark-300 mb-6">Enter file metadata to help organize your documents.</p>
                      <div className="grid grid-cols-1 gap-6">
                        <div className="space-y-2">
                          <label htmlFor="title" className="block text-sm font-medium text-gray-700 dark:text-dark-200">
                            Title
                          </label>
                          <input
                            type="text"
                            id="title"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            className="w-full px-4 py-2 rounded-md border border-gray-200 dark:border-dark-600 bg-white dark:bg-dark-700 text-gray-900 dark:text-dark-100 placeholder-gray-500 dark:placeholder-dark-400 focus:outline-none focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-400"
                            placeholder="Enter file title"
                          />
                        </div>

                        <div className="space-y-2">
                          <label htmlFor="fiscalYear" className="block text-sm font-medium text-gray-700 dark:text-dark-200">
                            Fiscal Year
                          </label>
                          <SearchableSelect
                            id="fiscalYear"
                            value={fiscalYear}
                            onChange={setFiscalYear}
                            options={fiscalYears}
                            placeholder="Select fiscal year"
                            className="w-full"
                          />
                        </div>

                        <div className="space-y-2">
                          <label htmlFor="source" className="block text-sm font-medium text-gray-700 dark:text-dark-200">
                            Source
                          </label>
                          <SearchableSelect
                            id="source"
                            value={source}
                            onChange={setSource}
                            options={SOURCES}
                            placeholder="Select source"
                            className="w-full"
                          />
                        </div>

                        <div className="space-y-2">
                          <label htmlFor="grantType" className="block text-sm font-medium text-gray-700 dark:text-dark-200">
                            Grant Type
                          </label>
                          <SearchableSelect
                            id="grantType"
                            value={grantType}
                            onChange={setGrantType}
                            options={GRANT_TYPES}
                            placeholder="Select grant type"
                            className="w-full"
                          />
                        </div>

                        <div className="space-y-2">
                          <label htmlFor="remarks" className="block text-sm font-medium text-gray-700 dark:text-dark-200">
                            Remarks
                          </label>
                          <textarea
                            id="remarks"
                            value={remarks}
                            onChange={(e) => setRemarks(e.target.value)}
                            rows={4}
                            className="w-full px-4 py-2 rounded-md border border-gray-200 dark:border-dark-600 bg-white dark:bg-dark-700 text-gray-900 dark:text-dark-100 placeholder-gray-500 dark:placeholder-dark-400 focus:outline-none focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-400"
                            placeholder="Enter any additional remarks"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>
              )}

              {step === 1 && (
                <Card className="bg-white dark:bg-dark-800 border border-gray-200 dark:border-dark-700 transition-colors duration-300">
                  <div className="p-8 space-y-8">
                    <div>
                      <h2 className="text-2xl font-semibold text-gray-900 dark:text-dark-100 mb-2 flex items-center gap-2">
                        <FiUpload className="h-6 w-6 text-primary-500" /> Document Upload
                      </h2>
                      <p className="text-gray-600 dark:text-dark-300 mb-6">Upload your files in the appropriate sections.</p>
                      
                      <div className="space-y-6">
                        <FileUploader
                          title="A4 Size Documents"
                          description="Upload A4 size documents (PDF, DOC, DOCX)"
                          files={a4Files}
                          setFiles={setA4Files}
                          accept=".pdf,.doc,.docx"
                        />
                        
                        <FileUploader
                          title="Nepali Documents"
                          description="Upload Nepali language documents"
                          files={nepaliFiles}
                          setFiles={setNepaliFiles}
                          accept=".pdf,.doc,.docx"
                        />
                        
                        <FileUploader
                          title="Extra Documents"
                          description="Upload any additional documents"
                          files={extraFiles}
                          setFiles={setExtraFiles}
                          accept=".pdf,.doc,.docx,.xls,.xlsx"
                        />
                        
                        <FileUploader
                          title="Other Files"
                          description="Upload any other file types"
                          files={otherFiles}
                          setFiles={setOtherFiles}
                          accept="*/*"
                        />
                      </div>
                    </div>
                  </div>
                </Card>
              )}

              <div className="mt-8 flex justify-between">
                <Button
                  type="button"
                  variant="outlined"
                  onClick={() => setStep(step - 1)}
                  disabled={step === 0}
                  className="flex items-center gap-2"
                >
                  <FiChevronLeft className="h-5 w-5" />
                  Previous
                </Button>

                {step === steps.length - 1 ? (
                  <Button
                    type="submit"
                    variant="primary"
                    disabled={isSubmitting || !canGoNext()}
                    className="flex items-center gap-2"
                  >
                    {isSubmitting ? 'Uploading...' : 'Upload Files'}
                  </Button>
                ) : (
                  <Button
                    type="button"
                    variant="primary"
                    onClick={() => setStep(step + 1)}
                    disabled={!canGoNext()}
                    className="flex items-center gap-2"
                  >
                    Next
                    <FiChevronRight className="h-5 w-5" />
                  </Button>
                )}
              </div>
            </motion.form>
          )}
        </AnimatePresence>
      </main>
    </motion.div>
  );
};

export default UploadPage; 