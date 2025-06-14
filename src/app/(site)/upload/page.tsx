'use client';

import { useState, useEffect } from 'react';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import FileUploader from '@/components/features/FileUploader';
import { motion, AnimatePresence } from 'framer-motion';
import { FiFileText, FiUpload, FiChevronRight, FiChevronLeft, FiCheckCircle } from 'react-icons/fi';
import { toast } from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import SearchableSelect from '@/components/ui/SearchableSelect';
import { generateFiscalYears } from '@/utils/fiscalYears';
import { TranslatedText } from '@/components/TranslatedText';
import { useApp } from '@/contexts/AppContext';
import { useSession } from 'next-auth/react';

interface Option {
  id: string;
  translationKey: string;
  translations?: {
    en: string;
    ne: string;
  };
}

// Define sources to match exactly with database records
const SOURCES = [
  { id: 'Federal Government', name: 'Federal Government' },
  { id: 'Provincial Government', name: 'Provincial Government' },
  { id: 'Local Municipality', name: 'Local Municipality' },
  { id: 'Other', name: 'Other' },
];

// Define grant types to match exactly with database records
const GRANT_TYPES = [
  { id: 'Current Expenditure', name: 'Current Expenditure' },
  { id: 'Capital Expenditure', name: 'Capital Expenditure' },
  { id: 'Supplementary Grant', name: 'Supplementary Grant' },
  { id: 'Special Grant', name: 'Special Grant' },
  { id: 'Other Grant', name: 'Other Grant' },
];

const steps = [
  {
    label: 'files.upload.steps.1',
    icon: <FiFileText className="h-5 w-5" />,
  },
  {
    label: 'files.upload.steps.0',
    icon: <FiUpload className="h-5 w-5" />,
  },
];

export default function UploadPage() {
  const { language } = useApp();
  const { data: session } = useSession();
  const router = useRouter();

  // Redirect viewers away from upload page
  useEffect(() => {
    if (session?.user?.role === 'viewer') {
      router.push('/files');
    }
  }, [session, router]);

  // Don't render anything for viewers
  if (session?.user?.role === 'viewer') {
    return null;
  }

  const [step, setStep] = useState(0);
  const [a4Files, setA4Files] = useState<File[]>([]);
  const [nepaliFiles, setNepaliFiles] = useState<File[]>([]);
  const [extraFiles, setExtraFiles] = useState<File[]>([]);
  const [otherFiles, setOtherFiles] = useState<File[]>([]);
  const [fiscalYear, setFiscalYear] = useState<Option | null>(null);
  const [source, setSource] = useState<Option | null>(null);
  const [grantType, setGrantType] = useState<Option | null>(null);
  const [title, setTitle] = useState('');
  const [remarks, setRemarks] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [sourceOptions, setSourceOptions] = useState<{ id: string; translationKey: string; translations: any; }[]>([]);
  const [grantTypeOptions, setGrantTypeOptions] = useState<{ id: string; translationKey: string; translations: any; }[]>([]);
  const [uploadSections, setUploadSections] = useState<any[]>([]);
  const [sectionFiles, setSectionFiles] = useState<{ [key: string]: File[] }>({});

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
    id: year.id,
    translationKey: `reports.fiscalYears.${year.id}`,
    translations: {
      en: year.name,
      ne: year.name
    }
  }));

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
          translationKey: `reports.grantTypes.${grant.key}`,
          translations: grant.translations
        })));
      } catch (error) {
        console.error('Error fetching options:', error);
        toast.error('Failed to load options');
      }
    };
    fetchOptions();
  }, []);

  // Fetch upload sections
  useEffect(() => {
    const fetchUploadSections = async () => {
      try {
        const response = await fetch('/api/admin/upload-sections');
        if (!response.ok) throw new Error('Failed to fetch upload sections');
        const data = await response.json();
        setUploadSections(data);
        // Initialize section files state
        const initialSectionFiles: { [key: string]: File[] } = {};
        data.forEach((section: any) => {
          initialSectionFiles[section.key] = [];
        });
        setSectionFiles(initialSectionFiles);
      } catch (error) {
        console.error('Error fetching upload sections:', error);
        toast.error('Failed to load upload sections');
      }
    };

    fetchUploadSections();
  }, []);

  // Convert fiscal years to options
  const fiscalYearOptions = fiscalYears;

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

  const isFormValid = title && fiscalYear && source && grantType && 
    Object.values(sectionFiles).some(files => files.length > 0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('title', title);
      formData.append('fiscalYear', fiscalYear?.id || '');
      formData.append('source', source?.id || '');
      formData.append('grantType', grantType?.id || '');
      formData.append('remarks', remarks);
      
      // Append files from each section
      Object.entries(sectionFiles).forEach(([sectionKey, files]) => {
        files.forEach(file => {
          formData.append(`${sectionKey}Files`, file);
        });
      });

      // Log the form data for debugging
      console.log('Submitting form data:', {
        title,
        fiscalYear: fiscalYear?.id,
        source: source?.id,
        grantType: grantType?.id,
        remarks,
        sectionFiles
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
        setSectionFiles({});
        setFiscalYear(null);
        setSource(null);
        setGrantType(null);
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
      <aside className="w-64 min-w-[220px] bg-dark-800 rounded-2xl p-8 flex flex-col items-start shadow-lg h-fit sticky top-4">
        <h2 className="text-lg font-bold text-dark-100 mb-8 tracking-wide"><TranslatedText text="files.upload.title" /></h2>
        <ol className="space-y-6 w-full overflow-y-auto max-h-[calc(100vh-16rem)]">
          {steps.map((s, idx) => (
            <li key={s.label} className="flex items-center gap-4">
              <div
                className={`flex items-center justify-center h-8 w-8 rounded-full border-2 transition-all duration-200 ${
                  idx < step
                    ? 'bg-primary-500 border-primary-500 text-white'
                    : idx === step
                    ? 'bg-dark-700 border-primary-500 text-primary-500'
                    : 'bg-dark-700 border-dark-600 text-dark-400'
                }`}
              >
                {idx < step ? <FiCheckCircle className="h-5 w-5" /> : s.icon}
              </div>
              <span
                className={`text-base font-medium transition-colors duration-200 ${
                  idx === step
                    ? 'text-primary-500'
                    : idx < step
                    ? 'text-dark-100'
                    : 'text-dark-400'
                }`}
              >
                <TranslatedText text={`files.upload.steps.${idx}`} />
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
              <Card className="bg-dark-700 border border-primary-500/20">
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
                    className="mt-6 text-2xl font-medium text-dark-100"
                  >
                    <TranslatedText text="files.upload.messages.success" />
                  </motion.h3>
                  <motion.p
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="mt-3 text-dark-300 text-center max-w-md"
                  >
                    <TranslatedText text="files.upload.messages.success" />
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
                <Card className="bg-dark-800 border border-dark-700 transition-colors duration-300">
                  <div className="p-8 space-y-8">
                    <div>
                      <h2 className="text-2xl font-semibold text-dark-100 mb-2 flex items-center gap-2">
                        <FiFileText className="h-6 w-6 text-primary-500" /> <TranslatedText text="files.upload.metadata.title" />
                      </h2>
                      <p className="text-dark-300 mb-6"><TranslatedText text="files.upload.metadata.description" /></p>
                      <div className="grid grid-cols-1 gap-6">
                        <div className="space-y-2">
                          <label className="block text-sm font-medium text-dark-200">
                            <TranslatedText text="files.upload.metadata.titleLabel" /> <span className="text-primary-500">*</span>
                          </label>
                          <input
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            className="mt-1 block w-full rounded-md border-dark-600 bg-dark-700 text-dark-100 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                            required
                          />
                        </div>
                          <div className="space-y-2">
                          <label className="block text-sm font-medium text-dark-200">
                            <TranslatedText text="files.upload.metadata.fiscalYearLabel" /> <span className="text-primary-500">*</span>
                            </label>
                            <SearchableSelect
                              options={fiscalYearOptions}
                              value={fiscalYear}
                              onChange={setFiscalYear}
                              placeholderTranslationKey="files.upload.metadata.fiscalYearLabel"
                            />
                          </div>
                          <div className="space-y-2">
                          <label className="block text-sm font-medium text-dark-200">
                            <TranslatedText text="files.upload.metadata.sourceLabel" /> <span className="text-primary-500">*</span>
                            </label>
                          <SearchableSelect
                            options={sourceOptions}
                              value={source}
                            onChange={setSource}
                            placeholderTranslationKey="files.upload.metadata.sourceLabel"
                          />
                        </div>
                          <div className="space-y-2">
                          <label className="block text-sm font-medium text-dark-200">
                            <TranslatedText text="files.upload.metadata.grantTypeLabel" /> <span className="text-primary-500">*</span>
                            </label>
                          <SearchableSelect
                            options={grantTypeOptions}
                              value={grantType}
                            onChange={setGrantType}
                            placeholderTranslationKey="files.upload.metadata.grantTypeLabel"
                          />
                          </div>
                          <div className="space-y-2">
                          <label className="block text-sm font-medium text-dark-200">
                            <TranslatedText text="files.upload.metadata.remarksLabel" />
                            </label>
                            <textarea
                              value={remarks}
                            onChange={(e) => setRemarks(e.target.value)}
                            rows={3}
                            className="mt-1 block w-full rounded-md border-dark-600 bg-dark-700 text-dark-100 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>
              )}
              {step === 1 && (
                <Card className="bg-dark-800 border border-dark-700 transition-colors duration-300">
                  <div className="p-8 space-y-8">
                    <div>
                      <h2 className="text-2xl font-semibold text-dark-100 mb-2 flex items-center gap-2">
                        <FiUpload className="h-6 w-6 text-primary-500" /> <TranslatedText text="files.upload.document.title" />
                      </h2>
                      <p className="text-dark-300 mb-6"><TranslatedText text="files.upload.document.description" /></p>
                      <div className="space-y-8">
                        {uploadSections.map((section) => (
                          <div key={section.id}>
                            <h3 className="text-lg font-semibold text-dark-200 mb-2">
                              {section.translations[language] || section.name}
                            </h3>
                            <FileUploader
                              onFilesSelected={(files) => setSectionFiles(prev => ({
                                ...prev,
                                [section.key]: files
                              }))}
                              maxFiles={20}
                              maxSizeMB={10}
                              acceptedFileTypes={['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'image/jpeg', 'image/png']}
                              disabled={isSubmitting}
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </Card>
              )}
              {/* Navigation Buttons */}
              <div className="flex justify-between mt-8">
                {step > 0 && (
                <Button
                  type="button"
                  variant="outline"
                    onClick={() => setStep(step - 1)}
                    className="flex items-center"
                >
                    <FiChevronLeft className="inline mr-2" /> <TranslatedText text="files.upload.buttons.back" />
                </Button>
                )}
                {step < steps.length - 1 ? (
                  <Button
                    type="button"
                    onClick={() => setStep(step + 1)}
                    disabled={!canGoNext()}
                    className="flex items-center ml-auto"
                  >
                    <TranslatedText text="files.upload.buttons.next" /> <FiChevronRight className="inline ml-2" />
                  </Button>
                ) : (
                  <Button
                    type="submit"
                    className="w-48 mt-8"
                    disabled={!isFormValid || isSubmitting}
                  >
                    {isSubmitting ? <span>Uploading...</span> : <TranslatedText text="files.upload.buttons.upload" />}
                  </Button>
                )}
              </div>
            </motion.form>
          )}
        </AnimatePresence>
      </main>
    </motion.div>
  );
} 