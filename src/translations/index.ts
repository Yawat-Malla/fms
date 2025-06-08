export type Language = 'en' | 'ne';

export interface Translations {
  common: {
    loading: string;
    error: string;
    success: string;
    cancel: string;
    save: string;
    delete: string;
    edit: string;
    view: string;
    close: string;
    confirm: string;
  };
  sidebar: {
    home: string;
    files: string;
    upload: string;
    users: string;
    sync: string;
    bin: string;
    reports: string;
    settings: string;
    logout: string;
  };
  auth: {
    signIn: string;
    signOut: string;
    email: string;
    password: string;
    forgotPassword: string;
    rememberMe: string;
  };
  dashboard: {
    title: string;
    subtitle: string;
    stats: {
      totalFiles: string;
      totalSize: string;
      recentUploads: string;
      availableFiles: string;
      deletedFiles: string;
    };
    charts: {
      filesByType: string;
      uploadTrend: string;
    };
  };
  projects: {
    title: string;
    subtitle: string;
    create: string;
    edit: string;
    delete: string;
  };
  users: {
    title: string;
    subtitle: string;
    create: string;
    edit: string;
    delete: string;
    role: {
      admin: string;
      editor: string;
      viewer: string;
    };
  };
  settings: {
    title: string;
    subtitle: string;
    systemSettings: string;
    theme: {
      label: string;
      description: string;
    };
    language: {
      label: string;
      description: string;
      options: {
        en: string;
        ne: string;
      };
    };
    storageDirectory: {
      label: string;
      placeholder: string;
      description: string;
      browse: string;
    };
    onlineServer: {
      title: string;
      apiUrl: {
        label: string;
        placeholder: string;
        description: string;
      };
      apiKey: {
        label: string;
        placeholder: string;
        description: string;
        show: string;
      };
      testConnection: string;
    };
    backup: {
      title: string;
      create: {
        label: string;
        description: string;
        button: string;
      };
      restore: {
        label: string;
        description: string;
        button: string;
      };
    };
    buttons: {
      save: string;
      cancel: string;
    };
  };
  files: {
    title: string;
    subtitle: string;
    heading: string;
    filteredResults: string;
    newFile: string;
    newDocument: string;
    newFolder: string;
    file: string;
    files: string;
    found: string;
    recentlyModified: string;
    viewAll: string;
    filters: {
      title: string;
      allFiles: string;
      byFiscalYear: string;
      bySource: {
        title: string;
        federal: string;
        provincial: string;
        local: string;
        other: string;
      };
      byGrantType: {
        title: string;
        currentExpenditure: string;
        capitalExpenditure: string;
        supplementaryGrant: string;
        specialGrant: string;
        otherGrants: string;
      };
      allFiscalYears: string;
      allSources: string;
      allGrantTypes: string;
      viewAll: string;
      pdfs: string;
      images: string;
    };
    selectSource: string;
    emptyState: {
      noFiles: string;
      noFilesForFiscalYear: string;
      noFilesForSource: string;
      noFilesForGrantType: string;
      noFilesMatchFilters: string;
      clearFilters: string;
    };
    table: {
      name: string;
      type: string;
      size: string;
      uploadedBy: string;
      uploadedAt: string;
      lastModified: string;
      status: string;
      actions: string;
      fiscalYear: string;
      source: string;
      grantType: string;
      created: string;
    };
    upload: {
      title: string;
      steps: {
        0: string;
        1: string;
      };
      success: {
        title: string;
        message: string;
      };
      metadata: {
        title: string;
        description: string;
        titleLabel: string;
        fiscalYearLabel: string;
        sourceLabel: string;
        grantTypeLabel: string;
        remarksLabel: string;
        titlePlaceholder: string;
        fiscalYearPlaceholder: string;
        sourcePlaceholder: string;
        grantTypePlaceholder: string;
        remarksPlaceholder: string;
      };
      document: {
        title: string;
        description: string;
        a4Size: string;
        nepaliPaper: string;
        extraSize: string;
        other: string;
      };
      navigation: {
        back: string;
        next: string;
        upload: string;
      };
    };
  };
  bin: {
    title: string;
    subtitle: string;
    restore: string;
    deleteForever: string;
    processing: string;
    confirmRestore: string;
    confirmDelete: string;
    confirmRestoreMessage: string;
    confirmDeleteMessage: string;
    filters: {
      type: string;
      modified: string;
      source: string;
      fiscalYear: string;
      grantType: string;
      options: {
        today: string;
        yesterday: string;
        last7Days: string;
        last30Days: string;
      };
    };
    emptyState: {
      noItems: string;
      noItemsForFilter: string;
    };
  };
  reports: {
    title: string;
    subtitle: string;
    generateReport: string;
    reportType: string;
    required: string;
    fileFormat: string;
    dateRange: string;
    startDate: string;
    endDate: string;
    fiscalYear: string;
    source: string;
    grantType: string;
    generate: string;
    generating: string;
    download: string;
    delete: string;
    deleteAll: string;
    confirmDelete: string;
    confirmDeleteAll: string;
    confirmDeleteMessage: string;
    confirmDeleteAllMessage: string;
    types: {
      fileCount: string;
      missingUploads: string;
      custom: string;
    };
    formats: {
      pdf: string;
      excel: string;
    };
    errors: {
      selectReportType: string;
      selectEndDate: string;
      selectStartDate: string;
      invalidDateRange: string;
      downloadFailed: string;
      deleteFailed: string;
      deleteAllFailed: string;
      generateFailed: string;
    };
    success: {
      generated: string;
      deleted: string;
      deletedAll: string;
      downloaded: string;
    };
  };
}

export const translations: Record<Language, Translations> = {
  en: {
    common: {
      loading: 'Loading...',
      error: 'Error',
      success: 'Success',
      cancel: 'Cancel',
      save: 'Save',
      delete: 'Delete',
      edit: 'Edit',
      view: 'View',
      close: 'Close',
      confirm: 'Confirm',
    },
    sidebar: {
      home: 'Home',
      files: 'Files',
      upload: 'Upload',
      users: 'Users',
      sync: 'Sync',
      bin: 'Bin',
      reports: 'Reports',
      settings: 'Settings',
      logout: 'Logout'
    },
    auth: {
      signIn: 'Sign In',
      signOut: 'Sign Out',
      email: 'Email',
      password: 'Password',
      forgotPassword: 'Forgot Password?',
      rememberMe: 'Remember Me',
    },
    dashboard: {
      title: 'Dashboard',
      subtitle: 'Overview of your system',
      stats: {
        totalFiles: 'Total Files',
        totalSize: 'Total Size',
        recentUploads: 'Recent Uploads',
        availableFiles: 'Available Files',
        deletedFiles: 'Deleted Files',
      },
      charts: {
        filesByType: 'Files by Type',
        uploadTrend: 'Upload Trend',
      },
    },
    projects: {
      title: 'Projects',
      subtitle: 'Manage your projects',
      create: 'Create Project',
      edit: 'Edit Project',
      delete: 'Delete Project',
    },
    users: {
      title: 'Users',
      subtitle: 'Manage system users',
      create: 'Create User',
      edit: 'Edit User',
      delete: 'Delete User',
      role: {
        admin: 'Administrator',
        editor: 'Editor',
        viewer: 'Viewer',
      },
    },
    settings: {
      title: 'Settings',
      subtitle: 'System Settings',
      systemSettings: 'General',
      theme: {
        label: 'Dark Mode',
        description: 'Switch between light and dark mode',
      },
      language: {
        label: 'Language',
        description: 'Choose your language',
        options: {
          en: 'English',
          ne: 'नेपाली',
        },
      },
      storageDirectory: {
        label: 'Storage Location',
        placeholder: 'Enter path',
        description: 'Where files will be stored',
        browse: 'Browse',
      },
      onlineServer: {
        title: 'Server Settings',
        apiUrl: {
          label: 'Server URL',
          placeholder: 'Enter server URL',
          description: 'URL of your server',
        },
        apiKey: {
          label: 'API Key',
          placeholder: 'Enter API key',
          description: 'Your API key',
          show: 'Show',
        },
        testConnection: 'Test Connection',
      },
      backup: {
        title: 'Backup & Restore',
        create: {
          label: 'Create Backup',
          description: 'Save your current settings and data',
          button: 'Create Backup',
        },
        restore: {
          label: 'Restore Backup',
          description: 'Restore from a previous backup',
          button: 'Restore',
        },
      },
      buttons: {
        save: 'Save',
        cancel: 'Cancel',
      },
    },
    files: {
      title: 'Files',
      subtitle: 'Manage your files',
      heading: 'All Files',
      filteredResults: 'Filtered Results',
      newFile: 'New file',
      newDocument: 'New document',
      newFolder: 'New folder',
      file: 'file',
      files: 'files',
      found: 'found',
      recentlyModified: 'Recently modified',
      viewAll: 'View all',
      filters: {
        title: 'Filters',
        allFiles: 'All Files',
        byFiscalYear: 'By Fiscal Year',
        bySource: {
          title: 'By Source',
          federal: 'Federal',
          provincial: 'Provincial',
          local: 'Local',
          other: 'Other',
        },
        byGrantType: {
          title: 'By Grant Type',
          currentExpenditure: 'Current Expenditure',
          capitalExpenditure: 'Capital Expenditure',
          supplementaryGrant: 'Supplementary Grant',
          specialGrant: 'Special Grant',
          otherGrants: 'Other Grants',
        },
        allFiscalYears: 'All Fiscal Years',
        allSources: 'All Sources',
        allGrantTypes: 'All Grant Types',
        viewAll: 'View all',
        pdfs: 'PDFs',
        images: 'Images',
      },
      selectSource: 'Select Source:',
      emptyState: {
        noFiles: 'No files found',
        noFilesForFiscalYear: 'No files found for selected fiscal year',
        noFilesForSource: 'No files found for selected source',
        noFilesForGrantType: 'No files found for selected grant type',
        noFilesMatchFilters: 'No files match your current filters',
        clearFilters: 'Clear Filters',
      },
      table: {
        name: 'Name',
        type: 'Type',
        size: 'Size',
        uploadedBy: 'Uploaded By',
        uploadedAt: 'Uploaded At',
        lastModified: 'Last modified',
        status: 'Status',
        actions: 'Actions',
        fiscalYear: 'Fiscal Year',
        source: 'Source',
        grantType: 'Grant Type',
        created: 'Created',
      },
      upload: {
        title: 'Upload Files',
        steps: {
          0: 'Metadata Entry',
          1: 'Document Upload',
        },
        success: {
          title: 'Upload Successful!',
          message: 'Your files have been successfully uploaded and organized in the system.',
        },
        metadata: {
          title: 'Metadata Entry',
          description: 'Enter file metadata to help organize your documents.',
          titleLabel: 'Title',
          fiscalYearLabel: 'Fiscal Year',
          sourceLabel: 'Funding Source',
          grantTypeLabel: 'Grant Type',
          remarksLabel: 'Summary / Remarks',
          titlePlaceholder: 'Enter document title',
          fiscalYearPlaceholder: 'Select fiscal year',
          sourcePlaceholder: 'Select funding source',
          grantTypePlaceholder: 'Select grant type',
          remarksPlaceholder: 'Add any summary or remarks (optional)',
        },
        document: {
          title: 'Document Upload',
          description: 'Upload multi-page scanned PDFs or images. You can upload multiple files at once in each section. (Optional for each section)',
          a4Size: 'A4 size',
          nepaliPaper: 'Nepali Paper',
          extraSize: 'Extra Size',
          other: 'Other',
        },
        navigation: {
          back: 'Back',
          next: 'Next',
          upload: 'Upload Files',
        },
      },
    },
    bin: {
      title: 'Recycle Bin',
      subtitle: 'Manage deleted files and folders',
      restore: 'Restore',
      deleteForever: 'Delete Forever',
      processing: 'Processing...',
      confirmRestore: 'Restore Items?',
      confirmDelete: 'Delete Forever?',
      confirmRestoreMessage: 'Are you sure you want to restore the selected items?',
      confirmDeleteMessage: 'This will permanently delete the selected items. This action cannot be undone.',
      filters: {
        type: 'Type',
        modified: 'Modified',
        source: 'Source',
        fiscalYear: 'Fiscal Year',
        grantType: 'Grant Type',
        options: {
          today: 'Today',
          yesterday: 'Yesterday',
          last7Days: 'Last 7 days',
          last30Days: 'Last 30 days',
        },
      },
      emptyState: {
        noItems: 'No deleted items found',
        noItemsForFilter: 'No items match the selected filters',
      },
    },
    reports: {
      title: 'Reports',
      subtitle: 'Generate and download various system reports',
      generateReport: 'Generate Report',
      reportType: 'Report Type',
      required: 'Required',
      fileFormat: 'File Format',
      dateRange: 'Date Range',
      startDate: 'Start Date',
      endDate: 'End Date',
      fiscalYear: 'Fiscal Year',
      source: 'Source',
      grantType: 'Grant Type',
      generate: 'Generate',
      generating: 'Generating...',
      download: 'Download',
      delete: 'Delete',
      deleteAll: 'Delete All',
      confirmDelete: 'Delete Report?',
      confirmDeleteAll: 'Delete All Reports?',
      confirmDeleteMessage: 'Are you sure you want to delete this report? This action cannot be undone.',
      confirmDeleteAllMessage: 'Are you sure you want to delete all reports? This action cannot be undone.',
      types: {
        fileCount: 'Files by Year',
        missingUploads: 'Missing Uploads',
        custom: 'Custom Report',
      },
      formats: {
        pdf: 'PDF',
        excel: 'Excel',
      },
      errors: {
        selectReportType: 'Please select a report type',
        selectEndDate: 'Please select an end date',
        selectStartDate: 'Please select a start date',
        invalidDateRange: 'Start date must be before end date',
        downloadFailed: 'Failed to download report',
        deleteFailed: 'Failed to delete report',
        deleteAllFailed: 'Failed to delete reports',
        generateFailed: 'Failed to generate report',
      },
      success: {
        generated: 'Report generated successfully',
        deleted: 'Report deleted successfully',
        deletedAll: 'All reports deleted successfully',
        downloaded: 'Report downloaded successfully',
      },
    },
  },
  ne: {
    common: {
      loading: 'लोड हुँदैछ...',
      error: 'त्रुटि',
      success: 'सफल',
      cancel: 'रद्द गर्नुहोस्',
      save: 'सुरक्षित गर्नुहोस्',
      delete: 'मेटाउनुहोस्',
      edit: 'सम्पादन गर्नुहोस्',
      view: 'हेर्नुहोस्',
      close: 'बन्द गर्नुहोस्',
      confirm: 'पुष्टि गर्नुहोस्',
    },
    sidebar: {
      home: 'गृह',
      files: 'फाइलहरू',
      upload: 'अपलोड',
      users: 'प्रयोगकर्ताहरू',
      sync: 'सिंक',
      bin: 'रद्दी टोकरी',
      reports: 'प्रतिवेदनहरू',
      settings: 'सेटिङहरू',
      logout: 'लग आउट'
    },
    auth: {
      signIn: 'साइन इन',
      signOut: 'साइन आउट',
      email: 'इमेल',
      password: 'पासवर्ड',
      forgotPassword: 'पासवर्ड बिर्सनुभयो?',
      rememberMe: 'मलाई सम्झनुहोस्',
    },
    dashboard: {
      title: 'ड्यासबोर्ड',
      subtitle: 'प्रणालीको अवलोकन',
      stats: {
        totalFiles: 'कुल फाइलहरू',
        totalSize: 'कुल साइज',
        recentUploads: 'हालैका अपलोडहरू',
        availableFiles: 'उपलब्ध फाइलहरू',
        deletedFiles: 'मेटाइएका फाइलहरू',
      },
      charts: {
        filesByType: 'प्रकार अनुसार फाइलहरू',
        uploadTrend: 'अपलोड ट्रेन्ड',
      },
    },
    projects: {
      title: 'परियोजनाहरू',
      subtitle: 'परियोजनाहरू व्यवस्थापन गर्नुहोस्',
      create: 'परियोजना सिर्जना गर्नुहोस्',
      edit: 'परियोजना सम्पादन गर्नुहोस्',
      delete: 'परियोजना मेटाउनुहोस्',
    },
    users: {
      title: 'प्रयोगकर्ताहरू',
      subtitle: 'प्रणाली प्रयोगकर्ताहरू व्यवस्थापन गर्नुहोस्',
      create: 'प्रयोगकर्ता सिर्जना गर्नुहोस्',
      edit: 'प्रयोगकर्ता सम्पादन गर्नुहोस्',
      delete: 'प्रयोगकर्ता मेटाउनुहोस्',
      role: {
        admin: 'प्रशासक',
        editor: 'सम्पादक',
        viewer: 'दर्शक',
      },
    },
    settings: {
      title: 'सेटिङ्स',
      subtitle: 'सिस्टम सेटिङ्स',
      systemSettings: 'सामान्य',
      theme: {
        label: 'डार्क मोड',
        description: 'लाइट र डार्क मोड बीच स्विच गर्नुहोस्',
      },
      language: {
        label: 'भाषा',
        description: 'भाषा छान्नुहोस्',
        options: {
          en: 'English',
          ne: 'नेपाली',
        },
      },
      storageDirectory: {
        label: 'भण्डारण स्थान',
        placeholder: 'पथ लेख्नुहोस्',
        description: 'फाइलहरू कहाँ भण्डारण गरिनेछ',
        browse: 'ब्राउज',
      },
      onlineServer: {
        title: 'सर्भर सेटिङ्स',
        apiUrl: {
          label: 'सर्भर URL',
          placeholder: 'सर्भर URL लेख्नुहोस्',
          description: 'तपाईंको सर्भरको URL',
        },
        apiKey: {
          label: 'API कुञ्जी',
          placeholder: 'API कुञ्जी लेख्नुहोस्',
          description: 'तपाईंको API कुञ्जी',
          show: 'देखाउनुहोस्',
        },
        testConnection: 'जडान जाँच',
      },
      backup: {
        title: 'ब्याकअप र पुनर्स्थापना',
        create: {
          label: 'ब्याकअप सिर्जना',
          description: 'वर्तमान सेटिङ्स र डाटा सुरक्षित गर्नुहोस्',
          button: 'ब्याकअप गर्नुहोस्',
        },
        restore: {
          label: 'ब्याकअप पुनर्स्थापना',
          description: 'पहिलेको ब्याकअपबाट पुनर्स्थापना गर्नुहोस्',
          button: 'पुनर्स्थापना',
        },
      },
      buttons: {
        save: 'सुरक्षित',
        cancel: 'रद्द',
      },
    },
    files: {
      title: 'फाइलहरू',
      subtitle: 'फाइलहरू व्यवस्थापन गर्नुहोस्',
      heading: 'सबै फाइलहरू',
      filteredResults: 'फिल्टर गरिएका नतिजाहरू',
      newFile: 'नयाँ फाइल',
      newDocument: 'नयाँ कागजात',
      newFolder: 'नयाँ फोल्डर',
      file: 'फाइल',
      files: 'फाइलहरू',
      found: 'फेला पर्यो',
      recentlyModified: 'हालै परिमार्जित',
      viewAll: 'सबै हेर्नुहोस्',
      filters: {
        title: 'फिल्टरहरू',
        allFiles: 'सबै फाइलहरू',
        byFiscalYear: 'आर्थिक वर्ष अनुसार',
        bySource: {
          title: 'स्रोत अनुसार',
          federal: 'संघीय',
          provincial: 'प्रदेश',
          local: 'स्थानीय',
          other: 'अन्य',
        },
        byGrantType: {
          title: 'अनुदान प्रकार अनुसार',
          currentExpenditure: 'चालु खर्च',
          capitalExpenditure: 'पूँजीगत खर्च',
          supplementaryGrant: 'पूरक अनुदान',
          specialGrant: 'विशेष अनुदान',
          otherGrants: 'अन्य अनुदान',
        },
        allFiscalYears: 'सबै आर्थिक वर्ष',
        allSources: 'सबै स्रोत',
        allGrantTypes: 'सबै अनुदान प्रकार',
        viewAll: 'सबै हेर्नुहोस्',
        pdfs: 'पिडीएफहरू',
        images: 'तस्बिरहरू',
      },
      selectSource: 'स्रोत छान्नुहोस्:',
      emptyState: {
        noFiles: 'कुनै फाइल फेला परेन',
        noFilesForFiscalYear: 'चयन गरिएको आर्थिक वर्षका लागि फाइल फेला परेन',
        noFilesForSource: 'चयन गरिएको स्रोतका लागि फाइल फेला परेन',
        noFilesForGrantType: 'चयन गरिएको अनुदान प्रकारका लागि फाइल फेला परेन',
        noFilesMatchFilters: 'तपाईंको हालको फिल्टरसँग मेल खाने फाइलहरू छैनन्',
        clearFilters: 'फिल्टरहरू हटाउनुहोस्',
      },
      table: {
        name: 'नाम',
        type: 'प्रकार',
        size: 'साइज',
        uploadedBy: 'अपलोड गर्ने',
        uploadedAt: 'अपलोड मिति',
        lastModified: 'अन्तिम परिमार्जन',
        status: 'स्थिति',
        actions: 'कार्यहरू',
        fiscalYear: 'आर्थिक वर्ष',
        source: 'स्रोत',
        grantType: 'अनुदान प्रकार',
        created: 'सिर्जना मिति',
      },
      upload: {
        title: 'फाइलहरू अपलोड गर्नुहोस्',
        steps: {
          0: 'मेटाडाटा प्रविष्टि',
          1: 'कागजात अपलोड',
        },
        success: {
          title: 'अपलोड सफल!',
          message: 'तपाईंको फाइलहरू सफलतापूर्वक अपलोड र व्यवस्थित गरिएको छ।',
        },
        metadata: {
          title: 'मेटाडाटा प्रविष्टि',
          description: 'कागजातहरू व्यवस्थित गर्न मेटाडाटा प्रविष्टि गर्नुहोस्।',
          titleLabel: 'शीर्षक',
          fiscalYearLabel: 'आर्थिक वर्ष',
          sourceLabel: 'वित्तीय स्रोत',
          grantTypeLabel: 'अनुदान प्रकार',
          remarksLabel: 'सारांश / टिप्पणीहरू',
          titlePlaceholder: 'कागजातको शीर्षक प्रविष्टि गर्नुहोस्',
          fiscalYearPlaceholder: 'आर्थिक वर्ष छान्नुहोस्',
          sourcePlaceholder: 'वित्तीय स्रोत छान्नुहोस्',
          grantTypePlaceholder: 'अनुदान प्रकार छान्नुहोस्',
          remarksPlaceholder: 'कुनै सारांश वा टिप्पणीहरू थप्नुहोस् (वैकल्पिक)',
        },
        document: {
          title: 'कागजात अपलोड',
          description: 'बहु-पृष्ठ स्क्यान गरिएका पिडीएफ वा तस्बिरहरू अपलोड गर्नुहोस्। तपाईं प्रत्येक खण्डमा एकै पटक धेरै फाइलहरू अपलोड गर्न सक्नुहुन्छ। (प्रत्येक खण्डको लागि वैकल्पिक)',
          a4Size: 'ए४ साइज',
          nepaliPaper: 'नेपाली कागज',
          extraSize: 'अतिरिक्त साइज',
          other: 'अन्य',
        },
        navigation: {
          back: 'पछाडि',
          next: 'अर्को',
          upload: 'फाइलहरू अपलोड गर्नुहोस्',
        },
      },
    },
    bin: {
      title: 'रिसाइकल बिन',
      subtitle: 'मेटिएका फाइल र फोल्डरहरू व्यवस्थापन गर्नुहोस्',
      restore: 'पुनर्स्थापना गर्नुहोस्',
      deleteForever: 'सदाका लागि मेट्नुहोस्',
      processing: 'प्रक्रियामा...',
      confirmRestore: 'वस्तुहरू पुनर्स्थापना गर्ने?',
      confirmDelete: 'सदाका लागि मेट्ने?',
      confirmRestoreMessage: 'के तपाईं चयन गरिएका वस्तुहरू पुनर्स्थापना गर्न निश्चित हुनुहुन्छ?',
      confirmDeleteMessage: 'यसले चयन गरिएका वस्तुहरूलाई स्थायी रूपमा मेट्नेछ। यो कार्य पूर्ववत गर्न सकिँदैन।',
      filters: {
        type: 'प्रकार',
        modified: 'परिमार्जित',
        source: 'स्रोत',
        fiscalYear: 'आर्थिक वर्ष',
        grantType: 'अनुदान प्रकार',
        options: {
          today: 'आज',
          yesterday: 'हिजो',
          last7Days: 'पछिल्लो ७ दिन',
          last30Days: 'पछिल्लो ३० दिन',
        },
      },
      emptyState: {
        noItems: 'कुनै मेटिएका वस्तुहरू भेटिएनन्',
        noItemsForFilter: 'चयन गरिएका फिल्टरहरूसँग मिल्ने कुनै वस्तुहरू छैनन्',
      },
    },
    reports: {
      title: 'प्रतिवेदनहरू',
      subtitle: 'विभिन्न प्रणाली प्रतिवेदनहरू उत्पन्न र डाउनलोड गर्नुहोस्',
      generateReport: 'प्रतिवेदन उत्पन्न गर्नुहोस्',
      reportType: 'प्रतिवेदन प्रकार',
      required: 'आवश्यक',
      fileFormat: 'फाइल प्रारूप',
      dateRange: 'मिति सीमा',
      startDate: 'सुरु मिति',
      endDate: 'अन्त्य मिति',
      fiscalYear: 'आर्थिक वर्ष',
      source: 'स्रोत',
      grantType: 'अनुदान प्रकार',
      generate: 'उत्पन्न गर्नुहोस्',
      generating: 'उत्पन्न हुँदैछ...',
      download: 'डाउनलोड गर्नुहोस्',
      delete: 'मेट्नुहोस्',
      deleteAll: 'सबै मेट्नुहोस्',
      confirmDelete: 'प्रतिवेदन मेट्ने?',
      confirmDeleteAll: 'सबै प्रतिवेदनहरू मेट्ने?',
      confirmDeleteMessage: 'के तपाईं यो प्रतिवेदन मेट्न निश्चित हुनुहुन्छ? यो कार्य पूर्ववत गर्न सकिँदैन।',
      confirmDeleteAllMessage: 'के तपाईं सबै प्रतिवेदनहरू मेट्न निश्चित हुनुहुन्छ? यो कार्य पूर्ववत गर्न सकिँदैन।',
      types: {
        fileCount: 'वर्ष अनुसार फाइलहरू',
        missingUploads: 'हराएका अपलोडहरू',
        custom: 'कस्टम प्रतिवेदन',
      },
      formats: {
        pdf: 'पिडीएफ',
        excel: 'एक्सेल',
      },
      errors: {
        selectReportType: 'कृपया प्रतिवेदन प्रकार छान्नुहोस्',
        selectEndDate: 'कृपया अन्त्य मिति छान्नुहोस्',
        selectStartDate: 'कृपया सुरु मिति छान्नुहोस्',
        invalidDateRange: 'सुरु मिति अन्त्य मितिभन्दा पहिले हुनुपर्छ',
        downloadFailed: 'प्रतिवेदन डाउनलोड गर्न सकिएन',
        deleteFailed: 'प्रतिवेदन मेट्न सकिएन',
        deleteAllFailed: 'प्रतिवेदनहरू मेट्न सकिएन',
        generateFailed: 'प्रतिवेदन उत्पन्न गर्न सकिएन',
      },
      success: {
        generated: 'प्रतिवेदन सफलतापूर्वक उत्पन्न गरियो',
        deleted: 'प्रतिवेदन सफलतापूर्वक मेटियो',
        deletedAll: 'सबै प्रतिवेदनहरू सफलतापूर्वक मेटियो',
        downloaded: 'प्रतिवेदन सफलतापूर्वक डाउनलोड गरियो',
      },
    },
  },
}; 