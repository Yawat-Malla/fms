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
    search: string;
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
    theme: string;
    language: {
      label: string;
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
    profile: {
      title: string;
      picture: string;
      pictureDescription: string;
      fullName: string;
      username: string;
      email: string;
      password: string;
      saveNote: string;
    };
    preferences: {
      title: string;
      description: string;
      general: string;
      notifications: string;
      fileUpdates: string;
      fileUpdatesDescription: string;
      securityAlerts: string;
      securityAlertsDescription: string;
      systemUpdates: string;
      systemUpdatesDescription: string;
    };
    admin: {
      title: string;
      description: string;
      accessDenied: string;
      accessDeniedDescription: string;
      siteSettings: string;
      siteName: string;
      siteLogo: string;
      maintenanceMode: string;
      maintenanceModeDescription: string;
    };
    danger: {
      title: string;
      description: string;
      resetSettings: string;
      resetSettingsDescription: string;
      resetSettingsConfirm: string;
      deleteAccount: string;
      deleteAccountDescription: string;
      deleteAccountConfirm: string;
      wipeData: string;
      wipeDataDescription: string;
      wipeDataConfirm: string;
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
      subtitle: string;
      steps: string[];
      metadata: {
        title: string;
        description: string;
        titleLabel: string;
        fiscalYearLabel: string;
        sourceLabel: string;
        grantTypeLabel: string;
        remarksLabel: string;
      };
      document: {
        title: string;
        description: string;
        a4Size: string;
        nepaliPaper: string;
        extraSize: string;
        other: string;
        maxSize: string;
        selectedFiles: string;
        orClick: string;
        supportedFormats: string;
        maxFiles: string;
      };
      buttons: {
        upload: string;
        cancel: string;
        next: string;
        back: string;
      };
      messages: {
        uploading: string;
        success: string;
        error: string;
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
    buttons: {
      generate: string;
      download: string;
      refresh: string;
    };
    messages: {
      generating: string;
      downloadSuccess: string;
      downloadError: string;
      noReports: string;
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
      search: 'Search files and folders...',
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
      subtitle: 'Manage your account settings and preferences',
      systemSettings: 'System Settings',
      theme: 'Theme',
      language: {
        label: 'Language',
        options: {
          en: 'English',
          ne: 'Nepali',
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
        save: 'Save Changes',
        cancel: 'Cancel',
      },
      profile: {
        title: 'Profile',
        picture: 'Change Picture',
        pictureDescription: 'Update your profile picture',
        fullName: 'Full Name',
        username: 'Username',
        email: 'Email',
        password: 'Password',
        saveNote: 'Changes will be applied after saving',
      },
      preferences: {
        title: 'Preferences',
        description: 'Customize your application preferences',
        general: 'General',
        notifications: 'Notifications',
        fileUpdates: 'File Updates',
        fileUpdatesDescription: 'Get notified when files are updated',
        securityAlerts: 'Security Alerts',
        securityAlertsDescription: 'Receive notifications about security-related events',
        systemUpdates: 'System Updates',
        systemUpdatesDescription: 'Stay informed about system updates and maintenance',
      },
      admin: {
        title: 'Admin Settings',
        description: 'Manage system-wide settings and configurations',
        accessDenied: 'Access Denied',
        accessDeniedDescription: 'You do not have permission to access admin settings',
        siteSettings: 'Site Settings',
        siteName: 'Site Name',
        siteLogo: 'Site Logo',
        maintenanceMode: 'Maintenance Mode',
        maintenanceModeDescription: 'Enable maintenance mode to restrict access',
      },
      danger: {
        title: 'Danger Zone',
        description: 'Irreversible and destructive actions',
        resetSettings: 'Reset Settings',
        resetSettingsDescription: 'Reset all settings to default values',
        resetSettingsConfirm: 'Are you sure you want to reset all settings? This action cannot be undone.',
        deleteAccount: 'Delete Account',
        deleteAccountDescription: 'Permanently delete your account and all associated data',
        deleteAccountConfirm: 'Are you sure you want to delete your account? This action cannot be undone.',
        wipeData: 'Wipe All Data',
        wipeDataDescription: 'Delete all data from the system (Admin only)',
        wipeDataConfirm: 'Are you sure you want to wipe all data? This action cannot be undone.',
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
        subtitle: 'Upload and manage your files',
        steps: [
          'Add Metadata',
          'Select Files',
          'Review & Upload'
        ],
        metadata: {
          title: 'File Metadata',
          description: 'Add additional information about your files',
          titleLabel: 'Title',
          fiscalYearLabel: 'Fiscal Year',
          sourceLabel: 'Source',
          grantTypeLabel: 'Grant Type',
          remarksLabel: 'Remarks'
        },
        document: {
          title: 'Document Upload',
          description: 'Drag and drop your files here',
          a4Size: 'A4 Size Documents',
          nepaliPaper: 'Nepali Paper Size Documents',
          extraSize: 'Extra Size Documents',
          other: 'Other Documents',
          maxSize: 'Max file size: 10MB',
          selectedFiles: 'Selected Files',
          orClick: 'or click to browse files',
          supportedFormats: 'Supported formats: PDF, Word, Excel, JPEG, PNG',
          maxFiles: 'Max files: {{count}}'
        },
        buttons: {
          upload: 'Upload',
          cancel: 'Cancel',
          next: 'Next',
          back: 'Back'
        },
        messages: {
          uploading: 'Uploading files...',
          success: 'Files uploaded successfully',
          error: 'Error uploading files'
        }
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
      buttons: {
        generate: 'Generate',
        download: 'Download',
        refresh: 'Refresh',
      },
      messages: {
        generating: 'Generating report...',
        downloadSuccess: 'Report downloaded successfully',
        downloadError: 'Error downloading report',
        noReports: 'No reports available',
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
      search: 'फाइल र फोल्डरहरू खोज्नुहोस्...',
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
      title: 'सेटिङहरू',
      subtitle: 'आफ्नो खाता सेटिङहरू र प्राथमिकताहरू व्यवस्थापन गर्नुहोस्',
      systemSettings: 'सिस्टम सेटिङहरू',
      theme: 'थिम',
      language: {
        label: 'भाषा',
        options: {
          en: 'अंग्रेजी',
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
        save: 'परिवर्तनहरू सेभ गर्नुहोस्',
        cancel: 'रद्द गर्नुहोस्',
      },
      profile: {
        title: 'प्रोफाइल',
        picture: 'तस्विर परिवर्तन गर्नुहोस्',
        pictureDescription: 'आफ्नो प्रोफाइल तस्विर अपडेट गर्नुहोस्',
        fullName: 'पूरा नाम',
        username: 'प्रयोगकर्ता नाम',
        email: 'इमेल',
        password: 'पासवर्ड',
        saveNote: 'परिवर्तनहरू सेभ गर्ने बित्तिकै लागू हुनेछन्',
      },
      preferences: {
        title: 'प्राथमिकताहरू',
        description: 'आफ्नो अनुप्रयोग प्राथमिकताहरू अनुकूलन गर्नुहोस्',
        general: 'सामान्य',
        notifications: 'सूचनाहरू',
        fileUpdates: 'फाइल अपडेटहरू',
        fileUpdatesDescription: 'फाइलहरू अपडेट हुँदा सूचित हुनुहोस्',
        securityAlerts: 'सुरक्षा सूचनाहरू',
        securityAlertsDescription: 'सुरक्षा सम्बन्धी घटनाहरूको बारेमा सूचना प्राप्त गर्नुहोस्',
        systemUpdates: 'सिस्टम अपडेटहरू',
        systemUpdatesDescription: 'सिस्टम अपडेट र मर्मत सम्भारको बारेमा जानकारी राख्नुहोस्',
      },
      admin: {
        title: 'व्यवस्थापक सेटिङहरू',
        description: 'सिस्टम व्यापी सेटिङहरू र कन्फिगरेसनहरू व्यवस्थापन गर्नुहोस्',
        accessDenied: 'पहुँच अस्वीकृत',
        accessDeniedDescription: 'तपाईंसँग व्यवस्थापक सेटिङहरूमा पहुँच गर्न अनुमति छैन',
        siteSettings: 'साइट सेटिङहरू',
        siteName: 'साइट नाम',
        siteLogo: 'साइट लोगो',
        maintenanceMode: 'मर्मत मोड',
        maintenanceModeDescription: 'पहुँच प्रतिबन्धित गर्न मर्मत मोड सक्रिय गर्नुहोस्',
      },
      danger: {
        title: 'खतरा क्षेत्र',
        description: 'अपरिवर्तनीय र विनाशकारी कार्यहरू',
        resetSettings: 'सेटिङहरू रिसेट गर्नुहोस्',
        resetSettingsDescription: 'सबै सेटिङहरू पूर्वनिर्धारित मानहरूमा रिसेट गर्नुहोस्',
        resetSettingsConfirm: 'के तपाईं सबै सेटिङहरू रिसेट गर्न निश्चित हुनुहुन्छ? यो कार्य पूर्ववत गर्न सकिँदैन।',
        deleteAccount: 'खाता मेटाउनुहोस्',
        deleteAccountDescription: 'आफ्नो खाता र सबै सम्बन्धित डाटा स्थायी रूपमा मेटाउनुहोस्',
        deleteAccountConfirm: 'के तपाईं आफ्नो खाता मेटाउन निश्चित हुनुहुन्छ? यो कार्य पूर्ववत गर्न सकिँदैन।',
        wipeData: 'सबै डाटा मेटाउनुहोस्',
        wipeDataDescription: 'सिस्टमबाट सबै डाटा मेटाउनुहोस् (व्यवस्थापक मात्र)',
        wipeDataConfirm: 'के तपाईं सबै डाटा मेटाउन निश्चित हुनुहुन्छ? यो कार्य पूर्ववत गर्न सकिँदैन।',
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
        subtitle: 'आफ्ना फाइलहरू अपलोड र व्यवस्थापन गर्नुहोस्',
        steps: [
          'मेटाडाटा थप्नुहोस्',
          'फाइलहरू चयन गर्नुहोस्',
          'समीक्षा गर्नुहोस् र अपलोड गर्नुहोस्'
        ],
        metadata: {
          title: 'फाइल मेटाडाटा',
          description: 'आफ्ना फाइलहरूको बारेमा अतिरिक्त जानकारी थप्नुहोस्',
          titleLabel: 'शीर्षक',
          fiscalYearLabel: 'आर्थिक वर्ष',
          sourceLabel: 'स्रोत',
          grantTypeLabel: 'अनुदान प्रकार',
          remarksLabel: 'टिप्पणीहरू'
        },
        document: {
          title: 'दस्तावेज अपलोड',
          description: 'आफ्ना फाइलहरू यहाँ तान्नुहोस् र छोड्नुहोस्',
          a4Size: 'ए४ साइज दस्तावेजहरू',
          nepaliPaper: 'नेपाली कागज साइज दस्तावेजहरू',
          extraSize: 'अतिरिक्त साइज दस्तावेजहरू',
          other: 'अन्य दस्तावेजहरू',
          maxSize: 'अधिकतम फाइल साइज: १० एमबी',
          selectedFiles: 'चयनित फाइलहरू',
          orClick: 'वा फाइलहरू ब्राउज गर्न क्लिक गर्नुहोस्',
          supportedFormats: 'समर्थित प्रारूपहरू: पीडीएफ, वर्ड, एक्सेल, जेपीईजी, पीएनजी',
          maxFiles: 'अधिकतम फाइलहरू: {{count}}'
        },
        buttons: {
          upload: 'अपलोड गर्नुहोस्',
          cancel: 'रद्द गर्नुहोस्',
          next: 'अर्को',
          back: 'पछाडि'
        },
        messages: {
          uploading: 'फाइलहरू अपलोड गर्दै...',
          success: 'फाइलहरू सफलतापूर्वक अपलोड भयो',
          error: 'फाइलहरू अपलोड गर्दा त्रुटि भयो'
        }
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
      subtitle: 'सिस्टम प्रतिवेदनहरू तयार पार्न र डाउनलोड गर्नुहोस्',
      generateReport: 'प्रतिवेदन तयार पार्नुहोस्',
      reportType: 'प्रतिवेदन प्रकार',
      required: 'आवश्यक',
      fileFormat: 'फाइल ढाँचा',
      dateRange: 'मिति सीमा',
      startDate: 'सुरु मिति',
      endDate: 'अन्त्य मिति',
      fiscalYear: 'आर्थिक वर्ष',
      source: 'स्रोत',
      grantType: 'अनुदान प्रकार',
      generate: 'तयार पार्नुहोस्',
      generating: 'प्रतिवेदन तयार पार्दै...',
      download: 'डाउनलोड गर्नुहोस्',
      delete: 'मेट्नुहोस्',
      deleteAll: 'सबै मेट्नुहोस्',
      confirmDelete: 'प्रतिवेदन मेट्ने?',
      confirmDeleteAll: 'सबै प्रतिवेदनहरू मेट्ने?',
      confirmDeleteMessage: 'के तपाईं यो प्रतिवेदन मेट्न निश्चित हुनुहुन्छ? यो कार्य पूर्ववत गर्न सकिँदैन।',
      confirmDeleteAllMessage: 'के तपाईं सबै प्रतिवेदनहरू मेट्न निश्चित हुनुहुन्छ? यो कार्य पूर्ववत गर्न सकिँदैन।',
      types: {
        fileCount: 'वर्ष अनुसार फाइलहरू',
        missingUploads: 'नहिचलेका अपलोडहरू',
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
        generateFailed: 'प्रतिवेदन तयार पार्न सकिएन',
      },
      success: {
        generated: 'प्रतिवेदन सफलतापूर्वक उत्पन्न गरियो',
        deleted: 'प्रतिवेदन सफलतापूर्वक मेटियो',
        deletedAll: 'सबै प्रतिवेदनहरू सफलतापूर्वक मेटियो',
        downloaded: 'प्रतिवेदन सफलतापूर्वक डाउनलोड गरियो',
      },
      buttons: {
        generate: 'तयार पार्नुहोस्',
        download: 'डाउनलोड गर्नुहोस्',
        refresh: 'ताजा पार्नुहोस्',
      },
      messages: {
        generating: 'प्रतिवेदन तयार पार्दै...',
        downloadSuccess: 'प्रतिवेदन सफलतापूर्वक डाउनलोड भयो',
        downloadError: 'प्रतिवेदन डाउनलोड गर्दा त्रुटि भयो',
        noReports: 'कुनै प्रतिवेदन उपलब्ध छैन',
      },
    },
  },
}; 