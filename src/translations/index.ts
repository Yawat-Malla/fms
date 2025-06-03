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
    };
    table: {
      name: string;
      type: string;
      size: string;
      uploadedBy: string;
      uploadedAt: string;
      status: string;
      actions: string;
    };
    upload: {
      title: string;
      button: string;
      dragAndDrop: string;
      or: string;
      browse: string;
      toUpload: string;
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
      },
      table: {
        name: 'Name',
        type: 'Type',
        size: 'Size',
        uploadedBy: 'Uploaded By',
        uploadedAt: 'Uploaded At',
        status: 'Status',
        actions: 'Actions',
      },
      upload: {
        title: 'Upload Files',
        button: 'Upload',
        dragAndDrop: 'Drag and drop files here',
        or: 'or',
        browse: 'browse',
        toUpload: 'to upload',
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
      },
      table: {
        name: 'नाम',
        type: 'प्रकार',
        size: 'साइज',
        uploadedBy: 'अपलोड गर्ने',
        uploadedAt: 'अपलोड मिति',
        status: 'स्थिति',
        actions: 'कार्यहरू',
      },
      upload: {
        title: 'फाइलहरू अपलोड गर्नुहोस्',
        button: 'अपलोड गर्नुहोस्',
        dragAndDrop: 'फाइलहरू यहाँ तान्नुहोस् र छोड्नुहोस्',
        or: 'वा',
        browse: 'ब्राउज गर्नुहोस्',
        toUpload: 'अपलोड गर्न',
      },
    },
  },
}; 